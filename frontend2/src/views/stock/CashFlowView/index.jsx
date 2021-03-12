import React, { useContext } from "react";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";
import FinancialsView from "src/views/stock/FinancialsView";

function CashFlowView(props) {
  const { cashes: data } = useContext(StockDetailContext);

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

  return (
    <FinancialsView
      title="Cash Flow Statement"
      data={data}
      reported={reported}
      in_period_change={in_period_change}
      p2p_growth={p2p_growth}
      pcnt={pcnt}
    />
  );
}

export default CashFlowView;
