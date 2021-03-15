import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import GlobalContext from "src/context";
import FinancialsView from "src/views/stock/FinancialsView";
import Fetch from "src/components/fetch.jsx";

function NavView(props) {
  const { id } = useParams();
  const { api } = useContext(GlobalContext);
  const [resource] = useState(`/stocks/${id}`);

  const reported = {
    nav: "NAV",
  };

  const render_data = stock => {
    const { nav_model } = stock;

    return (
      <FinancialsView
        title="Net Asset Value Analysis"
        data={nav_model}
        reported={reported}
      />
    );
  };
  return <Fetch api={api} resource={resource} render_data={render_data} />;
}
export default NavView;
