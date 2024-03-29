import logging

import pandas as pd

from stock.models import BalanceSheet
from stock.models import MyStock
from yahooquery import Ticker

logger = logging.getLogger("stock")

M = 10 ** 6
B = 10 ** 9


class MyBalanceSheet:
    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        s = Ticker(self.stock.symbol, timeout=15)

        # all numbers convert to million
        df = s.balance_sheet(frequency="q")
        if "unavailable" in df or "error" in df:
            logger.error("{}: {}".format(self.stock.symbol, df))
            return

        # DB doesn't like NaN
        df = df.where(pd.notnull(df), 0)

        # mapping between model field (left) and data json key (right)
        mapping = {
            "ap": "AccountsPayable",
            "cash_and_cash_equivalent": "CashAndCashEquivalents",
            "cash_cash_equivalents_and_short_term_investments": "CashCashEquivalentsAndShortTermInvestments",
            "common_stock": "CommonStock",
            "common_stock_equity": "CommonStockEquity",
            "invested_capital": "InvestedCapital",
            "long_term_debt_and_capital_lease_obligation": "LongTermDebtAndCapitalLeaseObligation",
            "machinery_furniture_equipment": "MachineryFurnitureEquipment",
            "net_ppe": "NetPPE",
            "net_tangible_assets": "NetTangibleAssets",
            "payables": "Payables",
            "payables_and_accrued_expenses": "PayablesAndAccruedExpenses",
            "retained_earnings": "RetainedEarnings",
            "stockholders_equity": "StockholdersEquity",
            "tangible_book_value": "TangibleBookValue",
            "total_assets": "TotalAssets",
            "total_capitalization": "TotalCapitalization",
            "total_debt": "TotalDebt",
            "total_non_current_assets": "TotalNonCurrentAssets",
            "working_capital": "WorkingCapital",
            "gross_ppe": "GrossPPE",
            "current_assets": "CurrentAssets",
            "current_liabilities": "CurrentLiabilities",
            "receivables": "Receivables",
            "other_short_term_investments": "OtherShortTermInvestments",
            "long_term_debt": "LongTermDebt",
            "other_current_liabilities": "OtherCurrentLiabilities",
            "land_and_improvements": "LandAndImprovements",
            "ar": "AccountsReceivable",
            "other_current_assets": "OtherCurrentAssets",
            "investments_and_advances": "InvestmentsAndAdvances",
            "current_debt": "CurrentDebt",
            "inventory": "Inventory",
            "total_tax_payable": "TotalTaxPayable",
            "available_for_sale_securities": "AvailableForSaleSecurities",
            "other_receivables": "OtherReceivables",
            "other_current_borrowings": "OtherCurrentBorrowings",
            "investmentin_financial_assets": "InvestmentinFinancialAssets",
            "cash_equivalents": "CashEquivalents",
            "cash_financial": "CashFinancial",
            "commercial_paper": "CommercialPaper",
            "current_deferred_liabilities": "CurrentDeferredLiabilities",
            "current_deferred_revenue": "CurrentDeferredRevenue",
            "leases": "Leases",
            "net_debt": "NetDebt",
            "accumulated_depreciation": "AccumulatedDepreciation",
            "allowance_for_doubtful_accounts_receivable": "AllowanceForDoubtfulAccountsReceivable",
            "properties": "Properties",
            "goodwill": "Goodwill",
            "goodwill_and_other_intangible_assets": "GoodwillAndOtherIntangibleAssets",
            "other_intangible_assets": "OtherIntangibleAssets",
            "other_non_current_assets": "OtherNonCurrentAssets",
            "current_debt_and_capital_lease_obligation": "CurrentDebtAndCapitalLeaseObligation",
            "other_current_liabilities": "OtherCurrentLiabilities",
            "total_non_current_liabilities_net_minority_interest": "TotalNonCurrentLiabilitiesNetMinorityInterest",
            "non_current_deferred_liabilities": "NonCurrentDeferredLiabilities",
            "tradeand_other_payables_non_current": "TradeandOtherPayablesNonCurrent",
            "other_non_current_liabilities": "OtherNonCurrentLiabilities",
            "non_current_deferred_taxes_liabilities": "NonCurrentDeferredTaxesLiabilities",
            "non_current_deferred_revenue": "NonCurrentDeferredRevenue",
            "share_issued": "ShareIssued",
        }

        # enumerate data frame
        for row in df.itertuples(index=False):
            i, created = BalanceSheet.objects.get_or_create(
                stock=self.stock, on=row.asOfDate.date()
            )

            for key, val in mapping.items():
                try:
                    # value can be None
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
