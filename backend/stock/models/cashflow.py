# -*- coding: utf-8 -*-

from django.db import models

from stock.models.base import StatementBase


class CashFlow(StatementBase):
    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="cashes"
    )
    on = models.DateField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["stock", "on"])]

    beginning_cash = models.FloatField(null=True, blank=True, default=0)
    ending_cash = models.FloatField(null=True, blank=True, default=0)
    free_cash_flow = models.FloatField(null=True, blank=True, default=0)
    net_income = models.FloatField(null=True, blank=True, default=0)
    da = models.FloatField(null=True, blank=True, default=0, verbose_name="Depreciation and Amortization")
    operating_cash_flow = models.FloatField(null=True, blank=True, default=0)
    from_continuing_financing_activity = models.FloatField(null=True, blank=True, default=0)
    sale_of_investment = models.FloatField(null=True, blank=True, default=0)
    investing_cash_flow = models.FloatField(null=True, blank=True, default=0)
    capex = models.FloatField(null=True, blank=True, default=0)
    dividend_paid = models.FloatField(null=True, blank=True, default=0)
    common_stock_issuance = models.FloatField(null=True, blank=True, default=0)
    purchase_of_business = models.FloatField(null=True, blank=True, default=0)
    purchase_of_investment = models.FloatField(null=True, blank=True, default=0)
    repayment_of_debt = models.FloatField(null=True, blank=True, default=0)
    repurchase_of_capital_stock = models.FloatField(null=True, blank=True, default=0)
    stock_based_compensation = models.FloatField(null=True, blank=True, default=0)
    change_in_inventory = models.FloatField(null=True, blank=True, default=0)
    change_in_account_payable = models.FloatField(null=True, blank=True, default=0)
    change_in_working_capital = models.FloatField(null=True, blank=True, default=0)
    change_in_account_receivable = models.FloatField(null=True, blank=True, default=0)
    net_other_financing_charges = models.FloatField(null=True, blank=True, default=0)
    net_other_investing_changes = models.FloatField(null=True, blank=True, default=0)
    change_in_cash_supplemental_as_reported = models.FloatField(null=True, blank=True, default=0)

    @property
    def cash_change_pcnt(self):
        try:
            return (self.ending_cash - self.beginning_cash) / self.beginning_cash * 100
        except ZeroDivisionError:
            return 0

    @property
    def operating_cash_flow_growth(self):
        return self._growth_rate("CashFlow", "operating_cash_flow")

    @property
    def fcf_over_ocf(self):
        """FCF as % of operating cash flow."""
        if self.operating_cash_flow < 0:
            return 0
        return self._as_of_pcnt("free_cash_flow", "operating_cash_flow")

    @property
    def fcf_over_net_income(self):
        """FCF as % of net income."""
        if self.net_income < 0:
            return 0
        return self._as_of_pcnt("free_cash_flow", "net_income")

    @property
    def ocf_over_net_income(self):
        """Operating cash flow as % of net income."""
        if self.net_income < 0:
            return 0
        return self._as_of_pcnt("operating_cash_flow", "net_income")

    @property
    def dividend_payout_ratio(self):
        """Dividend paid / net income."""
        if self.net_income < 0:
            return 0
        return self._as_of_pcnt("dividend_paid", "net_income")
