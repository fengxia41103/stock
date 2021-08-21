import React, { useState } from "react";
import { useParams } from "react-router-dom";
import GlobalContext from "src/context";
import FinancialCard from "src/components/stock/FinancialCard";
import Fetch from "src/components/common/Fetch";

function ValuationRatiosView() {
  const { id } = useParams();
  const [resource] = useState(`/ratios?stock=${id}`);

  const reported = {
    pe: "P/E",
    pb: "P/B",
    peg: "PEG",
    ps: "P/S",
    forward_pe: "Forward P/E",
  };

  const render_data = (resp) => {
    const data = resp.objects;

    return (
      <FinancialCard title="Valuation Ratios" data={data} reported={reported} />
    );
  };
  return <Fetch {...{ resource, render_data }} />;
}

export default ValuationRatiosView;
