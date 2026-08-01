"""
Live stock analysis report generator.

Computes all metrics from DB on demand — Darwin, Graham, Box Trading, Financials.
Returns structured dict for API serialization.
"""

import math
from datetime import date, timedelta


def generate_report(stock):
    """Generate full analysis report from live DB data."""
    report = {
        "symbol": stock.symbol,
        "name": stock.name or stock.symbol,
        "generated_at": date.today().isoformat(),
    }

    report["basic"] = _basic(stock)
    report["graham"] = _graham(stock)
    report["darwin"] = _darwin(stock)
    report["dupont"] = _dupont(stock)
    report["financials"] = _financials(stock)
    report["earnings"] = _earnings(stock)
    report["insiders"] = _insiders(stock)
    report["technicals"] = _technicals(stock)
    report["verdict"] = _verdict(report)

    return report


def _basic(stock):
    return {
        "price": stock.latest_close_price,
        "pe": stock.pe,
        "pb": stock.pb,
        "ps": stock.ps,
        "roe": stock.roe,
        "roa": stock.roa,
        "beta": stock.beta,
        "profit_margin": stock.profit_margin,
        "shares_outstanding": stock.shares_outstanding,
        "last_lower": stock.last_lower,
        "last_better": stock.last_better,
        "institution_count": stock.institution_count,
        "ocf_ni_ratio": stock.ocf_ni_ratio,
        "fcf_ni_ratio": stock.fcf_ni_ratio,
    }


def _graham(stock):
    return {
        "score": stock.graham_score,
        "number": stock.graham_number,
        "intrinsic_value": stock.graham_intrinsic_value,
        "margin_of_safety": stock.graham_margin_of_safety,
        "pe_pb_product": stock.pe_pb_product,
        "net_net_ratio": stock.net_net_ratio,
    }


def _darwin(stock):
    cs = stock.cross_statements_model
    roce_vals = [item["roce"] for item in cs if item["roce"] > 0]
    avg_roce = sum(roce_vals) / len(roce_vals) if roce_vals else 0
    all_above_15 = all(r > 15 for r in roce_vals) if roce_vals else False

    return {
        "roce_latest": roce_vals[-1] if roce_vals else None,
        "roce_avg": round(avg_roce, 1),
        "roce_all_above_15": all_above_15,
        "roce_periods": len(roce_vals),
        "insider_sentiment": stock.insider_sentiment_3m,
        "earnings_beat_rate": stock.earnings_beat_rate,
    }


def _dupont(stock):
    dm = stock.dupont_model
    valid = [d for d in dm if d["roe"] != 0]
    if not valid:
        return None
    latest = valid[-1]
    return {
        "date": str(latest["on"]),
        "roe": round(latest["roe"], 1),
        "net_margin": round(latest["net_profit_margin"], 1),
        "asset_turnover": round(latest["asset_turnover"], 1),
        "equity_multiplier": round(latest["equity_multiplier"], 2),
    }


def _financials(stock):
    # Income trend
    incomes = []
    for i in stock.incomes.filter(total_revenue__gt=0).order_by("-on")[:6]:
        incomes.append({
            "date": str(i.on),
            "revenue": i.total_revenue,
            "net_income": i.net_income,
            "eps": i.basic_eps,
            "margin": round(i.net_income_to_revenue, 1) if i.net_income_to_revenue else None,
        })

    # Balance sheet
    b = stock.balances.order_by("-on").first()
    balance = None
    if b:
        balance = {
            "date": str(b.on),
            "total_assets": b.total_assets,
            "current_assets": b.current_assets,
            "total_debt": b.total_debt,
            "equity": b.stockholders_equity,
            "working_capital": b.working_capital,
            "cash": b.cash_and_cash_equivalent,
            "current_ratio": round(b.current_ratio, 2) if b.current_ratio else None,
            "debt_to_equity": round(b.debt_to_equity_ratio, 2) if b.debt_to_equity_ratio else None,
        }

    # Cash flow
    cash_flows = []
    for c in stock.cashes.order_by("-on")[:4]:
        cash_flows.append({
            "date": str(c.on),
            "fcf": c.free_cash_flow,
            "ocf": c.operating_cash_flow,
            "capex": c.capex,
        })

    return {"income": incomes, "balance": balance, "cash_flow": cash_flows}


