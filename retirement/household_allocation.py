#!/usr/bin/env python3
"""Household-level asset allocation: IRA/Roth + employer DC plans (401k/457).

Keeps the accounts conceptually SEPARATE (reports each), but rolls them up to a
household view so the IRA rebalance can be set against the whole book rather
than the IRA in isolation. If the DC plans are bond/international-heavy they
offset an IRA's US-large-growth concentration.

Reads a brokerage positions CSV and the DC-plan fund balances from a gitignored
`my_inputs.json` (keys: `positions_csv`, `dc_plans`). With no config it prints
nothing private — provide your own file. See `my_inputs.example.json`.

Planning analysis, not advice.
"""

from __future__ import annotations

import csv
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
MY_INPUTS_PATH = os.path.join(HERE, "my_inputs.json")

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

# --- ticker -> sleeve map (generic classification; not personal data) ---
FIDELITY_SLEEVE = {
    # core ETFs
    "VOO": "US Large Cap", "SPYG": "US Large Cap", "VO": "US Mid Cap",
    "VB": "US Small Cap", "VEA": "International Developed",
    "VWO": "Emerging Markets", "BND": "Bonds / Fixed Income",
    "VNQ": "Real Assets / TIPS / REIT",
    # common single names (classify by listing/size)
    "MSFT": "US Large Cap", "GOOGL": "US Large Cap", "MA": "US Large Cap",
    "V": "US Large Cap", "SPGI": "US Large Cap", "LIN": "US Large Cap",
    "PG": "US Large Cap", "PEP": "US Large Cap", "MCD": "US Large Cap",
    "TXN": "US Large Cap", "PLTR": "US Large Cap", "LRCX": "US Large Cap",
    "RCL": "US Mid Cap",
    "PDD": "Emerging Markets", "TSM": "Emerging Markets", "SBUX": "US Large Cap",
    # money market / cash sweeps
    "FDRXX": "Cash / Short Term", "SPAXX": "Cash / Short Term",
    "CORE": "Cash / Short Term",
}

# Map DC-plan fund NAMES to sleeves (generic; balances come from my_inputs.json).
DC_FUND_SLEEVE = {
    "NC International Fund": "International Developed",
    "NC International Index Fund": "International Developed",
    "NC Large Cap Index Fund": "US Large Cap",
    "NC Small/Mid Cap Core Fund": "US Small Cap",
    "NC Small/Mid Cap Index Fund": "US Small Cap",
    "NC Fixed Income Fund": "Bonds / Fixed Income",
    "NC TIPS Fund": "Real Assets / TIPS / REIT",
}


def _load_private():
    try:
        with open(MY_INPUTS_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, ValueError):
        return {}


def load_fidelity(csv_path: str, skip_accounts=None) -> dict:
    """Return sleeve -> dollars from a brokerage positions CSV, excluding any
    account names in skip_accounts (e.g. 529/HSA that aren't retirement)."""
    sleeves = {s: 0.0 for s in SLEEVES}
    skip_accounts = set(skip_accounts or [])
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            acct = (row.get("Account name") or "").strip()
            sym = (row.get("Symbol") or "").strip().rstrip("*")
            val = (row.get("Current value") or "").strip().lstrip("$").replace(",", "")
            if not sym or acct in skip_accounts:
                continue
            try:
                dollars = float(val)
            except ValueError:
                continue
            sleeve = FIDELITY_SLEEVE.get(sym)
            if sleeve is None:
                sleeve = "US Large Cap"  # unknown single name -> large cap default
            sleeves[sleeve] += dollars
    return sleeves


def nc_sleeves(funds: dict) -> dict:
    """funds = {fund_name: dollars}; map to sleeves via DC_FUND_SLEEVE."""
    out = {s: 0.0 for s in SLEEVES}
    for name, dollars in funds.items():
        sleeve = DC_FUND_SLEEVE.get(name, "US Large Cap")
        out[sleeve] += float(dollars)
    return out


def add(*dicts) -> dict:
    out = {s: 0.0 for s in SLEEVES}
    for d in dicts:
        for s in SLEEVES:
            out[s] += d.get(s, 0.0)
    return out


def pct_table(name: str, sleeves: dict) -> None:
    total = sum(sleeves.values())
    print(f"\n=== {name}  (total ${total:,.0f}) ===")
    for s in SLEEVES:
        v = sleeves[s]
        if v:
            print(f"  {s:<28} ${v:>12,.0f}  {v/total*100:5.1f}%")


