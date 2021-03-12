import React, { useContext } from "react";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";
import FinancialsView from "src/views/stock/FinancialsView";

function IncomeView(props) {
  const { incomes: data } = useContext(StockDetailContext);

  const reported = {
    basic_eps: "Basic EPS",
    operating_profit: "Operating Profit",
  };

  const pcnt = {
    gross_profit_to_revenue: "Gross Profit Margin",
    net_income_to_revenue: "Net Profit Margin",
    cogs_to_revenue: "COGS/Total Revenue",
    operating_income_to_revenue: "Operating Income/Total Revenue",
    operating_expense_to_revenue: "Operating Expense/Total Revenue",
    selling_ga_to_revenue: "Selling G&A/Total Revenue",
    ebit_to_revenue: "EBIT/Total Revenue",
    total_expense_to_revenue: "Total Expense/Total Revenue",
    interest_income_to_revenue: "Interest Income/Total Revenue",
    other_income_expense_to_revenue: "Other Income Expense/Total Revenue",
    pretax_income_to_revenue: "Pretax Income/Total Revenue",
    operating_profit_to_operating_income: "Operating Gross Profit Margin",
    net_income_to_operating_income: "Operating Net Profit Margin",
    ebit_to_total_asset: "EBIT/Total Asset",
    net_income_to_equity: "Net Income/Equity (Net ROE)",
  };
  const p2p_growth = {
    net_income_growth_rate: "Net Income",
    operating_income_growth_rate: "Operating Income",
  };
  const ratio = {
    cogs_to_inventory: "COGS/Inventory",
    interest_coverage_ratio: "Interest Coverage",
  };
  return (
    <FinancialsView
      title="Income Statement"
      data={data}
      reported={reported}
      p2p_growth={p2p_growth}
      pcnt={pcnt}
      ratio={ratio}
    />
  );
}

export default IncomeView;
