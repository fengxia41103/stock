import logging

import pandas as pd

from stock.models import BalanceSheet
from stock.models import MyStock
from yahooquery import Ticker

logger = logging.getLogger("stock")

B = 10 ** 9


class MyBalanceSheet:
    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        s = Ticker(self.stock.symbol)

        # all numbers convert to million
        df = s.balance_sheet()
        if "unavailable" in df:
            logger.error(df)
            return

        # DB doesn't like NaN
        df = df.where(pd.notnull(df), 0)

        # enumerate data frame
        for row in df.itertuples(index=False):
            i, created = BalanceSheet.objects.get_or_create(
                stock=self.stock, on=row.asOfDate.date()
            )
            i.ap = float(row.AccountsPayable) / B

            i.cash_and_cash_equivalent = float(row.CashAndCashEquivalents) / B
            i.cash_cash_equivalents_and_short_term_investments = (
                float(row.CashCashEquivalentsAndShortTermInvestments) / B
            )
            i.common_stock_equity = float(row.CommonStockEquity) / B
            i.current_assets = float(row.CurrentAssets) / B
            i.current_liabilities = float(row.CurrentLiabilities) / B
            i.gross_ppe = float(row.GrossPPE) / B
            i.invested_capital = float(row.InvestedCapital) / B
            i.long_term_debt_and_capital_lease_obligation = (
                float(row.LongTermDebtAndCapitalLeaseObligation) / B
            )
            i.machinery_furniture_equipment = (
                float(row.MachineryFurnitureEquipment) / B
            )
            i.net_ppe = float(row.NetPPE) / B
            i.net_tangible_assets = float(row.NetTangibleAssets) / B
            i.other_short_term_investments = (
                float(row.OtherShortTermInvestments) / B
            )
            i.payables = float(row.Payables) / B
            i.payables_and_accrued_expenses = (
                float(row.PayablesAndAccruedExpenses) / B
            )
            i.receivables = float(row.Receivables) / B
            i.retained_earnings = float(row.RetainedEarnings) / B
            i.stockholders_equity = float(row.StockholdersEquity) / B
            i.tangible_book_value = float(row.TangibleBookValue) / B
            i.total_assets = float(row.TotalAssets) / B
            i.total_capitalization = float(row.TotalCapitalization) / B
            i.total_debt = float(row.TotalDebt) / B
            i.total_non_current_assets = float(row.TotalNonCurrentAssets) / B
            i.working_capital = float(row.WorkingCapital) / B

            try:
                i.long_term_debt = float(row.LongTermDebt) / B
            except AttributeError:
                i.long_term_debt = 0
            try:
                i.other_current_liabilities = (
                    float(row.OtherCurrentLiabilities) / B
                )
            except AttributeError:
                i.other_current_liabilities = 0

            try:
                i.land_and_improvements = float(row.LandAndImprovements) / B
            except AttributeError:
                i.land_and_improvements = 0
            try:
                i.ac = float(row.AccountsReceivable) / B
            except:
                i.ac = 0

            try:
                i.other_current_assets = float(row.OtherCurrentAssets) / B
            except AttributeError:
                i.other_current_assets = 0

            try:
                i.investments_and_advances = (
                    float(row.InvestmentsAndAdvances) / B
                )
            except AttributeError:
                i.investments_and_advances = 0

            try:
                i.current_debt = float(row.CurrentDebt) / B
            except AttributeError:
                i.current_debt = 0

            try:
                i.inventory = float(row.Inventory) / B
            except AttributeError:
                i.inventory = 0

            try:
                i.total_tax_payable = float(row.TotalTaxPayable) / B
            except AttributeError:
                i.total_tax_payable = 0

            try:
                i.available_for_sale_securities = (
                    float(row.AvailableForSaleSecurities) / B
                )
            except AttributeError:
                i.available_for_sale_securities = 0

            try:
                i.other_receivables = float(row.OtherReceivables) / B
            except AttributeError:
                i.other_receivables = 0

            try:
                i.other_current_borrowings = (
                    float(row.OtherCurrentBorrowings) / B
                )
            except AttributeError:
                i.other_current_borrowings = 0

            try:
                i.investmentin_financial_assets = (
                    float(row.InvestmentinFinancialAssets) / B
                )
            except AttributeError:
                i.investmentin_financial_assets = 0

            try:
                i.cash_equivalents = float(row.CashEquivalents) / B
            except AttributeError:
                i.cash_equivalents = 0

            try:
                i.cash_financial = float(row.CashFinancial) / B
            except AttributeError:
                i.cash_financial = 0

            try:
                i.commercial_paper = float(row.CommercialPaper) / B
            except AttributeError:
                i.commercial_paper = 0

            try:
                i.current_deferred_liabilities = (
                    float(row.CurrentDeferredLiabilities) / B
                )
            except AttributeError:
                i.current_deferred_liabilities = 0

            try:
                i.current_deferred_revenue = (
                    float(row.CurrentDeferredRevenue) / B
                )
            except AttributeError:
                i.current_deferred_revenue = 0

            try:
                i.leases = float(row.Leases) / B
            except AttributeError:
                i.leases = 0

            try:
                i.net_debt = float(row.NetDebt) / B
            except AttributeError:
                i.net_debt = 0

            i.save()
