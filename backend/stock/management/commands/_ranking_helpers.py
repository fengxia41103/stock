# -*- coding: utf-8 -*-
"""Shared ranking computation logic used by management command and Celery task."""

from datetime import date, timedelta

from stock.models import BalanceSheet, CashFlow, IncomeStatement, MyStock, ValuationRatio


def _rank_objects(objs, attrs):
    """Compute ranking for a set of objects and attributes."""
    start = date.today() - timedelta(days=180)
    ranks = []
    for idx, attr, high_to_low in attrs:
        valid_entries = [
            x for x in objs.filter(on__gte=start)
            if getattr(x, attr) and getattr(x, attr) != -100
        ]
        data_set = sorted(valid_entries, key=lambda x: getattr(x, attr), reverse=high_to_low)

        vals = []
        counted = set()
        for x in data_set:
            symbol = x.stock.symbol
            if symbol in counted:
                continue
            counted.add(symbol)
            vals.append({"id": x.stock.id, "symbol": symbol, "on": str(x.on), "val": getattr(x, attr)})
        ranks.append({"id": idx, "name": attr, "stats": vals})
    return ranks


def compute_all_rankings():
    """Compute all ranking types and return dict of {type: data}."""
    stocks = MyStock.objects.all()

    # Stock ranks (from model fields)
    stock_attrs = [(0, "roe", True), (1, "dupont_roe", True), (2, "roe_dupont_reported_gap", False)]
    stock_ranks = []
    for idx, attr, high_to_low in stock_attrs:
        vals = [{"id": s.id, "symbol": s.symbol, "val": getattr(s, attr)} for s in stocks]
        vals = [v for v in vals if v["val"] and v["val"] != -100]
        vals.sort(key=lambda x: x["val"], reverse=high_to_low)
        stock_ranks.append({"id": idx, "name": attr, "stats": vals})

    # Balance ranks
    balance_attrs = [
        (0, "current_ratio", True), (1, "quick_ratio", True),
        (2, "debt_to_equity_ratio", False), (3, "equity_multiplier", False),
        (4, "price_to_cash_premium", False), (5, "equity_growth_rate", True),
        (6, "debt_growth_rate", False), (7, "ap_growth_rate", False),
        (8, "ar_growth_rate", False), (9, "all_cash_growth_rate", True),
        (10, "working_capital_growth_rate", False), (11, "invested_capital_growth_rate", False),
        (12, "share_issued_growth_rate", False),
        (13, "cash_cash_equivalents_and_short_term_investments_to_current_asset", True),
        (14, "liability_to_asset", False), (15, "non_current_to_equity", True),
        (16, "retained_earnings_to_equity", True), (17, "inventory_to_current_asset", False),
        (18, "working_capital_to_current_liabilities", True),
    ]
    balance_ranks = _rank_objects(BalanceSheet.objects.select_related("stock"), balance_attrs)

    # Cash ranks
    cash_attrs = [
        (0, "dividend_payout_ratio", True), (1, "operating_cash_flow_growth", True),
        (2, "cash_change_pcnt", True), (3, "fcf_over_ocf", True),
        (4, "fcf_over_net_income", True), (5, "ocf_over_net_income", True),
    ]
    cash_ranks = _rank_objects(CashFlow.objects.select_related("stock"), cash_attrs)

    # Income ranks
    income_attrs = [
        (0, "net_income_growth_rate", True), (1, "operating_income_growth_rate", True),
        (2, "gross_profit_to_revenue", True), (3, "net_income_to_revenue", True),
        (4, "operating_profit_to_operating_income", True), (5, "net_income_to_operating_income", True),
        (6, "pretax_income_to_revenue", True), (7, "cogs_to_revenue", False),
        (8, "ebit_to_revenue", True), (9, "total_expense_to_revenue", False),
        (10, "operating_income_to_revenue", True), (11, "operating_expense_to_revenue", False),
        (12, "selling_ga_to_revenue", False), (13, "interest_income_to_revenue", False),
        (14, "other_income_expense_to_revenue", False), (15, "ebit_to_total_asset", True),
        (16, "net_income_to_equity", True), (17, "cogs_to_inventory", True),
        (18, "interest_coverage_ratio", True),
    ]
    income_ranks = _rank_objects(IncomeStatement.objects.select_related("stock"), income_attrs)

    # Valuation ranks
    valuation_attrs = [(0, "pe", False), (1, "pb", False), (2, "ps", False)]
    valuation_ranks = _rank_objects(ValuationRatio.objects.select_related("stock"), valuation_attrs)

    return {
        "stock": stock_ranks,
        "balance": balance_ranks,
        "cash": cash_ranks,
        "income": income_ranks,
        "valuation": valuation_ranks,
    }