def _earnings(stock):
    events = []
    for e in stock.earnings_events.order_by("-report_date")[:8]:
        events.append({
            "date": str(e.report_date),
            "estimated": e.estimated_eps,
            "reported": e.reported_eps,
            "surprise_pct": e.surprise_pct,
        })
    return events


def _insiders(stock):
    trades = []
    for t in stock.insider_trades.order_by("-trade_date")[:10]:
        trades.append({
            "date": str(t.trade_date),
            "name": t.insider_name,
            "title": t.insider_title,
            "type": t.transaction_type,
            "shares": t.shares,
            "value": t.total_value,
        })
    return trades


def _technicals(stock):
    prices = list(
        stock.historicals.order_by("-on")[:60].values_list("close_price", flat=True)
    )
    prices.reverse()

    if len(prices) < 14:
        return {"insufficient_data": True}

    hi, lo, cur = max(prices), min(prices), prices[-1]
    position = (cur - lo) / (hi - lo) * 100 if hi != lo else 50

    # RSI(14)
    gains, losses = [], []
    for i in range(1, min(15, len(prices))):
        change = prices[-i] - prices[-(i + 1)]
        (gains if change > 0 else losses).append(abs(change))
    avg_gain = sum(gains) / 14
    avg_loss = sum(losses) / 14 if losses else 0.001
    rsi = 100 - (100 / (1 + avg_gain / avg_loss))

    ret_5d = (prices[-1] / prices[-6] - 1) * 100 if len(prices) >= 6 else None
    ret_20d = (prices[-1] / prices[-21] - 1) * 100 if len(prices) >= 21 else None

    return {
        "high_60d": hi,
        "low_60d": lo,
        "current": cur,
        "range_pct": round((hi - lo) / lo * 100, 1),
        "position_in_range": round(position, 0),
        "rsi": round(rsi, 1),
        "return_5d": round(ret_5d, 1) if ret_5d else None,
        "return_20d": round(ret_20d, 1) if ret_20d else None,
    }


def _verdict(report):
    darwin = report["darwin"]
    graham = report["graham"]
    tech = report["technicals"]

    # Darwin verdict
    if darwin["roce_all_above_15"] and darwin["roce_avg"] > 20:
        darwin_v = "PASS"
    elif darwin["roce_avg"] > 15:
        darwin_v = "BORDERLINE"
    else:
        darwin_v = "FAIL"

    # Graham verdict
    gs = graham["score"] or 0
    if gs >= 5:
        graham_v = "PASS"
    elif gs >= 3:
        graham_v = "FAIR"
    else:
        graham_v = "FAIL"

    # Timing verdict
    rsi = tech.get("rsi")
    if rsi is None:
        timing_v = "NO_DATA"
    elif rsi < 30:
        timing_v = "OVERSOLD_BUY"
    elif rsi < 40:
        timing_v = "APPROACHING_BUY"
    elif rsi > 70:
        timing_v = "OVERBOUGHT_AVOID"
    elif rsi > 60:
        timing_v = "HIGH_CAUTION"
    else:
        timing_v = "NEUTRAL"

    # Combined
    if darwin_v == "PASS" and timing_v in ("OVERSOLD_BUY", "APPROACHING_BUY"):
        combined = "BUY"
    elif darwin_v == "PASS" and graham_v in ("PASS", "FAIR") and timing_v == "NEUTRAL":
        combined = "WATCH"
    elif darwin_v == "FAIL" or timing_v == "OVERBOUGHT_AVOID":
        combined = "AVOID"
    else:
        combined = "WATCH"

    return {
        "darwin": darwin_v,
        "graham": graham_v,
        "timing": timing_v,
        "combined": combined,
    }