# Household target sleeves (edit to your plan, or set in my_inputs.json).
TARGET = {
    "US Large Cap": 42, "US Mid Cap": 8, "US Small Cap": 6,
    "International Developed": 20, "Emerging Markets": 7,
    "Bonds / Fixed Income": 10, "Real Assets / TIPS / REIT": 4,
    "Cash / Short Term": 3,
}


def main():
    cfg = _load_private()
    csv_path = os.path.expanduser(cfg.get("positions_csv", ""))
    dc = cfg.get("dc_plans", {})  # {"401k": {fund: $}, "457": {fund: $}}
    if not csv_path or not os.path.exists(csv_path):
        print("No private config found (retirement/my_inputs.json with a")
        print("'positions_csv' path and 'dc_plans'). Copy my_inputs.example.json,")
        print("fill in your numbers, and re-run. Nothing private is in the repo.")
        return

    skip = cfg.get("skip_accounts", [])
    fid = load_fidelity(csv_path, skip_accounts=skip)
    k401 = nc_sleeves(dc.get("401k", {}))
    k457 = nc_sleeves(dc.get("457", {}))
    household = add(fid, k401, k457)

    pct_table("IRA + Roth (brokerage)", fid)
    pct_table("DC plan 401(k)", k401)
    pct_table("DC plan 457", k457)
    pct_table("HOUSEHOLD (all retirement accounts)", household)

    total = sum(household.values())
    print("\n=== HOUSEHOLD vs TARGET ===")
    print(f"  {'Sleeve':<28} {'Now':>7} {'Target':>7} {'Drift':>7} {'$ to target':>13}")
    for s in SLEEVES:
        now = household[s] / total * 100
        tgt = TARGET.get(s, 0)
        drift = now - tgt
        dollars = (tgt - now) / 100 * total
        print(f"  {s:<28} {now:6.1f}% {tgt:6.0f}% {drift:+6.1f}% ${dollars:>11,.0f}")

    eq = total - household["Bonds / Fixed Income"] - household["Cash / Short Term"]
    print(f"\n  Household equity-ish: {eq/total*100:.1f}%  |  "
          f"bonds {household['Bonds / Fixed Income']/total*100:.1f}%  |  "
          f"cash {household['Cash / Short Term']/total*100:.1f}%")

    # --- Adjusted IRA targets: make the HOUSEHOLD hit target, treating the
    #     the DC plans as FIXED (we can only trade the brokerage/IRA). ---
    nc = add(k401, k457)
    fid_total = sum(fid.values())
    print("\n" + "=" * 70)
    print("ADJUSTED IRA/BROKERAGE REBALANCE (so the HOUSEHOLD hits target)")
    print("DC plans held fixed; the brokerage/IRA supplies the remainder.")
    print("=" * 70)
    print(f"  {'Sleeve':<28} {'HH tgt $':>11} {'DC has':>10} "
          f"{'IRA should':>11} {'IRA now':>10} {'Trade':>11}")
    fid_target = {}
    for s in SLEEVES:
        hh_tgt_dollars = TARGET.get(s, 0) / 100 * total
        nc_has = nc.get(s, 0.0)
        fid_should = max(0.0, hh_tgt_dollars - nc_has)
        fid_target[s] = fid_should
        trade = fid_should - fid.get(s, 0.0)
        print(f"  {s:<28} ${hh_tgt_dollars:>9,.0f} ${nc_has:>8,.0f} "
              f"${fid_should:>9,.0f} ${fid.get(s,0.0):>8,.0f} "
              f"${trade:>+9,.0f}")
    # Note: the IRA can't hold NEGATIVE, so if the DC plans already overshoot a
    # sleeve the IRA target floors at 0 and the household may slightly exceed
    # target there — acceptable (we can't sell NC holdings here).
    fid_tgt_sum = sum(fid_target.values())
    if fid_tgt_sum > 0:
        print(f"\n  IRA-only target MIX (what to rebalance the $"
              f"{fid_total:,.0f} IRA/Roth into):")
        for s in SLEEVES:
            if fid_target[s]:
                print(f"    {s:<28} {fid_target[s]/fid_tgt_sum*100:5.1f}%")
    print("\n  Read: because the NC plans already hold bonds/intl/small/TIPS,")
    print("  the IRA/brokerage should supply LESS of those than an")
    print("  IRA-in-isolation plan would, and can run a bit MORE US large.")


if __name__ == "__main__":
    main()
