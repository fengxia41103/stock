#!/usr/bin/env python3
"""Analyze SEC XBRL financial data for health assessment.

Fetches structured financial data from SEC EDGAR's XBRL API and computes
health metrics (Altman Z-Score, Accruals Quality, key ratios).

Usage:
    python3 skills/scripts/analyze_sec_health.py MSFT
    python3 skills/scripts/analyze_sec_health.py MSFT V GOOGL

Integrates with stock app: can be run standalone or imported as a module.
"""

import json
import sys
import time

import requests

HEADERS = {
    "User-Agent": "StockAnalysis/1.0 (fengxia41103@gmail.com)",
    "Accept-Encoding": "gzip, deflate",
}


def get_cik(ticker):
    """Map ticker → CIK."""
    resp = requests.get(
        "https://www.sec.gov/files/company_tickers.json", headers=HEADERS, timeout=15
    )
    for entry in resp.json().values():
        if entry["ticker"].upper() == ticker.upper():
            return str(entry["cik_str"]).zfill(10)
    return None


def get_company_facts(cik):
    """Fetch all XBRL financial facts from SEC."""
    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
    resp = requests.get(url, headers=HEADERS, timeout=30)
    if resp.status_code != 200:
        return None
    return resp.json()


def extract_latest(facts, taxonomy, concept, unit="USD", form="10-K"):
    """Extract the most recent value for a given XBRL concept."""
    try:
        entries = facts["facts"][taxonomy][concept]["units"][unit]
        # Filter to 10-K filings and get latest
        filtered = [e for e in entries if e.get("form") == form]
        if not filtered:
            filtered = entries
        # Sort by end date descending
        filtered.sort(key=lambda x: x.get("end", ""), reverse=True)
        return filtered[0]["val"] if filtered else None
    except (KeyError, IndexError):
        return None


