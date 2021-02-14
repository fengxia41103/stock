import logging

import pandas as pd

from stock.models import CashFlow
from stock.models import MyStock
from yahooquery import Ticker

logger = logging.getLogger("stock")

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

        # enumerate data frame
        for row in df.itertuples(index=False):
            i, created = CashFlow.objects.get_or_create(
                stock=self.stock, on=row.asOfDate.date()
            )
            i.beginning_cash = float(row.BeginningCashPosition) / B
            i.ending_cash = float(row.EndCashPosition) / B
            i.free_cash_flow = float(row.FreeCashFlow) / B
            i.investing_cash_flow = float(row.InvestingCashFlow) / B
            i.net_income = float(row.NetIncome) / B
            i.operating_cash_flow = float(row.OperatingCashFlow) / B
            i.da = float(row.DepreciationAndAmortization) / B
            i.capex = float(row.CapitalExpenditure) / B
            i.dividend_paid = float(row.CashDividendsPaid) / B
            i.from_continuing_financing_activity = (
                float(row.CashFlowFromContinuingFinancingActivities) / B
            )
            i.change_in_inventory = float(row.ChangeInInventory) / B
            i.change_in_account_payable = float(row.ChangeInAccountPayable) / B
            i.change_in_working_capital = float(row.ChangeInWorkingCapital) / B
            i.change_in_account_receivable = (
                float(row.ChangesInAccountReceivables) / B
            )

            try:
                i.common_stock_issuance = float(row.CommonStockIssuance) / B
            except AttributeError:
                i.common_stock_issuance = 0

            i.purchase_of_business = float(row.PurchaseOfBusiness) / B
            i.purchase_of_investment = float(row.PurchaseOfInvestment) / B

            try:
                i.repurchase_of_capital_stock = (
                    float(row.RepurchaseOfCapitalStock) / B
                )
            except AttributeError:
                i.repurchase_of_capital_stock = 0

            i.sale_of_investment = float(row.SaleOfInvestment) / B
            i.stock_based_compensation = float(row.StockBasedCompensation) / B
            i.net_other_financing_charges = (
                float(row.NetOtherFinancingCharges) / B
            )
            i.net_other_investing_changes = (
                float(row.NetOtherInvestingChanges) / B
            )
            i.change_in_cash_supplemental_as_reported = (
                float(row.ChangeInCashSupplementalAsReported) / B
            )

            i.save()
