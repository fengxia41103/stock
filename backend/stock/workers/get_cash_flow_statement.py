import logging

import pandas as pd

from stock.models import CashFlow
from stock.models import MyStock
from yahooquery import Ticker

logger = logging.getLogger("stock")

M = 10 ** 6
B = 10 ** 9


class MyCashFlowStatement:
    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        s = Ticker(self.stock.symbol)

        # all numbers convert to million
        df = s.cash_flow()
        if "unavailable" in df:
            logger.error(df)
            return

        # DB doesn't like NaN
        df = df.where(pd.notnull(df), 0)

        mapping = {
            "beginning_cash": "BeginningCashPosition",
            "ending_cash": "EndCashPosition",
            "free_cash_flow": "FreeCashFlow",
            "investing_cash_flow": "InvestingCashFlow",
            "net_income": "NetIncome",
            "operating_cash_flow": "OperatingCashFlow",
            "da": "DepreciationAndAmortization",
            "capex": "CapitalExpenditure",
            "from_continuing_financing_activity": "CashFlowFromContinuingFinancingActivities",
            "change_in_working_capital": "ChangeInWorkingCapital",
            "stock_based_compensation": "StockBasedCompensation",
            "change_in_cash_supplemental_as_reported": "ChangeInCashSupplementalAsReported",
            "sale_of_investment": "SaleOfInvestment",
            "purchase_of_investment": "PurchaseOfInvestment",
            "common_stock_issuance": "CommonStockIssuance",
            "repurchase_of_capital_stock": "RepurchaseOfCapitalStock",
            "change_in_inventory": "ChangeInInventory",
            "dividend_paid": "CashDividendsPaid",
            "change_in_account_payable": "ChangeInAccountPayable",
            "change_in_account_receivable": "ChangesInAccountReceivables",
            "purchase_of_business": "PurchaseOfBusiness",
            "net_other_financing_charges": "NetOtherFinancingCharges",
            "net_other_investing_changes": "NetOtherInvestingChanges",
        }
        # enumerate data frame
        for row in df.itertuples(index=False):
            i, created = CashFlow.objects.get_or_create(
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
