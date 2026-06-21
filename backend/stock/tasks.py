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
from stock.workers.get_income_statement import MyIncomeStatement
from stock.workers.get_insider_trades import InsiderTradeWorker
from stock.workers.get_news import MyNewsWorker
from stock.workers.get_summary import MySummary
from stock.workers.get_valuation_ratio import MyValuationRatio


@app.task(queue="summary")
def __summary_consumer(whatever, symbol):
    crawler = MySummary(symbol)
    crawler.get()


@app.task(queue="statement", rate_limit="12/m")
def __balance_sheet_consumer(whatever, symbol):
    crawler = MyBalanceSheet(symbol)
    crawler.get()


@app.task(queue="statement", rate_limit="12/m")
def __income_statement_consumer(whatever, symbol):
    crawler = MyIncomeStatement(symbol)
    crawler.get()


@app.task(queue="statement", rate_limit="12/m")
def __cash_flow_statement_consumer(whatever, symbol):
    crawler = MyCashFlowStatement(symbol)
    crawler.get()


@app.task(queue="summary", rate_limit="12/m")
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


@app.task(queue="price", rate_limit="12/m")
def __price_single(symbol):
    
    MyStockHistoricalYahoo(symbol).parser()
    _update_historical_denorm(symbol)


@app.task(queue="statement")
def statement_daily():
    from celery import group

    tasks = group(
        __statement_single.s(stock.symbol) for stock in MyStock.objects.all()
    )
    tasks.apply_async()


@app.task(queue="statement", rate_limit="12/m")
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


@app.task(queue="edgar", rate_limit="8/m")
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


@app.task(queue="macro")
def fred_weekly():
    """Refresh all FRED macro series."""
    FredWorker().get_all()


@app.task(queue="alpha")
def earnings_calendar_daily():
    """Fetch 3-month earnings calendar (1 API call)."""
    EarningsCalendarWorker().get()


@app.task(queue="alpha", rate_limit="5/m")
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


@app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        600.0, price_daily.s(), name="Get price every 10 minutes"
    )
    sender.add_periodic_task(crontab(hour=0, minute=0), statement_daily.s())
    sender.add_periodic_task(
        21600.0, rebuild_ranking_cache.s(), name="Rebuild rankings every 6 hours"
    )
    sender.add_periodic_task(
        crontab(hour=6, minute=0), insider_daily.s(), name="Fetch insider trades daily at 6AM"
    )
    sender.add_periodic_task(
        crontab(hour=6, minute=0, day_of_week=0),
        fred_weekly.s(),
        name="Fetch FRED macro data weekly on Sunday",
    )
    sender.add_periodic_task(
        crontab(hour=7, minute=0),
        earnings_calendar_daily.s(),
        name="Fetch earnings calendar daily at 7AM",
    )
    # )