def compute_health(ticker):
    """Compute health metrics from SEC XBRL data."""
    cik = get_cik(ticker)
    if not cik:
        return {"ticker": ticker, "error": "CIK not found"}

    facts = get_company_facts(cik)
    if not facts:
        return {"ticker": ticker, "error": "No XBRL data"}

    company_name = facts.get("entityName", ticker)

    # Extract key financial data (us-gaap taxonomy)
    t = "us-gaap"

    # Balance Sheet
    total_assets = extract_latest(facts, t, "Assets")
    current_assets = extract_latest(facts, t, "AssetsCurrent")
    current_liab = extract_latest(facts, t, "LiabilitiesCurrent")
    total_liab = extract_latest(facts, t, "Liabilities")
    equity = extract_latest(facts, t, "StockholdersEquity")
    retained_earnings = extract_latest(facts, t, "RetainedEarningsAccumulatedDeficit")
    total_debt = extract_latest(facts, t, "LongTermDebt") or extract_latest(facts, t, "LongTermDebtNoncurrent")
    working_capital = (current_assets - current_liab) if current_assets and current_liab else None
    inventory = extract_latest(facts, t, "InventoryNet")
    receivables = extract_latest(facts, t, "AccountsReceivableNetCurrent")

    # Income Statement
    revenue = extract_latest(facts, t, "RevenueFromContractWithCustomersExcludingAssessedTax") or \
              extract_latest(facts, t, "Revenues")
    net_income = extract_latest(facts, t, "NetIncomeLoss")
    ebit = extract_latest(facts, t, "OperatingIncomeLoss")
    interest_expense = extract_latest(facts, t, "InterestExpense")
    gross_profit = extract_latest(facts, t, "GrossProfit")

    # Cash Flow
    operating_cf = extract_latest(facts, t, "NetCashProvidedByUsedInOperatingActivities")
    capex = extract_latest(facts, t, "PaymentsToAcquirePropertyPlantAndEquipment")

    # Compute ratios
    results = {
        "ticker": ticker,
        "company": company_name,
        "data": {},
        "ratios": {},
        "health": {},
    }

    # Store raw data
    results["data"] = {
        "total_assets": total_assets,
        "current_assets": current_assets,
        "current_liabilities": current_liab,
        "total_liabilities": total_liab,
        "equity": equity,
        "total_debt": total_debt,
        "revenue": revenue,
        "net_income": net_income,
        "ebit": ebit,
        "operating_cf": operating_cf,
        "capex": capex,
    }

    # Compute ratios
    if current_assets and current_liab and current_liab > 0:
        results["ratios"]["current_ratio"] = round(current_assets / current_liab, 2)

    if total_debt and equity and equity > 0:
        results["ratios"]["debt_to_equity"] = round(total_debt / equity, 2)
    elif total_liab and equity and equity > 0:
        results["ratios"]["debt_to_equity"] = round((total_liab - equity) / equity, 2)

    if ebit and interest_expense and interest_expense > 0:
        results["ratios"]["interest_coverage"] = round(ebit / interest_expense, 1)

    if ebit and total_assets and current_liab:
        capital_employed = total_assets - current_liab
        if capital_employed > 0:
            results["ratios"]["roce"] = round(ebit / capital_employed * 100, 1)

    if net_income and revenue and revenue > 0:
        results["ratios"]["net_margin"] = round(net_income / revenue * 100, 1)

    if gross_profit and revenue and revenue > 0:
        results["ratios"]["gross_margin"] = round(gross_profit / revenue * 100, 1)

    if operating_cf and net_income:
        results["ratios"]["ocf_to_ni"] = round(operating_cf / net_income, 2) if net_income != 0 else None

    if operating_cf and capex:
        fcf = operating_cf - abs(capex)
        results["ratios"]["fcf"] = fcf

    # Accruals quality
    if net_income and operating_cf and total_assets and total_assets > 0:
        accruals = net_income - operating_cf
        accrual_ratio = accruals / total_assets
        results["health"]["accrual_ratio"] = round(accrual_ratio * 100, 2)
        results["health"]["accruals_flag"] = abs(accrual_ratio) > 0.05

    # Altman Z-Score (manufacturing version)
    if all([working_capital, total_assets, retained_earnings, ebit, equity, total_liab, revenue]):
        if total_assets > 0 and total_liab > 0:
            z = (1.2 * (working_capital / total_assets) +
                 1.4 * (retained_earnings / total_assets) +
                 3.3 * (ebit / total_assets) +
                 0.6 * (equity / total_liab) +
                 1.0 * (revenue / total_assets))
            results["health"]["altman_z"] = round(z, 2)
            if z > 2.99:
                results["health"]["altman_zone"] = "SAFE"
            elif z > 1.8:
                results["health"]["altman_zone"] = "GRAY"
            else:
                results["health"]["altman_zone"] = "DISTRESS"

    # Overall health assessment
    flags = []
    r = results["ratios"]
    if r.get("current_ratio") and r["current_ratio"] < 1.0:
        flags.append("LOW_LIQUIDITY")
    if r.get("debt_to_equity") and r["debt_to_equity"] > 2.0:
        flags.append("HIGH_LEVERAGE")
    if r.get("interest_coverage") and r["interest_coverage"] < 3.0:
        flags.append("WEAK_COVERAGE")
    if r.get("ocf_to_ni") and r["ocf_to_ni"] < 0.8:
        flags.append("POOR_CASH_CONVERSION")
    if results["health"].get("accruals_flag"):
        flags.append("HIGH_ACCRUALS")
    if results["health"].get("altman_zone") == "DISTRESS":
        flags.append("BANKRUPTCY_RISK")

    results["health"]["flags"] = flags
    results["health"]["healthy"] = len(flags) == 0

    return results


def print_report(result):
    """Pretty print health report."""
    if "error" in result:
        print(f"\n❌ {result['ticker']}: {result['error']}")
        return

    print(f"\n{'='*60}")
    print(f"  {result['company']} ({result['ticker']})")
    print(f"{'='*60}")

    print("\n  Key Ratios:")
    for k, v in result["ratios"].items():
        if v is not None:
            label = k.replace("_", " ").title()
            print(f"    {label:25s}: {v}")

    print("\n  Health Indicators:")
    h = result["health"]
    if "altman_z" in h:
        print(f"    {'Altman Z-Score':25s}: {h['altman_z']} ({h['altman_zone']})")
    if "accrual_ratio" in h:
        flag = " ⚠️" if h.get("accruals_flag") else " ✓"
        print(f"    {'Accrual Ratio':25s}: {h['accrual_ratio']}%{flag}")

    flags = h.get("flags", [])
    if flags:
        print(f"\n  ⚠️  Red Flags: {', '.join(flags)}")
    else:
        print(f"\n  ✅ No red flags detected")

    print()


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 analyze_sec_health.py TICKER [TICKER ...]")
        print("Example: python3 analyze_sec_health.py MSFT V GOOGL")
        sys.exit(1)

    tickers = [t.upper() for t in sys.argv[1:]]

    for ticker in tickers:
        result = compute_health(ticker)
        print_report(result)
        time.sleep(0.2)


if __name__ == "__main__":
    main()
