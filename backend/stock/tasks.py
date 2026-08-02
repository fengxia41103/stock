from datetime import date, timedelta

from celery import chain
from celery.schedules import crontab
from django.contrib.auth.models import User
from django.db import transaction

from fin.celery import app
from stock.models import MyNews, MyStock, MyTask
from stock.workers.get_balance_sheet import MyBalanceSheet
from stock.workers.get_cash_flow_statement import MyCashFlowStatement
from stock.workers.get_earnings import EarningsCalendarWorker, EarningsSurpriseWorker
from stock.workers.get_fred import FredWorker
from stock.workers.get_historical import MyStockHistoricalYahoo
from stock.workers.get_holdings import InstitutionalHoldingsWorker
from stock.workers.get_income_statement import MyIncomeStatement
from stock.workers.get_insider_trades import InsiderTradeWorker
from stock.workers.get_news import MyNewsWorker
from stock.workers.get_stock_news import StockNewsWorker
from stock.workers.get_summary import MySummary
from stock.workers.get_valuation_ratio import MyValuationRatio


@app.task(queue="summary")
def __summary_consumer(whatever, symbol):
    crawler = MySummary(symbol)
    crawler.get()


@app.task(queue="statement")
def __balance_sheet_consumer(whatever, symbol):
    crawler = MyBalanceSheet(symbol)
    crawler.get()


@app.task(queue="statement")
def __income_statement_consumer(whatever, symbol):
    crawler = MyIncomeStatement(symbol)
    crawler.get()


@app.task(queue="statement")
def __cash_flow_statement_consumer(whatever, symbol):
    crawler = MyCashFlowStatement(symbol)
    crawler.get()


@app.task(queue="summary")
def __valuation_ratio_consumer(whatever, symbol):
    crawler = MyValuationRatio(symbol)
    crawler.get()


@app.task(queue="price")
def __yahoo_consumer(symbol):
    
    
    MyStockHistoricalYahoo(symbol).parser()


def batch_update_helper(user, symbol):
    """Helper function to build stock scan tasks.

    Arguments
    ---------

      user: `User`: Requesting user. This will be logged into the task object.
      symbol: string: Stock symbol.

    Return
    ------
      None
    """
    # get price
    get_prices = chain(__yahoo_consumer.s(symbol), __summary_consumer.s(symbol))

    # get statements
    get_statements = chain(
        __balance_sheet_consumer.s(None, symbol),
        __income_statement_consumer.s(symbol),
        __cash_flow_statement_consumer.s(symbol),
        __valuation_ratio_consumer.s(symbol),
    )

    # https://stackoverflow.com/questions/42620917/immediately-access-django-celery-results-taskresult-after-starting
    task_1 = get_prices.apply_async()
    task_2 = get_statements.apply_async()

    # save task
    for task in [task_1, task_2]:
        saved_task = MyTask(id=task.id, state=task.state, user=user)
        saved_task.save()
        saved_task.stocks.add(MyStock.objects.get(symbol=symbol))


@app.task(queue="price")
def price_daily():
    from celery import group

    tasks = group(
        __price_single.s(stock.symbol) for stock in MyStock.objects.all()
    )
    tasks.apply_async()


@app.task(queue="price")
def __price_single(symbol):
    
    MyStockHistoricalYahoo(symbol).parser()
    _update_historical_denorm(symbol)
    # Also fetch news
    try:
        StockNewsWorker(symbol).get()
    except Exception:
        pass


@app.task(queue="statement")
def statement_daily():
    from celery import group

    tasks = group(
        __statement_single.s(stock.symbol) for stock in MyStock.objects.all()
    )
    tasks.apply_async()


@app.task(queue="statement")
def __statement_single(symbol):
    try:
        MySummary(symbol).get()
        MyBalanceSheet(symbol).get()
        MyIncomeStatement(symbol).get()
        MyCashFlowStatement(symbol).get()
        MyValuationRatio(symbol).get()
        _update_stock_denorm(symbol)
    except Exception as e:
        print(f"[statement_daily] {symbol} failed: {e}")


@app.task(queue="summary")
def rebuild_ranking_cache():
    """Rebuild all ranking caches."""
    from stock.management.commands._ranking_helpers import compute_all_rankings
    from stock.models import RankingCache

    results = compute_all_rankings()
    for rank_type, data in results.items():
        RankingCache.objects.update_or_create(rank_type=rank_type, defaults={"data": data})


