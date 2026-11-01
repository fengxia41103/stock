# -*- coding: utf-8 -*-
"""Household-level asset-allocation sleeves and classification maps.

Pure data + helpers ported from the standalone planner. The file-loading CLI
(``main``/``_load_private``) is intentionally omitted — the app supplies the
positions and DC-plan balances from the DB / an upload instead.

Planning analysis, not advice.
"""

from __future__ import annotations

# Sleeve order used across the allocation work.
SLEEVES = [
    "US Large Cap",
    "US Mid Cap",
    "US Small Cap",
    "International Developed",
    "Emerging Markets",
    "Bonds / Fixed Income",
    "Real Assets / TIPS / REIT",
    "Cash / Short Term",
]

# ticker -> sleeve (generic classification; not personal data)
FIDELITY_SLEEVE = {
    "VOO": "US Large Cap", "SPYG": "US Large Cap", "VO": "US Mid Cap",
    "VB": "US Small Cap", "VEA": "International Developed",
    "VWO": "Emerging Markets", "BND": "Bonds / Fixed Income",
    "VNQ": "Real Assets / TIPS / REIT",
    "MSFT": "US Large Cap", "GOOGL": "US Large Cap", "MA": "US Large Cap",
    "V": "US Large Cap", "SPGI": "US Large Cap", "LIN": "US Large Cap",
    "PG": "US Large Cap", "PEP": "US Large Cap", "MCD": "US Large Cap",
    "TXN": "US Large Cap", "PLTR": "US Large Cap", "LRCX": "US Large Cap",
    "RCL": "US Mid Cap",
    "PDD": "Emerging Markets", "TSM": "Emerging Markets", "SBUX": "US Large Cap",
    "FDRXX": "Cash / Short Term", "SPAXX": "Cash / Short Term",
    "CORE": "Cash / Short Term",
}

# DC-plan fund NAME -> sleeve (balances come from the DB / upload)
DC_FUND_SLEEVE = {
    "NC International Fund": "International Developed",
    "NC International Index Fund": "International Developed",
    "NC Large Cap Index Fund": "US Large Cap",
    "NC Small/Mid Cap Core Fund": "US Small Cap",
    "NC Small/Mid Cap Index Fund": "US Small Cap",
    "NC Fixed Income Fund": "Bonds / Fixed Income",
    "NC TIPS Fund": "Real Assets / TIPS / REIT",
}

# Household target sleeve weights (percent).
TARGET = {
    "US Large Cap": 42, "US Mid Cap": 8, "US Small Cap": 6,
    "International Developed": 20, "Emerging Markets": 7,
    "Bonds / Fixed Income": 10, "Real Assets / TIPS / REIT": 4,
    "Cash / Short Term": 3,
}


def nc_sleeves(funds: dict) -> dict:
    """funds = {fund_name: dollars}; map to sleeves via DC_FUND_SLEEVE."""
    out = {s: 0.0 for s in SLEEVES}
    for name, dollars in funds.items():
        sleeve = DC_FUND_SLEEVE.get(name, "US Large Cap")
        out[sleeve] += float(dollars)
    return out


def add(*dicts) -> dict:
    """Sum any number of sleeve->dollars dicts."""
    out = {s: 0.0 for s in SLEEVES}
    for d in dicts:
        for s in SLEEVES:
            out[s] += d.get(s, 0.0)
    return out
