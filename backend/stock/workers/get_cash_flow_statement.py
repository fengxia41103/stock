from stock.models import CashFlow
from stock.workers.base import StatementWorker


class MyCashFlowStatement(StatementWorker):
    model = CashFlow
    yahoo_method = "cash_flow"
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
