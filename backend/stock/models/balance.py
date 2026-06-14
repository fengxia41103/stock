# -*- coding: utf-8 -*-

from django.db import models

from stock.models.base import StatementBase


class BalanceSheet(StatementBase):
    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="balances"
    )
    on = models.DateField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["stock", "on"])]

    total_assets = models.FloatField(null=True, blank=True, default=0)
    current_assets = models.FloatField(null=True, blank=True, default=0)
    cash_cash_equivalents_and_short_term_investments = models.FloatField(null=True, blank=True, default=0)
    cash_and_cash_equivalent = models.FloatField(null=True, blank=True, default=0)
    other_short_term_investments = models.FloatField(null=True, blank=True, default=0)
    cash_equivalents = models.FloatField(null=True, blank=True, default=0)
    receivables = models.FloatField(null=True, blank=True, default=0)
    ar = models.FloatField(null=True, blank=True, default=0, verbose_name="Account Receivable")
    gross_accounts_receivable = models.FloatField(null=True, blank=True, default=0)
    allowance_for_doubtful_accounts_receivable = models.FloatField(null=True, blank=True, default=0)
    other_receivables = models.FloatField(null=True, blank=True, default=0)
    inventory = models.FloatField(null=True, blank=True, default=0)
    other_current_assets = models.FloatField(null=True, blank=True, default=0)
    total_non_current_assets = models.FloatField(null=True, blank=True, default=0, verbose_name="Fixed Assets")
    net_ppe = models.FloatField(null=True, blank=True, default=0)
    gross_ppe = models.FloatField(null=True, blank=True, default=0)
    properties = models.FloatField(null=True, blank=True, default=0)
    land_and_improvements = models.FloatField(null=True, blank=True, default=0)
    machinery_furniture_equipment = models.FloatField(null=True, blank=True, default=0)
    leases = models.FloatField(null=True, blank=True, default=0)
    accumulated_depreciation = models.FloatField(null=True, blank=True, default=0)
    goodwill_and_other_intangible_assets = models.FloatField(null=True, blank=True, default=0)
    goodwill = models.FloatField(null=True, blank=True, default=0)
    other_intangible_assets = models.FloatField(null=True, blank=True, default=0)
    investments_and_advances = models.FloatField(null=True, blank=True, default=0)
    investmentin_financial_assets = models.FloatField(null=True, blank=True, default=0)
    available_for_sale_securities = models.FloatField(null=True, blank=True, default=0)
    other_non_current_assets = models.FloatField(null=True, blank=True, default=0)
    current_liabilities = models.FloatField(null=True, blank=True, default=0)
    current_deferred_liabilities = models.FloatField(null=True, blank=True, default=0)
    other_current_liabilities = models.FloatField(null=True, blank=True, default=0)
    current_debt_and_capital_lease_obligation = models.FloatField(null=True, blank=True, default=0)
    current_debt = models.FloatField(null=True, blank=True, default=0)
    commercial_paper = models.FloatField(null=True, blank=True, default=0)
    other_current_borrowings = models.FloatField(null=True, blank=True, default=0)
    payables_and_accrued_expenses = models.FloatField(null=True, blank=True, default=0)
    payables = models.FloatField(null=True, blank=True, default=0)
    ap = models.FloatField(null=True, blank=True, default=0, verbose_name="Account Payable")
    total_tax_payable = models.FloatField(null=True, blank=True, default=0)
    current_deferred_revenue = models.FloatField(null=True, blank=True, default=0)
    total_non_current_liabilities_net_minority_interest = models.FloatField(null=True, blank=True, default=0)
    tradeand_other_payables_non_current = models.FloatField(null=True, blank=True, default=0)
    other_non_current_liabilities = models.FloatField(null=True, blank=True, default=0)
    long_term_debt_and_capital_lease_obligation = models.FloatField(null=True, blank=True, default=0)
    long_term_debt = models.FloatField(null=True, blank=True, default=0)
    non_current_deferred_liabilities = models.FloatField(null=True, blank=True, default=0)
    non_current_deferred_taxes_liabilities = models.FloatField(null=True, blank=True, default=0)
    non_current_deferred_revenue = models.FloatField(null=True, blank=True, default=0)
    stockholders_equity = models.FloatField(null=True, blank=True, default=0)
    common_stock = models.FloatField(null=True, blank=True, default=0)
    retained_earnings = models.FloatField(null=True, blank=True, default=0)
    gains_losses_not_affecting_retained_earnings = models.FloatField(null=True, blank=True, default=0)
    total_capitalization = models.FloatField(null=True, blank=True, default=0)
    common_stock_equity = models.FloatField(null=True, blank=True, default=0)
    net_tangible_assets = models.FloatField(null=True, blank=True, default=0)
    working_capital = models.FloatField(null=True, blank=True, default=0)
    invested_capital = models.FloatField(null=True, blank=True, default=0)
    tangible_book_value = models.FloatField(null=True, blank=True, default=0)
    total_debt = models.FloatField(null=True, blank=True, default=0)
    net_debt = models.FloatField(null=True, blank=True, default=0)
    cash_financial = models.FloatField(null=True, blank=True, default=0)
    share_issued = models.FloatField(null=True, blank=True, default=0)

    @property
    def total_liability(self):
        return self.total_assets - self.stockholders_equity

    @property
    def current_ratio(self):
        return self._as_of_ratio("current_assets", "current_liabilities")

    @property
    def quick_ratio(self):
        """Acid test with 50% AR haircut."""
        AR_LOSS_RATIO = 0.5
        if not self.current_liabilities:
            return 0
        return (
            self.cash_cash_equivalents_and_short_term_investments
            + self.ar * AR_LOSS_RATIO
            - self.inventory
        ) / self.current_liabilities

    @property
    def capital_structure(self):
        """Debt % of total assets."""
        return self._as_of_pcnt("total_debt", "total_assets")

    @property
    def debt_growth_rate(self):
        return self._growth_rate("BalanceSheet", "total_debt")

    @property
    def ap_growth_rate(self):
        return self._growth_rate("BalanceSheet", "ap")

    @property
    def ar_growth_rate(self):
        return self._growth_rate("BalanceSheet", "ar")

    @property
    def all_cash_growth_rate(self):
        return self._growth_rate("BalanceSheet", "cash_cash_equivalents_and_short_term_investments")

    @property
    def working_capital_growth_rate(self):
        return self._growth_rate("BalanceSheet", "working_capital")

    @property
    def invested_capital_growth_rate(self):
        return self._growth_rate("BalanceSheet", "invested_capital")

    @property
    def net_ppe_growth_rate(self):
        return self._growth_rate("BalanceSheet", "net_ppe")

    @property
    def equity_multiplier(self):
        """Assets / Shareholder Equity (DuPont leverage factor)."""
        if self.stockholders_equity < 0:
            return 0
        return self._as_of_ratio("total_assets", "stockholders_equity")

    @property
    def debt_to_equity_ratio(self):
        if self.stockholders_equity < 0:
            return 0
        return self._as_of_ratio("total_debt", "stockholders_equity")

    @property
    def liability_to_asset(self):
        return self._as_of_pcnt("total_liability", "total_assets")

    @property
    def working_capital_to_current_liabilities(self):
        return self._as_of_ratio("working_capital", "current_liabilities")

    @property
    def non_current_to_equity(self):
        return self._as_of_ratio("total_non_current_assets", "stockholders_equity")

    @property
    def current_asset_to_total_asset(self):
        return self._as_of_pcnt("current_assets", "total_assets")

    @property
    def retained_earnings_to_equity(self):
        return self._as_of_pcnt("retained_earnings", "stockholders_equity")

    @property
    def inventory_to_current_asset(self):
        return self._as_of_pcnt("inventory", "current_assets")

    @property
    def cash_cash_equivalents_and_short_term_investments_to_current_asset(self):
        return self._as_of_pcnt("cash_cash_equivalents_and_short_term_investments", "current_assets")

    @property
    def equity_growth_rate(self):
        return self._growth_rate("BalanceSheet", "stockholders_equity")

    @property
    def tangible_book_value_per_share(self):
        return self._as_of_ratio("tangible_book_value", "share_issued")

    @property
    def cash_and_cash_equivalent_per_share(self):
        return self._as_of_ratio("cash_and_cash_equivalent", "share_issued")

    @property
    def price_to_cash_premium(self):
        """Price over cash per share on this reporting date."""
        return self._as_of_his_ratio(
            "cash_and_cash_equivalent_per_share", "MyStockHistorical", "close_price"
        )

    @property
    def share_issued_growth_rate(self):
        return self._growth_rate("BalanceSheet", "share_issued")
