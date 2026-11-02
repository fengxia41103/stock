# -*- coding: utf-8 -*-

"""Whole-portfolio (sector) comparison aggregates.

A `MySector` is an equal-weighted basket of stocks — it has NO share counts or
dollar amounts, so every metric here is EQUAL-WEIGHT by construction and must be
labeled as such in the UI (it is not dollar-weighted performance).

Kept as a pure function (`compare_sectors`) with no request/ORM-write side
effects so it can be called directly from the API now, or wrapped in a Celery
task + cache later if the computation becomes heavy.
"""

import logging
import statistics
from collections import defaultdict

logger = logging.getLogger("stock")

# Lookback windows in trading days (~21/mo, ~63/qtr, ~252/yr).
WINDOWS = {"1m": 21, "3m": 63, "1y": 252}
TRADING_DAYS = 252


def _pct_return(closes, lookback):
    """Simple price return over `lookback` bars; None if not enough data."""
    if len(closes) <= lookback:
        return None
    end = closes[-1]
    start = closes[-1 - lookback]
    if not start:
        return None
    return (end / start - 1) * 100


def _basket_daily_returns(per_stock_closes):
    """Equal-weight daily returns of the basket over the common tail window.

    per_stock_closes: list of close-price lists (one per stock, oldest->newest).
    Returns a list of daily basket returns (fractions), or [] if insufficient.
    """
    series = [c for c in per_stock_closes if len(c) >= 2]
    if not series:
        return []
    # Align on the shortest common length (tail) so every stock contributes.
    n = min(len(c) for c in series)
    if n < 2:
        return []
    aligned = [c[-n:] for c in series]
    basket = []
    for i in range(1, n):
        day_rets = []
        for c in aligned:
            prev = c[i - 1]
            if prev:
                day_rets.append(c[i] / prev - 1)
        if day_rets:
            basket.append(sum(day_rets) / len(day_rets))
    return basket


def _annualized_vol(daily_returns):
    if len(daily_returns) < 2:
        return None
    try:
        sd = statistics.pstdev(daily_returns)
    except statistics.StatisticsError:
        return None
    return sd * (TRADING_DAYS ** 0.5) * 100  # annualized %, in percent units


def _avg(vals):
    vals = [v for v in vals if v is not None]
    return round(sum(vals) / len(vals), 2) if vals else None


def compare_sectors(sectors, max_bars=TRADING_DAYS + 5):
    """Compute equal-weight comparison stats for each sector.

    sectors: iterable of MySector (with .stocks prefetched ideally).
    Returns a list of dicts, one per sector.
    """
    # Local import to avoid circulars at module import time.
    from stock.models import MyStockHistorical

    results = []
    overlap_sets = {}

    for sec in sectors:
        stocks = list(sec.stocks.all())
        symbols = [s.symbol for s in stocks]
        overlap_sets[sec.id] = set(symbols)

        # Pull close-price tails for all stocks in one query, grouped by stock.
        closes_by_stock = defaultdict(list)
        qs = (
            MyStockHistorical.objects.filter(stock__in=stocks)
            .order_by("stock_id", "on")
            .values_list("stock_id", "close_price")
        )
        for stock_id, close in qs:
            closes_by_stock[stock_id].append(close)
        # Trim to the most recent `max_bars` per stock.
        per_stock_closes = [
            closes_by_stock[s.id][-max_bars:]
            for s in stocks
            if closes_by_stock.get(s.id)
        ]

        # Window returns: average of per-stock price returns (equal weight).
        window_returns = {}
        for key, lb in WINDOWS.items():
            rets = [_pct_return(c, lb) for c in per_stock_closes]
            window_returns[key] = _avg(rets)

        daily = _basket_daily_returns(per_stock_closes)
        vol = _annualized_vol(daily)

        results.append(
            {
                "id": sec.id,
                "name": sec.name,
                "num_stocks": len(symbols),
                "num_with_data": len(per_stock_closes),
                "return_1m": window_returns["1m"],
                "return_3m": window_returns["3m"],
                "return_1y": window_returns["1y"],
                "volatility_annual": round(vol, 2) if vol is not None else None,
                "avg_pe": _avg([s.pe for s in stocks]),
                "avg_roe": _avg([s.dupont_roe for s in stocks]),
                "weighting": "equal",  # explicit: NOT dollar-weighted
            }
        )

    # Pairwise overlap (shared symbols) — useful for comparing portfolios.
    overlaps = []
    ids = list(overlap_sets.keys())
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            a, b = ids[i], ids[j]
            shared = overlap_sets[a] & overlap_sets[b]
            if shared:
                overlaps.append(
                    {"a": a, "b": b, "shared": sorted(shared), "count": len(shared)}
                )

    return {"sectors": results, "overlaps": overlaps, "weighting": "equal"}
