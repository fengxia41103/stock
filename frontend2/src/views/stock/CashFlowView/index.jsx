import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography } from "@material-ui/core";
import GlobalContext from "src/context";
import FinancialsView from "src/views/stock/FinancialsView";
import Fetch from "src/components/fetch.jsx";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";

function CashFlowView(props) {
  const { id } = useParams();
  const { api } = useContext(GlobalContext);
  const stock = useContext(StockDetailContext);
  const [resource] = useState(`/cashes?stock=${id}`);

  const reported = {
    beginning_cash: "Beggining Cash",
    ending_cash: "Ending Cash",
    free_cash_flow: "Free Cash Flow",
    net_income: "Net Income",
    operating_cash_flow: "Operating Cash Flow",
    investing_cash_flow: "Investing Cash Flow",
    capex: "CAPEX",
    dividend_paid: "Dividend Paid",
  };

  const in_period_change = {
    cash_change_pcnt: "Cash from Beginning",
  };
  const p2p_growth = {
    operating_cash_flow_growth: "Operating Cash from Prev",
  };
  const pcnt = {
    fcf_over_ocf: "FCF/Operating CF",
    fcf_over_net_income: "FCF/Net Income",
    ocf_over_net_income: "Operating CF/Net Income",
    dividend_payout_ratio: "Dividend Paid/Net Income",
  };

  const render_data = resp => {
    const data = resp.objects;

    return (
      <Box>
        <Typography variant="h1">{stock.symbol} Cash Flow Statement</Typography>
        <FinancialsView
          {...{ data, reported, pcnt, p2p_growth, in_period_change }}
        />
      </Box>
    );
  };
  return <Fetch {...{ api, resource, render_data }} />;
}

export default CashFlowView;
