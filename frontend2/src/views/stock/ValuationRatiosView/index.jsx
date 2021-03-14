import React, { useState, useContext } from "react";
import { Outlet, useParams } from "react-router-dom";
import GlobalContext from "src/context";
import FinancialsView from "src/views/stock/FinancialsView";
import Fetch from "src/components/fetch.jsx";

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
      <FinancialsView
        title="Valuation Ratios"
        data={data}
        reported={reported}
      />
    );
  };
  return <Fetch api={api} resource={resource} render_data={render_data} />;
}

export default ValuationRatiosView;
