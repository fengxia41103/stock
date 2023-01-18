import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";

import { Typography } from "@mui/material";

import { ShowResource } from "@fengxia41103/storybook";

import FinancialCard from "@Components/stock/FinancialCard";
import StockDetailContext from "@Views/stock/StockDetailView/context";

const IncomeView = () => {
  const { id } = useParams();
  const stock = useContext(StockDetailContext);
  const { symbol } = stock;

  const [resource] = useState(`/incomes?stock=${id}`);

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

  const render_data = (resp) => {
    const data = resp.objects;

    return (
      <>
        <Typography variant="h1">{symbol} Income Statement</Typography>
        <FinancialCard {...{ data, reported, ratio, pcnt, p2p_growth }} />
      </>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
};

export default IncomeView;