def _update_historical_denorm(symbol):
    """Recompute denormalized fields for recent historicals."""
    stock = MyStock.objects.get(symbol=symbol)
    historicals = list(
        stock.historicals.order_by("on").values_list("id", "on", "open_price", "close_price", "vol")
    )
    if not historicals:
        return

    from stock.models import MyStockHistorical

    closes = [(h[1], h[3]) for h in historicals]
    # Only update last 10 records
    for idx in range(max(0, len(historicals) - 10), len(historicals)):
        pk, on, open_price, close_price, vol = historicals[idx]
        vos = vol / stock.shares_outstanding * 0.001 if stock.shares_outstanding else 0

        last_lower = 0
        for j in range(idx - 1, -1, -1):
            if closes[j][1] < close_price:
                last_lower = idx - j
                break

        last_better = 0
        for j in range(idx - 1, -1, -1):
            if closes[j][1] > close_price:
                last_better = idx - j
                break

        MyStockHistorical.objects.filter(id=pk).update(
            d_last_lower=last_lower,
            d_last_better=last_better,
            d_vol_over_share_outstanding=round(vos, 4),
        )

    # Update stock-level denorm
    latest = stock.historicals.order_by("-on").first()
    if latest:
        stock.d_last_lower = latest.d_last_lower
        stock.d_last_better = latest.d_last_better
        stock.save(update_fields=["d_last_lower", "d_last_better"])


def _update_stock_denorm(symbol):
    """Update MyStock denormalized valuation fields."""
    stock = MyStock.objects.get(symbol=symbol)
    ratio = stock.ratios.filter(pe__gt=0).order_by("-on").first()
    stock.d_pe = ratio.pe if ratio else None
    ratio = stock.ratios.filter(pb__gt=0).order_by("-on").first()
    stock.d_pb = ratio.pb if ratio else None
    ratio = stock.ratios.filter(ps__gt=0).order_by("-on").first()
    stock.d_ps = ratio.ps if ratio else None

    balance = stock.balances.order_by("-on").first()
    hist = stock.historicals.order_by("-on").first()
    if balance and hist:
        cash_per_share = balance.cash_and_cash_equivalent_per_share
        if hist.close_price and cash_per_share:
            stock.d_price_to_cash_premium = hist.close_price / cash_per_share

    stock.save(update_fields=["d_pe", "d_pb", "d_ps", "d_price_to_cash_premium"])


@app.task(queue="edgar")
def __insider_trade_consumer(symbol):
    InsiderTradeWorker(symbol).get()


@app.task(queue="edgar")
def insider_daily():
    """Fetch insider trades for all stocks."""
    from celery import group

    tasks = group(
        __insider_trade_consumer.s(stock.symbol) for stock in MyStock.objects.all()
    )
    tasks.apply_async()


@app.task(queue="edgar")
def __holdings_consumer(symbol):
    InstitutionalHoldingsWorker(symbol).get()


@app.task(queue="edgar")
def holdings_quarterly():
    """Fetch institutional holdings for all stocks (run quarterly)."""
    from celery import group

    tasks = group(
        __holdings_consumer.s(stock.symbol) for stock in MyStock.objects.all()
    )
    tasks.apply_async()


@app.task(queue="macro")
def fred_weekly():
    """Refresh all FRED macro series."""
    FredWorker().get_all()


@app.task(queue="alpha")
def earnings_calendar_daily():
    """Fetch 3-month earnings calendar (1 API call)."""
    EarningsCalendarWorker().get()


@app.task(queue="alpha")
def __earnings_surprise_consumer(symbol):
    EarningsSurpriseWorker(symbol).get()


@app.task(queue="alpha")
def earnings_surprise_batch():
    """Fetch surprise data for all stocks (spread over days due to rate limit)."""
    from celery import group

    tasks = group(
        __earnings_surprise_consumer.s(stock.symbol)
        for stock in MyStock.objects.all()
    )
    tasks.apply_async()


