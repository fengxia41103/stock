#!/usr/bin/env python3
"""
SEC EDGAR analysis for S&P 500 stock selection.

Pulls 10-K, 10-Q, 8-K metadata + XBRL financial facts.
Flags red flags: executive changes, auditor changes, restatements.
Evaluates: cash flow quality, debt management, capital efficiency.

Usage:
    python3 backend/scripts/sec_analysis.py

Output: JSON summary per ticker for integration into final recommendation.
"""

import json
import os
import sys
import time
from datetime import date, timedelta

import requests

HEADERS = {
    "User-Agent": "StockAnalysis/1.0 (fengxia41103@gmail.com)",
    "Accept-Encoding": "gzip, deflate",
}

# S&P 500 candidates (post-Kill-List survivors — quality companies)
CANDIDATES = [
    "V", "MA", "MSFT", "AAPL", "GOOGL", "COST", "NFLX", "ADBE",
    "FICO", "BKNG", "ORLY", "IDXX", "MCO", "SPGI", "SHW", "ADP",
    "CPRT", "CTAS", "TXN", "INTU", "SNPS", "CDNS", "KLAC", "AMAT",
    "LRCX", "PEP", "PG", "ISRG", "CME", "ICE", "UNP", "WM",
    "ZTS", "ODFL", "FAST", "LIN", "PANW", "ADI",
]

# 8-K items that are red flags
RED_FLAG_ITEMS = {
    "1.02": "Termination of Material Agreement",
    "2.04": "Mine Safety Violations",
    "2.06": "Material Impairment",
    "4.01": "Change in Auditor",
    "4.02": "Non-Reliance on Financial Statements",
    "5.02": "Departure of Directors/Officers",
    "5.05": "Amendments to Articles (delisting concerns)",
}


def get_cik(ticker):
    """Map ticker to CIK."""
    url = "https://www.sec.gov/files/company_tickers.json"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    for entry in resp.json().values():
        if entry["ticker"].upper() == ticker.upper():
            return str(entry["cik_str"]).zfill(10)
    return None


def get_submissions(cik):
    """Get all recent filings for a CIK."""
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.json()


def get_company_facts(cik):
    """Get XBRL financial facts (structured data)."""
    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    if resp.status_code == 200:
        return resp.json()
    return None


def extract_filings(submissions, filing_type, since="2024-01-01", count=10):
    """Extract filing metadata from submissions."""
    recent = submissions.get("filings", {}).get("recent", {})
    if not recent:
        return []

    results = []
    forms = recent.get("form", [])
    dates = recent.get("filingDate", [])
    accessions = recent.get("accessionNumber", [])
    primary_docs = recent.get("primaryDocument", [])
    descriptions = recent.get("primaryDocDescription", [])
    items_list = recent.get("items", [])

    for i, form in enumerate(forms):
        if form == filing_type and dates[i] >= since and len(results) < count:
            results.append({
                "date": dates[i],
                "accession": accessions[i],
                "doc": primary_docs[i] if i < len(primary_docs) else "",
                "description": descriptions[i] if i < len(descriptions) else "",
                "items": items_list[i] if i < len(items_list) else "",
            })
    return results


def analyze_8k_red_flags(filings_8k):
    """Check 8-K filings for red flag items."""
    flags = []
    for f in filings_8k:
        items = f.get("items", "")
        for item_code, item_desc in RED_FLAG_ITEMS.items():
            if item_code in items:
                flags.append({
                    "date": f["date"],
                    "item": item_code,
                    "description": item_desc,
                    "filing_desc": f.get("description", ""),
                })
    return flags


def extract_xbrl_metric(facts, metric, taxonomy="us-gaap", unit="USD", recent_n=8):
    """Extract recent values for an XBRL metric."""
    try:
        concept = facts["facts"][taxonomy][metric]["units"][unit]
        # Filter to 10-K/10-Q filings, sort by end date
        vals = [
            {"end": item["end"], "val": item["val"], "form": item.get("form", "")}
            for item in concept
            if item.get("form") in ("10-K", "10-Q") and "end" in item
        ]
        vals.sort(key=lambda x: x["end"], reverse=True)
        return vals[:recent_n]
    except (KeyError, TypeError):
        return []


