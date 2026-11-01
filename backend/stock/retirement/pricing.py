# -*- coding: utf-8 -*-
"""In-process pricing + repricing for the retirement allocation view.

Replaces the standalone tool's HTTP ``live_prices`` with a direct query against
the app's own ``MyStock`` + ``historicals`` (same source as
``Position.current_price``). Any ticker the app doesn't track (most ETFs, cash
sweeps) degrades to ``source='fallback'`` so the caller uses the statement
value — exactly like the standalone tool.

Then ``reprice_holdings`` / ``reprice_and_allocate`` roll the live per-ticker
values up to brokerage + DC-plan household sleeves vs target.
"""

from __future__ import annotations

from stock.retirement import allocation as alloc


def fetch_prices(tickers) -> dict:
    """Return {TICKER: {'price': float|None, 'source': 'live'|'fallback',
    'as_of': str|None}} from the app's own historical data.

    One query for the matching stocks, then the latest close per stock. Never
    raises; unknown/untracked tickers degrade to fallback.
    """
    from stock.models import MyStock

    wanted = sorted({(t or "").strip().upper() for t in tickers if t})
    out = {t: {"price": None, "source": "fallback", "as_of": None} for t in wanted}
    if not wanted:
        return out

    stocks = MyStock.objects.filter(symbol__in=wanted)
    for stock in stocks:
        sym = (stock.symbol or "").strip().upper()
        latest = stock.historicals.order_by("-on").first()
        if latest and latest.close_price and latest.close_price > 0:
            out[sym] = {
                "price": float(latest.close_price),
                "source": "live",
                "as_of": latest.on.isoformat() if latest.on else None,
            }
    return out


def reprice_holdings(holdings, prices=None) -> dict:
    """holdings: [{symbol, quantity, value}] (value = statement value).

    Returns per-ticker live values + live brokerage balance + per-sleeve dollars.
    """
    tickers = sorted({(h.get("symbol") or "").strip().upper()
                      for h in holdings if h.get("symbol")})
    if prices is None:
        prices = fetch_prices(tickers)

    sleeves = {s: 0.0 for s in alloc.SLEEVES}
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
            value = stmt_value
            source = "fallback"
            fb_n += 1
        sleeve = alloc.FIDELITY_SLEEVE.get(sym, "US Large Cap")
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


def reprice_and_allocate(holdings, prices=None, skip_accounts=None,
                         dc_plans=None) -> dict:
    """Reprice brokerage holdings and roll the DC plans in for a household
    allocation vs target. Returns ira_balance + repriced per-ticker/sleeves +
    allocation rows (now/target/drift/dollars-to-target)."""
    skip = {s.strip().lower() for s in (skip_accounts or [])}
    holdings = [h for h in holdings
                if (h.get("account") or "").strip().lower() not in skip]

    rp = reprice_holdings(holdings, prices=prices)

    household = dict(rp["sleeves"])
    for s in alloc.SLEEVES:
        household.setdefault(s, 0.0)
    if dc_plans:
        for _plan, funds in dc_plans.items():
            for sleeve, dollars in alloc.nc_sleeves(funds).items():
                household[sleeve] = household.get(sleeve, 0.0) + dollars

    total = sum(household.values())
    rows = []
    for s in alloc.SLEEVES:
        now = household.get(s, 0.0)
        now_pct = (now / total * 100) if total else 0.0
        tgt = alloc.TARGET.get(s, 0)
        rows.append({
            "sleeve": s,
            "now_dollars": round(now, 2),
            "now_pct": round(now_pct, 1),
            "target_pct": tgt,
            "drift_pct": round(now_pct - tgt, 1),
            "dollars_to_target": round((tgt - now_pct) / 100 * total, 2),
        })

    per_ticker = [{**h, "live_price": h.get("price")} for h in rp["holdings"]]

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
