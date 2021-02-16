import logging

import pandas as pd

from stock.models import IncomeStatement
from stock.models import MyStock
from yahooquery import Ticker

logger = logging.getLogger("stock")

B = 10 ** 9


class MyIncomeStatement:
    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        s = Ticker(self.stock.symbol)

        # all numbers convert to million
        df = s.income_statement()
        if "unavailable" in df:
            logger.error(df)
            return

        # DB doesn't like NaN
        df = df.where(pd.notnull(df), 0)

        # enumerate data frame
        for row in df.itertuples(index=False):
            i, created = IncomeStatement.objects.get_or_create(
                stock=self.stock, on=row.asOfDate.date()
            )
            i.basic_eps = float(row.BasicEPS)
            i.ebit = float(row.EBIT) / B
            i.gross_profit = float(row.GrossProfit) / B
            i.net_income = float(row.NetIncome) / B
            i.normalized_ebitda = float(row.NormalizedEBITDA) / B
            i.operating_expense = float(row.OperatingExpense) / B
            i.operating_income = float(row.OperatingIncome) / B
            i.operating_revenue = float(row.OperatingRevenue) / B
            i.pretax_income = float(row.PretaxIncome) / B

            i.selling_general_and_administration = (
                float(row.SellingGeneralAndAdministration) / B
            )
            i.total_expenses = float(row.TotalExpenses) / B
            i.total_revenue = float(row.TotalRevenue) / B
            i.tax_rate = row.TaxRateForCalcs

            # some don't have this field!?
            try:
                i.general_and_administrative_expense = (
                    float(row.GeneralAndAdministrativeExpense) / B
                )
            except AttributeError:
                i.general_and_administrative_expense = 0

            try:
                i.research_and_development = (
                    float(row.ResearchAndDevelopment) / B
                )
            except AttributeError:
                i.research_and_development = 0

            try:
                i.selling_and_marketing_expense = (
                    float(row.SellingAndMarketingExpense) / B
                )
            except AttributeError:
                i.selling_and_marketing_expense = 0

            try:
                i.total_operating_income_as_reported = (
                    float(row.TotalOperatingIncomeAsReported) / B
                )
            except AttributeError:
                i.total_operating_income_as_reported = 0

            # COGS
            if row.ReconciledCostOfRevenue > 0:
                i.reconciled_cost_of_revenue = (
                    float(row.ReconciledCostOfRevenue) / B
                )
            else:
                i.reconciled_cost_of_revenue = i.total_revenue - i.gross_profit

            i.save()
