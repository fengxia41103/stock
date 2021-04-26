import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import GlobalContext from "src/context";
import FinancialCard from "src/components/stock/FinancialCard";
import Fetch from "src/components/Fetch";

function ValuationRatiosView() {
  const { id } = useParams();
  const { api } = useContext(GlobalContext);
  const [resource] = useState(`/ratios?stock=${id}`);

  const reported = {
    pe: "P/E",
    pb: "P/B",
    peg: "PEG",
    ps: "P/S",
    forward_pe: "Forward P/E",
  };

  const render_data = resp => {
    const data = resp.objects;

    return (
      <FinancialCard title="Valuation Ratios" data={data} reported={reported} />
    );
  };
  return <Fetch api={api} resource={resource} render_data={render_data} />;
}

export default ValuationRatiosView;
