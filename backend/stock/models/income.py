# -*- coding: utf-8 -*-

from django.db import models

from stock.models.base import StatementBase


class IncomeStatement(StatementBase):
    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="incomes"
    )
    on = models.DateField(null=True, blank=True)

    total_revenue = models.FloatField(null=True, blank=True, default=0, verbose_name="Sales")
    operating_revenue = models.FloatField(null=True, blank=True, default=0)
    cost_of_revenue = models.FloatField(null=True, blank=True, default=0)
    gross_profit = models.FloatField(null=True, blank=True, default=0)
    operating_expense = models.FloatField(null=True, blank=True, default=0)
    research_and_development = models.FloatField(null=True, blank=True, default=0)
    selling_general_and_administration = models.FloatField(null=True, blank=True, default=0)
    general_and_administrative_expense = models.FloatField(null=True, blank=True, default=0)
    selling_and_marketing_expense = models.FloatField(null=True, blank=True, default=0)
    operating_income = models.FloatField(null=True, blank=True, default=0)
    net_non_operating_interest_income_expense = models.FloatField(null=True, blank=True, default=0)
    interest_income_non_operating = models.FloatField(null=True, blank=True, default=0)
    interest_expense_non_operating = models.FloatField(null=True, blank=True, default=0)
    other_income_expense = models.FloatField(null=True, blank=True, default=0)
    other_non_operating_income_expenses = models.FloatField(null=True, blank=True, default=0)
    pretax_income = models.FloatField(null=True, blank=True, default=0)
    tax_provision = models.FloatField(null=True, blank=True, default=0)
    net_income_common_stockholders = models.FloatField(null=True, blank=True, default=0)
    total_operating_income_as_reported = models.FloatField(null=True, blank=True, default=0)
    total_expenses = models.FloatField(null=True, blank=True, default=0)
    net_income_from_continuing_and_discontinued_operation = models.FloatField(null=True, blank=True, default=0)
    normalized_income = models.FloatField(null=True, blank=True, default=0)
    interest_income = models.FloatField(null=True, blank=True, default=0)
    interest_expense = models.FloatField(null=True, blank=True, default=0)
    net_interest_income = models.FloatField(null=True, blank=True, default=0)
    ebit = models.FloatField(null=True, blank=True, default=0)
    ebitda = models.FloatField(null=True, blank=True, default=0)
    reconciled_cost_of_revenue = models.FloatField(null=True, blank=True, default=0, verbose_name="COGS")
    reconciled_depreciation = models.FloatField(null=True, blank=True, default=0)
    net_income_from_continuing_operation_net_minority_interest = models.FloatField(null=True, blank=True, default=0)
    net_income = models.FloatField(null=True, blank=True, default=0)
    normalized_ebitda = models.FloatField(null=True, blank=True, default=0)
    basic_eps = models.FloatField(null=True, blank=True, default=0)
    tax_rate = models.FloatField(null=True, blank=True, default=0)

    @property
    def net_income_to_revenue(self):
        return self._as_of_pcnt("net_income", "total_revenue")

    @property
    def gross_profit_to_revenue(self):
        return self._as_of_pcnt("gross_profit", "total_revenue")

    @property
    def cogs_to_revenue(self):
        return self._as_of_pcnt("reconciled_cost_of_revenue", "total_revenue")

    @property
    def ebit_to_revenue(self):
        return self._as_of_pcnt("ebit", "total_revenue")

    @property
    def total_expense_to_revenue(self):
        return self._as_of_pcnt("total_expenses", "total_revenue")

    @property
    def operating_income_to_revenue(self):
        return self._as_of_pcnt("operating_income", "total_revenue")

    @property
    def operating_expense_to_revenue(self):
        return self._as_of_pcnt("operating_expense", "total_revenue")

    @property
    def selling_ga_to_revenue(self):
        return self._as_of_pcnt("selling_general_and_administration", "total_revenue")

    @property
    def interest_income_to_revenue(self):
        return self._as_of_pcnt("interest_income", "total_revenue")

    @property
    def other_income_expense_to_revenue(self):
        return self._as_of_pcnt("other_income_expense", "total_revenue")

    @property
    def pretax_income_to_revenue(self):
        return self._as_of_pcnt("pretax_income", "total_revenue")

    @property
    def operating_profit(self):
        return self.operating_income - self.operating_expense

    @property
    def operating_profit_to_operating_income(self):
        return self._as_of_pcnt("operating_profit", "operating_income")

    @property
    def net_income_to_operating_income(self):
        return self._as_of_pcnt("net_income", "operating_income")

    @property
    def ebit_to_total_asset(self):
        return self._as_of_his_pcnt("ebit", "BalanceSheet", "total_assets")

    @property
    def net_income_to_equity(self):
        return self._as_of_his_pcnt("net_income", "BalanceSheet", "stockholders_equity")

    @property
    def net_income_growth_rate(self):
        return self._growth_rate("IncomeStatement", "net_income")

    @property
    def operating_income_growth_rate(self):
        return self._growth_rate("IncomeStatement", "operating_income")

    @property
    def cogs_to_inventory(self):
        return self._as_of_his_ratio("reconciled_cost_of_revenue", "BalanceSheet", "inventory")

    @property
    def interest_coverage_ratio(self):
        return self._as_of_ratio("ebit", "interest_expense")
