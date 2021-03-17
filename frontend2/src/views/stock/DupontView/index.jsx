import React, { useState, useContext } from "react";
import { Outlet, useParams } from "react-router-dom";
import GlobalContext from "src/context";
import FinancialsView from "src/views/stock/FinancialsView";
import Fetch from "src/components/fetch.jsx";

function DupontView() {
  const { id } = useParams();
  const { api } = useContext(GlobalContext);
  const [resource] = useState(`/stocks/${id}`);

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

  const render_data = stock => {
    const { dupont_model } = stock;

    return (
      <FinancialsView
        title="Dupont ROE Analysis"
        data={dupont_model}
        {...{ reported, analysis }}
      />
    );
  };
  return <Fetch api={api} resource={resource} render_data={render_data} />;
}

export default DupontView;
