"""Backfill financial statements using yfinance (more history than yahooquery).

yfinance returns 4-5 years of quarterly income, balance sheet, and cash flow data.
This worker replaces/supplements the older yahooquery-based workers for historical data.
"""

import logging
from datetime import date

import numpy as np
import yfinance as yf

from stock.models import MyStock
from stock.models.balance import BalanceSheet
from stock.models.cashflow import CashFlow
from stock.models.income import IncomeStatement

logger = logging.getLogger("stock")


# Column mapping: yfinance column name → our model field name
INCOME_MAP = {
    "Total Revenue": "total_revenue",
    "Operating Revenue": "operating_revenue",
    "Cost Of Revenue": "cost_of_revenue",
    "Gross Profit": "gross_profit",
    "Operating Expense": "operating_expense",
    "Research And Development": "research_and_development",
    "Selling General And Administration": "selling_general_and_administration",
    "Operating Income": "operating_income",
    "Interest Expense Non Operating": "interest_expense_non_operating",
    "Other Income Expense": "other_income_expense",
    "Pretax Income": "pretax_income",
    "Tax Provision": "tax_provision",
    "Net Income Common Stockholders": "net_income_common_stockholders",
    "Net Income": "net_income",
    "Total Expenses": "total_expenses",
    "EBIT": "ebit",
    "EBITDA": "ebitda",
    "Reconciled Depreciation": "reconciled_depreciation",
    "Basic EPS": "basic_eps",
    "Interest Expense": "interest_expense",
    "Tax Rate For Calcs": "tax_rate",
}

BALANCE_MAP = {
    "Total Assets": "total_assets",
    "Current Assets": "current_assets",
    "Cash And Cash Equivalents": "cash_and_cash_equivalent",
    "Cash Cash Equivalents And Short Term Investments": "cash_and_cash_equivalent",
    "Receivables": "receivables",
    "Inventory": "inventory",
    "Net PPE": "net_ppe",
    "Goodwill": "goodwill",
    "Current Liabilities": "current_liabilities",
    "Long Term Debt": "long_term_debt",
    "Total Debt": "total_debt",
    "Stockholders Equity": "stockholders_equity",
    "Retained Earnings": "retained_earnings",
    "Working Capital": "working_capital",
    "Invested Capital": "invested_capital",
    "Common Stock": "common_stock",
    "Share Issued": "share_issued",
}

CASHFLOW_MAP = {
    "Operating Cash Flow": "operating_cash_flow",
    "Free Cash Flow": "free_cash_flow",
    "Capital Expenditure": "capex",
    "Net Income From Continuing Operations": "net_income",
    "Depreciation And Amortization": "da",
    "Beginning Cash Position": "beginning_cash",
    "End Cash Position": "ending_cash",
    "Cash Dividends Paid": "dividend_paid",
    "Repurchase Of Capital Stock": "repurchase_of_capital_stock",
}


def _to_billions(val):
    """Convert raw value to billions (our DB stores in billions)."""
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return 0.0
    return float(val) / 1_000_000_000


def _to_float(val):
    """Convert to float, handling NaN."""
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return 0.0
    return float(val)


def backfill_financials(symbol):
    """Backfill financial statements for one stock using yfinance."""
    stock = MyStock.objects.get(symbol=symbol)
    ticker = yf.Ticker(symbol)

    income_count = _backfill_income(stock, ticker)
    balance_count = _backfill_balance(stock, ticker)
    cashflow_count = _backfill_cashflow(stock, ticker)

    return {
        "symbol": symbol,
        "income_created": income_count,
        "balance_created": balance_count,
        "cashflow_created": cashflow_count,
    }


def _backfill_income(stock, ticker):
    """Backfill income statements."""
    try:
        df = ticker.quarterly_income_stmt
    except Exception:
        return 0

    if df is None or df.empty:
        return 0

    count = 0
    for col_date in df.columns:
        on = col_date.date() if hasattr(col_date, "date") else col_date
        if not isinstance(on, date):
            continue

        # Build field values
        fields = {}
        for yf_col, model_field in INCOME_MAP.items():
            if yf_col in df.index:
                val = df.loc[yf_col, col_date]
                if model_field in ("tax_rate", "basic_eps"):
                    fields[model_field] = _to_float(val)
                else:
                    fields[model_field] = _to_billions(val)

        # Skip if no revenue data
        if not fields.get("total_revenue"):
            continue

        _, created = IncomeStatement.objects.update_or_create(
            stock=stock, on=on, defaults=fields
        )
        if created:
            count += 1

    return count


def _backfill_balance(stock, ticker):
    """Backfill balance sheets."""
    try:
        df = ticker.quarterly_balance_sheet
    except Exception:
        return 0

    if df is None or df.empty:
        return 0

    count = 0
    for col_date in df.columns:
        on = col_date.date() if hasattr(col_date, "date") else col_date
        if not isinstance(on, date):
            continue

        fields = {}
        for yf_col, model_field in BALANCE_MAP.items():
            if yf_col in df.index:
                val = df.loc[yf_col, col_date]
                if model_field == "share_issued":
                    # Shares in billions
                    fields[model_field] = _to_float(val) / 1_000_000_000
                else:
                    fields[model_field] = _to_billions(val)

        if not fields.get("total_assets"):
            continue

        _, created = BalanceSheet.objects.update_or_create(
            stock=stock, on=on, defaults=fields
        )
        if created:
            count += 1

    return count


def _backfill_cashflow(stock, ticker):
    """Backfill cash flow statements."""
    try:
        df = ticker.quarterly_cashflow
    except Exception:
        return 0

    if df is None or df.empty:
        return 0

    count = 0
    for col_date in df.columns:
        on = col_date.date() if hasattr(col_date, "date") else col_date
        if not isinstance(on, date):
            continue

        fields = {}
        for yf_col, model_field in CASHFLOW_MAP.items():
            if yf_col in df.index:
                val = df.loc[yf_col, col_date]
                fields[model_field] = _to_billions(val)

        if not fields.get("operating_cash_flow"):
            continue

        _, created = CashFlow.objects.update_or_create(
            stock=stock, on=on, defaults=fields
        )
        if created:
            count += 1

    return count
