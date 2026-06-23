# -*- coding: utf-8 -*-
"""Compute company health from SEC EDGAR XBRL data.

Usage:
    from stock.workers.compute_health import compute_health
    result = compute_health("MSFT")
"""

import logging
import os
import time

import requests

logger = logging.getLogger("stock")

HEADERS = {
    "User-Agent": os.environ.get(
        "SEC_EDGAR_USER_AGENT", "StockApp/1.0 (dev@example.com)"
    ),
    "Accept-Encoding": "gzip, deflate",
}


def _get_cik(ticker):
    resp = requests.get(
        "https://www.sec.gov/files/company_tickers.json", headers=HEADERS, timeout=15
    )
    for entry in resp.json().values():
        if entry["ticker"].upper() == ticker.upper():
            return str(entry["cik_str"]).zfill(10)
    return None


def _extract(facts, concept, unit="USD", form="10-K"):
    """Extract latest value for an XBRL concept."""
    try:
        entries = facts["facts"]["us-gaap"][concept]["units"][unit]
        filtered = [e for e in entries if e.get("form") == form]
        if not filtered:
            filtered = entries
        filtered.sort(key=lambda x: x.get("end", ""), reverse=True)
        return filtered[0]["val"] if filtered else None
    except (KeyError, IndexError):
        return None


def compute_health(ticker):
    """Compute health metrics from SEC XBRL data.

    Returns dict with:
        ticker, company, ratios{}, health{flags[], healthy, altman_z, ...}
    """
    cik = _get_cik(ticker)
    if not cik:
        return {"ticker": ticker, "error": "CIK not found"}

    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
    resp = requests.get(url, headers=HEADERS, timeout=30)
    if resp.status_code != 200:
        return {"ticker": ticker, "error": f"XBRL fetch failed: {resp.status_code}"}

    facts = resp.json()
    company_name = facts.get("entityName", ticker)

    # Extract financials
    total_assets = _extract(facts, "Assets")
    current_assets = _extract(facts, "AssetsCurrent")
    current_liab = _extract(facts, "LiabilitiesCurrent")
    total_liab = _extract(facts, "Liabilities")
    equity = _extract(facts, "StockholdersEquity")
    retained_earnings = _extract(facts, "RetainedEarningsAccumulatedDeficit")
    long_term_debt = _extract(facts, "LongTermDebt") or _extract(facts, "LongTermDebtNoncurrent")
    revenue = (_extract(facts, "RevenueFromContractWithCustomersExcludingAssessedTax")
               or _extract(facts, "Revenues"))
    net_income = _extract(facts, "NetIncomeLoss")
    ebit = _extract(facts, "OperatingIncomeLoss")
    interest_expense = _extract(facts, "InterestExpense")
    operating_cf = _extract(facts, "NetCashProvidedByUsedInOperatingActivities")
    capex = _extract(facts, "PaymentsToAcquirePropertyPlantAndEquipment")

    working_capital = (current_assets - current_liab) if current_assets and current_liab else None

    # Compute ratios
    ratios = {}

    if current_assets and current_liab and current_liab > 0:
        ratios["current_ratio"] = round(current_assets / current_liab, 2)

    if long_term_debt and equity and equity > 0:
        ratios["debt_to_equity"] = round(long_term_debt / equity, 2)

    if ebit and interest_expense and interest_expense > 0:
        ratios["interest_coverage"] = round(ebit / interest_expense, 1)

    if ebit and total_assets and current_liab:
        ce = total_assets - current_liab
        if ce > 0:
            ratios["roce_pct"] = round(ebit / ce * 100, 1)

    if net_income and revenue and revenue > 0:
        ratios["net_margin_pct"] = round(net_income / revenue * 100, 1)

    if operating_cf and net_income and net_income != 0:
        ratios["ocf_to_net_income"] = round(operating_cf / net_income, 2)

    if operating_cf and capex:
        ratios["fcf"] = operating_cf - abs(capex)

    # Health indicators
    health = {}

    # Accruals quality
    if net_income and operating_cf and total_assets and total_assets > 0:
        accrual_ratio = (net_income - operating_cf) / total_assets
        health["accrual_ratio_pct"] = round(accrual_ratio * 100, 2)
        health["high_accruals"] = abs(accrual_ratio) > 0.05

    # Altman Z-Score
    if all([working_capital, total_assets, retained_earnings, ebit, equity, total_liab, revenue]):
        if total_assets > 0 and total_liab > 0:
            z = (1.2 * (working_capital / total_assets) +
                 1.4 * (retained_earnings / total_assets) +
                 3.3 * (ebit / total_assets) +
                 0.6 * (equity / total_liab) +
                 1.0 * (revenue / total_assets))
            health["altman_z"] = round(z, 2)
            health["altman_zone"] = "SAFE" if z > 2.99 else "GRAY" if z > 1.8 else "DISTRESS"

    # Flags
    flags = []
    if ratios.get("current_ratio", 99) < 1.0:
        flags.append("LOW_LIQUIDITY")
    if ratios.get("debt_to_equity", 0) > 2.0:
        flags.append("HIGH_LEVERAGE")
    if ratios.get("interest_coverage", 99) < 3.0:
        flags.append("WEAK_COVERAGE")
    if ratios.get("ocf_to_net_income", 99) < 0.8:
        flags.append("POOR_CASH_CONVERSION")
    if health.get("high_accruals"):
        flags.append("HIGH_ACCRUALS")
    if health.get("altman_zone") == "DISTRESS":
        flags.append("DISTRESS_RISK")

    health["flags"] = flags
    health["healthy"] = len(flags) == 0

    return {
        "ticker": ticker,
        "company": company_name,
        "ratios": ratios,
        "health": health,
    }
