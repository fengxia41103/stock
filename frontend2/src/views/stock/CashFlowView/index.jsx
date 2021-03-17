import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import GlobalContext from "src/context";
import FinancialsView from "src/views/stock/FinancialsView";
import Fetch from "src/components/fetch.jsx";

function CashFlowView(props) {
  const { id } = useParams();
  const { api } = useContext(GlobalContext);
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
      <FinancialsView
        title="Cash Flow Statement Analysis"
        {...{ data, reported, pcnt, p2p_growth }}
      />
    );
  };
  return <Fetch {...{ api, resource, render_data }} />;
}

export default CashFlowView;
