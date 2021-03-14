import React, { useState, useContext } from "react";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";
import FinancialsView from "src/views/stock/FinancialsView";

function ValuationRatiosView() {
  const { ratios: data } = useContext(StockDetailContext);
  const reported = {
    pe: "P/E",
    pb: "P/B",
    peg: "PEG",
    ps: "P/S",
    forward_pe: "Forward P/E",
  };
  return (
    <FinancialsView title="Valuation Ratios" data={data} reported={reported} />
  );
}

export default ValuationRatiosView;