@app.task(queue="alpha")
def earnings_surprise_daily_rotation():
    """Rotate through 12 stocks/day for earnings surprise backfill.
    
    Alpha Vantage free tier: 25 calls/day. Calendar uses 1, so 24 left.
    12 stocks/day means all 47 stocks covered in 4 days.
    Uses Redis counter to track rotation position.
    """
    from django.core.cache import cache

    stocks = list(MyStock.objects.order_by("symbol").values_list("symbol", flat=True))
    total = len(stocks)
    if total == 0:
        return

    batch_size = 12
    offset = cache.get("earnings_surprise_offset", 0)

    # Get this day's batch
    batch = []
    for i in range(batch_size):
        idx = (offset + i) % total
        batch.append(stocks[idx])

    # Advance offset for next run
    cache.set("earnings_surprise_offset", (offset + batch_size) % total, 86400 * 7)

    # Execute sequentially (respect rate limit)
    for symbol in batch:
        try:
            EarningsSurpriseWorker(symbol).get()
        except Exception:
            continue


@app.task(queue="news")
def get_news():
    for t in [
        "news",
        "economics",
        "finance",
        "business",
        "politics",
        "tech",
        "science",
        "world",
    ]:
        w = MyNewsWorker(t)
        w.get()


@app.task(queue="news")
def remove_old_news():
    """Remove news older than 24 hours.

    There is no point to read old news since I'm not going to process
    them well.
    """
    end = date.today() - timedelta(hours=12)
    MyNews.objects.filter(pub_time__lte=end).delete()


def _is_market_hours():
    """Check if US market is currently open or in pre/post market."""
    from datetime import datetime
    from zoneinfo import ZoneInfo
    et = datetime.now(ZoneInfo("America/New_York"))
    weekday = et.weekday()  # 0=Mon, 6=Sun
    hour = et.hour
    minute = et.minute
    time_val = hour * 60 + minute

    if weekday >= 5:  # Weekend
        return "off"
    if 570 <= time_val <= 960:  # 9:30-16:00 ET
        return "market"
    if 420 <= time_val < 570 or 960 < time_val <= 1080:  # 7:00-9:30, 16:00-18:00
        return "extended"
    return "off"


@app.task(queue="price")
def price_smart():
    """Smart price fetch — frequency adapts to market hours.
    
    Called every 5 min by beat. Skips based on time:
    - Market hours: always run
    - Pre/post market: run every 3rd call (~15 min)
    - Off hours: run every 24th call (~2 hours)
    """
    from django.core.cache import cache

    session = _is_market_hours()
    counter = cache.get("price_smart_counter", 0) + 1
    cache.set("price_smart_counter", counter, 86400)

    should_run = False
    if session == "market":
        should_run = True
    elif session == "extended":
        should_run = (counter % 3 == 0)
    else:  # off hours
        should_run = (counter % 24 == 0)

    if should_run:
        price_daily()
        check_alerts.delay()