def compute_cash_flow_quality(facts):
    """Assess cash flow quality from XBRL data."""
    ocf = extract_xbrl_metric(facts, "NetCashProvidedByUsedInOperatingActivities")
    net_income = extract_xbrl_metric(facts, "NetIncomeLoss")
    capex = extract_xbrl_metric(
        facts, "PaymentsToAcquirePropertyPlantAndEquipment"
    )

    result = {"ocf_trend": [], "ni_trend": [], "fcf_trend": [], "ocf_ni_ratio": []}

    for i, o in enumerate(ocf[:6]):
        result["ocf_trend"].append({"period": o["end"], "value": o["val"]})
        # Find matching NI
        ni_match = next((n for n in net_income if n["end"] == o["end"]), None)
        if ni_match and ni_match["val"] and ni_match["val"] != 0:
            result["ocf_ni_ratio"].append({
                "period": o["end"],
                "ratio": round(o["val"] / ni_match["val"], 2),
            })
        # FCF = OCF - Capex
        capex_match = next((c for c in capex if c["end"] == o["end"]), None)
        if capex_match:
            fcf = o["val"] - abs(capex_match["val"])
            result["fcf_trend"].append({"period": o["end"], "value": fcf})

    return result


def compute_debt_health(facts):
    """Assess debt management from XBRL data."""
    debt = extract_xbrl_metric(facts, "LongTermDebt")
    if not debt:
        debt = extract_xbrl_metric(facts, "LongTermDebtNoncurrent")

    assets = extract_xbrl_metric(facts, "Assets")
    ebit = extract_xbrl_metric(facts, "OperatingIncomeLoss")
    interest = extract_xbrl_metric(facts, "InterestExpense")

    result = {
        "debt_trend": [],
        "debt_to_assets": [],
        "interest_coverage": [],
    }

    for d in debt[:6]:
        result["debt_trend"].append({"period": d["end"], "value": d["val"]})
        asset_match = next((a for a in assets if a["end"] == d["end"]), None)
        if asset_match and asset_match["val"]:
            result["debt_to_assets"].append({
                "period": d["end"],
                "ratio": round(d["val"] / asset_match["val"], 3),
            })

    for e in ebit[:6]:
        int_match = next((i for i in interest if i["end"] == e["end"]), None)
        if int_match and int_match["val"] and int_match["val"] > 0:
            result["interest_coverage"].append({
                "period": e["end"],
                "ratio": round(e["val"] / int_match["val"], 1),
            })

    return result


def compute_capital_efficiency(facts):
    """ROIC and reinvestment metrics."""
    revenue = extract_xbrl_metric(facts, "Revenues")
    if not revenue:
        revenue = extract_xbrl_metric(facts, "RevenueFromContractWithCustomerExcludingAssessedTax")

    rd = extract_xbrl_metric(facts, "ResearchAndDevelopmentExpense")
    shares = extract_xbrl_metric(facts, "CommonStockSharesOutstanding", unit="shares")
    buybacks = extract_xbrl_metric(facts, "PaymentsForRepurchaseOfCommonStock")

    result = {
        "revenue_trend": [],
        "rd_intensity": [],
        "buyback_trend": [],
    }

    for r in revenue[:6]:
        result["revenue_trend"].append({"period": r["end"], "value": r["val"]})
        rd_match = next((d for d in rd if d["end"] == r["end"]), None)
        if rd_match and r["val"]:
            result["rd_intensity"].append({
                "period": r["end"],
                "pct": round(rd_match["val"] / r["val"] * 100, 1),
            })

    for b in buybacks[:6]:
        result["buyback_trend"].append({"period": b["end"], "value": b["val"]})

    return result


def analyze_ticker(ticker):
    """Full SEC analysis for one ticker."""
    print(f"  Analyzing {ticker}...", end=" ", flush=True)

    cik = get_cik(ticker)
    if not cik:
        print("CIK not found")
        return None
    time.sleep(0.15)

    submissions = get_submissions(cik)
    time.sleep(0.15)

    facts = get_company_facts(cik)
    time.sleep(0.15)

    # Filing counts
    filings_10k = extract_filings(submissions, "10-K", since="2024-01-01")
    filings_10q = extract_filings(submissions, "10-Q", since="2024-01-01")
    filings_8k = extract_filings(submissions, "8-K", since="2024-01-01")

    # Red flags from 8-K
    red_flags = analyze_8k_red_flags(filings_8k)

    # Financial analysis from XBRL
    cash_flow = compute_cash_flow_quality(facts) if facts else {}
    debt = compute_debt_health(facts) if facts else {}
    efficiency = compute_capital_efficiency(facts) if facts else {}

    # Company name
    name = submissions.get("name", ticker)

    result = {
        "ticker": ticker,
        "name": name,
        "cik": cik,
        "filings_count": {
            "10-K": len(filings_10k),
            "10-Q": len(filings_10q),
            "8-K": len(filings_8k),
        },
        "red_flags": red_flags,
        "cash_flow": cash_flow,
        "debt": debt,
        "efficiency": efficiency,
        "latest_10k_date": filings_10k[0]["date"] if filings_10k else None,
        "latest_10q_date": filings_10q[0]["date"] if filings_10q else None,
    }

    flag_count = len(red_flags)
    print(f"OK (8-K flags: {flag_count})")
    return result


