import ShowResource from "@Components/common/ShowResource";
import FinancialCard from "@Components/stock/FinancialCard";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

const ValuationRatiosView = () => {
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
};

export default ValuationRatiosView;
