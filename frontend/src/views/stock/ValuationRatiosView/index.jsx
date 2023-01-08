import React, { useState } from "react";
import { useParams } from "react-router-dom";

import { ShowResource } from "@fengxia41103/storybook";

import FinancialCard from "src/components/stock/FinancialCard";

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

  return <ShowResource {...{ resource, on_success: render_data }} />;
}

export default ValuationRatiosView;
