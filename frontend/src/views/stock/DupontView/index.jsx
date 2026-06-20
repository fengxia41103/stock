import React from "react";
import { useParams } from "react-router-dom";

import { Typography } from "@mui/material";

import { useResource } from "@/api";
import FinancialCard from "@Components/stock/FinancialCard";
import ScaleLoader from "react-spinners/ScaleLoader";

const DupontView = () => {
  const { id } = useParams();
  const { data, isLoading } = useResource(
    ["dupont", id],
    `/stocks/${id}/dupont/`,
  );

  if (isLoading || !data) return <ScaleLoader loading />;

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

  return (
    <>
      <Typography variant="h2">Dupont ROE Model</Typography>
      <FinancialCard data={data} {...{ reported, analysis }} />
    </>
  );
};

export default DupontView;
