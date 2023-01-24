import React, { useContext } from "react";

import { Typography } from "@mui/material";

import FinancialCard from "@Components/stock/FinancialCard";

import StockDetailContext from "@Views/stock/StockDetailView/context";

const DupontView = () => {
  const stock = useContext(StockDetailContext);
  const { symbol } = stock;

  const reported = {
    revenue: "Revenue",
    assets: "Total Assets",
    debts: "Debts",
    equity: "Stockholder Equity",
  };
  const analysis = {
    roe: "ROE %",
    net_profit_margin: "Net Profit Margin %",
    asset_turnover: "Asset Turnover %",
    equity_multiplier: "Equity Multiplier",
  };

  const { dupont_model } = stock;

  return (
    <>
      <Typography variant="h2">Dupont ROE Model</Typography>
      <FinancialCard data={dupont_model} {...{ reported, analysis }} />
    </>
  );
};

export default DupontView;
