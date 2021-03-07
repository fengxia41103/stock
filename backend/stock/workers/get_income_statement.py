import logging

import pandas as pd

from stock.models import IncomeStatement
from stock.models import MyStock
from yahooquery import Ticker

logger = logging.getLogger("stock")

M = 10 ** 6
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

        mapping = {
            "basic_eps": "BasicEPS",
            "ebit": "EBIT",
            "net_income": "NetIncome",
            "normalized_ebitda": "NormalizedEBITDA",
            "operating_expense": "OperatingExpense",
            "operating_income": "OperatingIncome",
            "operating_revenue": "OperatingRevenue",
            "pretax_income": "PretaxIncome",
            "selling_general_and_administration": "SellingGeneralAndAdministration",
            "total_expenses": "TotalExpenses",
            "total_revenue": "TotalRevenue",
            "tax_rate": "TaxRateForCalcs",
            "gross_profit": "GrossProfit",
            "general_and_administrative_expense": "GeneralAndAdministrativeExpense",
            "research_and_development": "ResearchAndDevelopment",
            "selling_and_marketing_expense": "SellingAndMarketingExpense",
            "total_operating_income_as_reported": "TotalOperatingIncomeAsReported",
            "reconciled_cost_of_revenue": "ReconciledCostOfRevenue",
            "cost_of_revenue": "CostOfRevenue",
            "interest_expense_non_operating": "InterestExpenseNonOperating",
            "interest_income_non_operating": "InterestIncomeNonOperating",
            "other_income_expense": "OtherIncomeExpense",
            "other_non_operating_income_expenses": "OtherNonOperatingIncomeExpenses",
            "tax_provision": "TaxProvision",
            "net_income_common_stockholders": "NetIncomeCommonStockholders",
            "net_income_from_continuing_and_discontinued_operation": "NetIncomeFromContinuingAndDiscontinuedOperation",
            "interest_income": "InterestIncome",
            "interest_expense": "InterestExpense",
            "net_interest_income": "NetInterestIncome",
            "ebitda": "EBITDA",
            "reconciled_depreciation": "ReconciledDepreciation",
            "net_income_from_continuing_operation_net_minority_interest": "NetIncomeFromContinuingOperationNetMinorityInterest",
        }
        # enumerate data frame
        for row in df.itertuples(index=False):
            i, created = IncomeStatement.objects.get_or_create(
                stock=self.stock, on=row.asOfDate.date()
            )

            for key, val in mapping.items():
                try:
                    tmp = float(getattr(row, val))
                except AttributeError:
                    tmp = 0

                # if tmp is a large number, it's unlikely a rate,
                # eg. tax rate, thus convert it to B.
                if abs(tmp) > M:
                    tmp = tmp / B

                # set value
                setattr(i, key, tmp)

            i.save()
