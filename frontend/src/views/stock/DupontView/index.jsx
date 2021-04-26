import React, { useContext } from "react";
import { Box, Typography } from "@material-ui/core";
import FinancialCard from "src/components/stock/FinancialCard";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";

export default function DupontView() {
  const stock = useContext(StockDetailContext);

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
    <Box>
      <Typography variant="h1">{stock.symbol} Dupont ROE Model</Typography>
      <FinancialCard data={dupont_model} {...{ reported, analysis }} />
    </Box>
  );
}