def score_result(r):
    """Score a ticker's SEC analysis (0-100)."""
    score = 70  # Base score

    # Red flags penalty (-15 per major flag)
    score -= len(r.get("red_flags", [])) * 15

    # Cash flow quality: OCF/NI ratio > 1.0 is good
    ratios = r.get("cash_flow", {}).get("ocf_ni_ratio", [])
    if ratios:
        avg_ratio = sum(x["ratio"] for x in ratios) / len(ratios)
        if avg_ratio > 1.2:
            score += 15
        elif avg_ratio > 1.0:
            score += 10
        elif avg_ratio < 0.7:
            score -= 15

    # Debt health: interest coverage > 10 is excellent
    coverage = r.get("debt", {}).get("interest_coverage", [])
    if coverage:
        avg_cov = sum(x["ratio"] for x in coverage) / len(coverage)
        if avg_cov > 15:
            score += 10
        elif avg_cov > 8:
            score += 5
        elif avg_cov < 3:
            score -= 20

    # R&D intensity (shows investment in future)
    rd = r.get("efficiency", {}).get("rd_intensity", [])
    if rd:
        avg_rd = sum(x["pct"] for x in rd) / len(rd)
        if avg_rd > 15:
            score += 10
        elif avg_rd > 8:
            score += 5

    return max(0, min(100, score))


def main():
    print("=" * 70)
    print("  SEC EDGAR ANALYSIS — S&P 500 CANDIDATES")
    print("=" * 70)
    print(f"\n  Analyzing {len(CANDIDATES)} candidates...")
    print(f"  Pulling: 10-K, 10-Q, 8-K (since 2024-01-01)")
    print(f"  Focus: Cash flow quality, debt, capital efficiency, red flags\n")

    results = []
    for ticker in CANDIDATES:
        try:
            r = analyze_ticker(ticker)
            if r:
                r["sec_score"] = score_result(r)
                results.append(r)
        except Exception as e:
            print(f"  {ticker}: ERROR — {e}")
        time.sleep(0.2)  # Rate limit

    # Sort by SEC score
    results.sort(key=lambda x: x["sec_score"], reverse=True)

    # Print summary
    print(f"\n{'='*70}")
    print("  RESULTS (sorted by SEC health score)")
    print(f"{'='*70}\n")

    print(f"  {'Ticker':<7} {'Score':>5} {'Flags':>5} {'10K':>4} {'10Q':>4} {'8K':>4} {'OCF/NI':>7} {'IntCov':>7} {'R&D%':>5}")
    print(f"  {'─'*7} {'─'*5} {'─'*5} {'─'*4} {'─'*4} {'─'*4} {'─'*7} {'─'*7} {'─'*5}")

    for r in results:
        flags = len(r["red_flags"])
        ocf_ni = ""
        ratios = r.get("cash_flow", {}).get("ocf_ni_ratio", [])
        if ratios:
            ocf_ni = f"{sum(x['ratio'] for x in ratios)/len(ratios):.1f}x"

        int_cov = ""
        coverage = r.get("debt", {}).get("interest_coverage", [])
        if coverage:
            int_cov = f"{sum(x['ratio'] for x in coverage)/len(coverage):.0f}x"

        rd_pct = ""
        rd = r.get("efficiency", {}).get("rd_intensity", [])
        if rd:
            rd_pct = f"{sum(x['pct'] for x in rd)/len(rd):.0f}%"

        print(f"  {r['ticker']:<7} {r['sec_score']:>5} {flags:>5} "
              f"{r['filings_count']['10-K']:>4} {r['filings_count']['10-Q']:>4} "
              f"{r['filings_count']['8-K']:>4} {ocf_ni:>7} {int_cov:>7} {rd_pct:>5}")

    # Print red flags detail
    flagged = [r for r in results if r["red_flags"]]
    if flagged:
        print(f"\n{'─'*70}")
        print("  ⚠️  RED FLAGS DETECTED:")
        print(f"{'─'*70}")
        for r in flagged:
            for f in r["red_flags"]:
                print(f"  {r['ticker']:<7} {f['date']}  Item {f['item']}: {f['description']}")

    # Save full results
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sec_analysis_results.json")
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\n  Full results saved to: {output_path}")


if __name__ == "__main__":
    main()
