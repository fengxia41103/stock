#!/usr/bin/env python3
"""Re-price brokerage holdings with live prices and roll up to the retirement
model's inputs + the household allocation sleeves.

Flow:  parsed holdings (qty, statement value)  +  live prices (from the Django
app)  ->  live per-ticker value (qty * live_price, falling back to the
statement value when a price is unavailable)  ->  live IRA/brokerage balance and
per-sleeve dollars.

Pure stdlib; reuses the sleeve classification in household_allocation.
"""

from __future__ import annotations

import household_allocation as ha
import live_prices


def reprice_holdings(holdings, prices=None, base_url=None, token=None) -> dict:
    """holdings: [{symbol, quantity, value}]  (value = statement/current value).

    Returns:
      {
        'holdings': [{symbol, quantity, price, value, source, as_of, sleeve}],
        'ira_balance': float,          # live total
        'sleeves': {sleeve: dollars},  # live per-sleeve
        'priced_live': int, 'priced_fallback': int,
        'as_of': str|None,
      }
    """
    tickers = sorted({(h.get("symbol") or "").strip().upper()
                      for h in holdings if h.get("symbol")})
    if prices is None:
        prices = live_prices.fetch_prices(tickers, base_url=base_url, token=token)

    sleeves = {s: 0.0 for s in ha.SLEEVES}
    out_holdings = []
    live_n = fb_n = 0
    as_of = None
    for h in holdings:
        sym = (h.get("symbol") or "").strip().upper()
        qty = h.get("quantity")
        stmt_value = float(h.get("value") or 0.0)
        p = prices.get(sym, {})
        price = p.get("price")
        if price is not None and qty is not None:
            value = float(qty) * float(price)
            source = "live"
            live_n += 1
            as_of = as_of or p.get("as_of")
        else:
            # cash/money-market (no qty) or unpriced ticker -> statement value
            value = stmt_value
            source = "fallback"
            fb_n += 1
        sleeve = ha.FIDELITY_SLEEVE.get(sym, "US Large Cap")
        sleeves[sleeve] += value
        out_holdings.append({
            "symbol": sym, "quantity": qty, "price": price,
            "value": round(value, 2), "source": source,
            "as_of": p.get("as_of"), "sleeve": sleeve,
        })

    return {
        "holdings": out_holdings,
        "ira_balance": round(sum(sleeves.values()), 2),
        "sleeves": {k: round(v, 2) for k, v in sleeves.items() if v},
        "priced_live": live_n,
        "priced_fallback": fb_n,
        "as_of": as_of,
    }


def apply_to_assumptions(assumptions: dict, repriced: dict) -> dict:
    """Return a new assumptions dict with the live IRA balance applied.
    (NC 401k/457, pension, SS stay whatever the assumptions already hold.)"""
    merged = dict(assumptions or {})
    if repriced.get("ira_balance") is not None:
        merged["ira_balance"] = repriced["ira_balance"]
    return merged


def reprice_and_allocate(holdings, prices=None, skip_accounts=None,
                         dc_plans=None) -> dict:
    """Server-facing: reprice brokerage holdings with live prices AND roll the
    DC plans in for a household allocation vs target.

    Returns:
      {
        'ira_balance': float,
        'repriced': {'per_ticker': [...], 'sleeves': {...},
                     'sources': {'live': n, 'fallback': n}, 'as_of': str},
        'allocation': {'household': {sleeve: {'now_pct','target_pct','drift_pct',
                       'to_target_dollars'}}, 'total': float},
      }
    """
    skip = {s.strip().lower() for s in (skip_accounts or [])}
    holdings = [h for h in holdings
                if (h.get("account") or "").strip().lower() not in skip]

    rp = reprice_holdings(holdings, prices=prices)

    # Household sleeves = brokerage (live) + DC-plan funds (from statement).
    household = dict(rp["sleeves"])
    for s in ha.SLEEVES:
        household.setdefault(s, 0.0)
    if dc_plans:
        for _plan, funds in dc_plans.items():
            for sleeve, dollars in ha.nc_sleeves(funds).items():
                household[sleeve] = household.get(sleeve, 0.0) + dollars

    total = sum(household.values())
    rows = []
    for s in ha.SLEEVES:
        now = household.get(s, 0.0)
        now_pct = (now / total * 100) if total else 0.0
        tgt = ha.TARGET.get(s, 0)
        rows.append({
            "sleeve": s,
            "now_dollars": round(now, 2),
            "now_pct": round(now_pct, 1),
            "target_pct": tgt,
            "drift_pct": round(now_pct - tgt, 1),
            "dollars_to_target": round((tgt - now_pct) / 100 * total, 2),
        })

    # per-ticker: expose both 'price' and 'live_price' for the UI
    per_ticker = []
    for h in rp["holdings"]:
        per_ticker.append({**h, "live_price": h.get("price")})

    return {
        "ira_balance": rp["ira_balance"],
        "repriced": {
            "per_ticker": per_ticker,
            "sleeves": rp["sleeves"],
            "sources": {"live": rp["priced_live"],
                        "fallback": rp["priced_fallback"]},
            "as_of": rp["as_of"],
        },
        "allocation": {"rows": rows, "total": round(total, 2)},
    }