@app.task(queue="price")
def check_alerts():
    """Evaluate all active alerts against latest data."""
    from datetime import date, timedelta
    from stock.models.alert import Alert, AlertEvent
    from stock.models import MyStock, MyStockHistorical

    active_alerts = Alert.objects.filter(is_active=True).select_related("stock")

    for alert in active_alerts:
        stock = alert.stock
        triggered = False
        value = None
        message = ""

        try:
            if alert.alert_type == "rsi_below":
                # Check RSI from last 15 closes
                closes = list(
                    MyStockHistorical.objects.filter(stock=stock)
                    .order_by("-on")[:15]
                    .values_list("close_price", flat=True)
                )
                if len(closes) >= 15:
                    closes = list(reversed(closes))
                    from stock.backtesting.indicators import rsi
                    current_rsi = rsi(closes)
                    if current_rsi < alert.threshold:
                        triggered = True
                        value = current_rsi
                        message = f"{stock.symbol} RSI is {current_rsi:.1f} (below {alert.threshold})"

            elif alert.alert_type == "price_below":
                latest = MyStockHistorical.objects.filter(stock=stock).order_by("-on").first()
                if latest and latest.close_price < alert.threshold:
                    triggered = True
                    value = latest.close_price
                    message = f"{stock.symbol} price ${latest.close_price:.2f} below ${alert.threshold:.2f}"

            elif alert.alert_type == "price_above":
                latest = MyStockHistorical.objects.filter(stock=stock).order_by("-on").first()
                if latest and latest.close_price > alert.threshold:
                    triggered = True
                    value = latest.close_price
                    message = f"{stock.symbol} price ${latest.close_price:.2f} above ${alert.threshold:.2f}"

            elif alert.alert_type == "insider_buy":
                # Check if 3+ insiders bought in last 14 days
                from stock.models import InsiderTrade
                cutoff = date.today() - timedelta(days=14)
                buyers = InsiderTrade.objects.filter(
                    stock=stock, trade_date__gte=cutoff, transaction_type="P"
                ).values_list("insider_cik", flat=True).distinct().count()
                if buyers >= alert.threshold:
                    triggered = True
                    value = buyers
                    message = f"{stock.symbol} has {buyers} insider buyers in last 14 days"

            elif alert.alert_type == "earnings_soon":
                from stock.models import EarningsEvent
                upcoming = EarningsEvent.objects.filter(
                    stock=stock,
                    report_date__gte=date.today(),
                    report_date__lte=date.today() + timedelta(days=int(alert.threshold)),
                ).first()
                if upcoming:
                    days_away = (upcoming.report_date - date.today()).days
                    triggered = True
                    value = days_away
                    message = f"{stock.symbol} earnings in {days_away} days ({upcoming.report_date})"

            elif alert.alert_type == "drop_days":
                # Use d_last_lower denormalized field
                if stock.d_last_lower and stock.d_last_lower >= alert.threshold:
                    triggered = True
                    value = stock.d_last_lower
                    message = f"{stock.symbol} has dropped {stock.d_last_lower} days of ground (threshold: {int(alert.threshold)})"

        except Exception:
            continue

        if triggered:
            # Avoid duplicate triggers within 24h
            recent = AlertEvent.objects.filter(
                alert=alert, triggered_at__gte=date.today()
            ).exists()
            if not recent:
                AlertEvent.objects.create(alert=alert, value=value or 0, message=message)


@app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    # Price: every 5 min (smart task skips when outside market hours)
    sender.add_periodic_task(
        300.0, price_smart.s(), name="Smart price fetch (every 5 min, skips off-hours)"
    )
    # Statements: weekly on Sunday at midnight (financial statements rarely change intra-week)
    sender.add_periodic_task(
        crontab(hour=0, minute=0, day_of_week=0),
        statement_daily.s(),
        name="Fetch statements weekly on Sunday",
    )
    # Rankings: every 6 hours
    sender.add_periodic_task(
        21600.0, rebuild_ranking_cache.s(), name="Rebuild rankings every 6 hours"
    )
    # Insider trades: daily at 6AM ET (Mon-Fri only)
    sender.add_periodic_task(
        crontab(hour=6, minute=0, day_of_week="1-5"),
        insider_daily.s(),
        name="Fetch insider trades daily at 6AM (weekdays)",
    )
    # FRED macro: weekly on Sunday at 6AM
    sender.add_periodic_task(
        crontab(hour=6, minute=0, day_of_week=0),
        fred_weekly.s(),
        name="Fetch FRED macro data weekly on Sunday",
    )
    # Earnings calendar: daily at 7AM ET (weekdays only)
    sender.add_periodic_task(
        crontab(hour=7, minute=0, day_of_week="1-5"),
        earnings_calendar_daily.s(),
        name="Fetch earnings calendar daily at 7AM (weekdays)",
    )
    # Earnings surprise backfill: daily at 8AM ET (weekdays), 12 stocks/day rotation
    sender.add_periodic_task(
        crontab(hour=8, minute=0, day_of_week="1-5"),
        earnings_surprise_daily_rotation.s(),
        name="Backfill earnings surprises (12 stocks/day rotation)",
    )


# --- Backtesting tasks ---


@app.task(queue="backtest", bind=True)
def run_backtest_task(self, result_id, strategy_name, symbols, start_date, end_date, initial_cash, strategy_params):
    """Run a single backtest asynchronously."""
    from django.utils import timezone
    from stock.backtesting.engine import BacktestEngine
    from stock.backtesting.strategies import STRATEGY_REGISTRY
    from stock.models.backtest import BacktestResult

    result_obj = BacktestResult.objects.get(id=result_id)
    result_obj.state = "RUNNING"
    result_obj.progress = 10
    result_obj.save(update_fields=["state", "progress"])

    try:
        strategy_class = STRATEGY_REGISTRY[strategy_name]

        # Convert pct params
        for key in ["profit_target", "stop_loss"]:
            if key in strategy_params and strategy_params[key] > 1:
                strategy_params[key] = strategy_params[key] / 100.0

        strategy = strategy_class(**strategy_params)
        engine = BacktestEngine(strategy, symbols, start_date, end_date, initial_cash)
        result = engine.run()

        result_obj.state = "SUCCESS"
        result_obj.progress = 100
        result_obj.result = result
        result_obj.completed = timezone.now()
        result_obj.save()
    except Exception as e:
        result_obj.state = "FAILURE"
        result_obj.error = str(e)
        result_obj.save(update_fields=["state", "error"])


