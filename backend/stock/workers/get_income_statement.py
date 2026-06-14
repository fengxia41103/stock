from stock.models import IncomeStatement
from stock.workers.base import StatementWorker


class MyIncomeStatement(StatementWorker):
    model = IncomeStatement
    yahoo_method = "income_statement"
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