@app.task(queue="backtest", bind=True)
def run_optimize_task(self, result_id, strategy_name, symbols, start_date, end_date, initial_cash):
    """Run parameter optimization asynchronously with progress updates."""
    from itertools import product
    from django.utils import timezone
    from stock.backtesting.engine import BacktestEngine
    from stock.backtesting.strategies import STRATEGY_REGISTRY
    from stock.models.backtest import BacktestResult

    result_obj = BacktestResult.objects.get(id=result_id)
    result_obj.state = "RUNNING"
    result_obj.save(update_fields=["state"])

    try:
        strategy_class = STRATEGY_REGISTRY[strategy_name]
        schema = strategy_class.params_schema()

        if not schema:
            # No params to optimize
            strategy = strategy_class()
            engine = BacktestEngine(strategy, symbols, start_date, end_date, initial_cash)
            r = engine.run()
            result_obj.state = "SUCCESS"
            result_obj.progress = 100
            result_obj.result = {"best_params": {}, "best_return": r["total_return_pct"], "top_10": [r], "combinations_tested": 1}
            result_obj.completed = timezone.now()
            result_obj.save()
            return

        # Build grid: 3 steps per parameter
        param_ranges = {}
        for p in schema:
            lo, hi = p["min"], p["max"]
            if p["type"] == "float":
                steps = [round(lo + i * (hi - lo) / 2, 1) for i in range(3)]
            elif p["type"] == "pct":
                steps = [round(lo + i * (hi - lo) / 2) for i in range(3)]
            else:
                steps = [int(lo + i * (hi - lo) / 2) for i in range(3)]
            param_ranges[p["key"]] = steps

        keys = list(param_ranges.keys())
        all_combos = list(product(*[param_ranges[k] for k in keys]))
        max_combos = 30
        if len(all_combos) > max_combos:
            step = len(all_combos) // max_combos
            all_combos = all_combos[::step][:max_combos]

        results_list = []
        for i, combo in enumerate(all_combos):
            # Update progress
            result_obj.progress = int((i + 1) / len(all_combos) * 100)
            result_obj.save(update_fields=["progress"])

            strategy_params = dict(zip(keys, combo))
            run_params = dict(strategy_params)
            for p in schema:
                if p["type"] == "pct" and p["key"] in run_params:
                    run_params[p["key"]] = run_params[p["key"]] / 100.0

            try:
                strategy = strategy_class(**run_params)
                engine = BacktestEngine(strategy, symbols, start_date, end_date, initial_cash)
                r = engine.run()
                results_list.append({
                    "params": strategy_params,
                    "total_return_pct": r["total_return_pct"],
                    "sharpe_ratio": r["sharpe_ratio"],
                    "win_rate_pct": r["win_rate_pct"],
                    "max_drawdown_pct": r["max_drawdown_pct"],
                    "total_trades": r["total_trades"],
                    "profit_factor": r["profit_factor"],
                })
            except Exception:
                continue

        results_list.sort(key=lambda x: x["total_return_pct"], reverse=True)
        best = results_list[0] if results_list else {"params": {}, "total_return_pct": 0}

        result_obj.state = "SUCCESS"
        result_obj.progress = 100
        result_obj.result = {
            "strategy": strategy_name,
            "best_params": best.get("params", {}),
            "best_return": best.get("total_return_pct", 0),
            "best_sharpe": best.get("sharpe_ratio", 0),
            "combinations_tested": len(results_list),
            "top_10": results_list[:10],
            "worst_5": results_list[-5:] if len(results_list) >= 5 else [],
        }
        result_obj.completed = timezone.now()
        result_obj.save()
    except Exception as e:
        result_obj.state = "FAILURE"
        result_obj.error = str(e)
        result_obj.save(update_fields=["state", "error"])
