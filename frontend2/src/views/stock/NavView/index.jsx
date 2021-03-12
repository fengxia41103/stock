import React, { useContext } from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import DictTable from "src/components/dict_table.jsx";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";

function NavView(props) {
  const { nav_model: nav } = useContext(StockDetailContext);

  if (isEmpty(nav)) {
    return null;
  }

  const analysis = {
    nav: "NAV",
  };

  return (
    <div>
      Net Asset Model
      <DictTable data={nav} interests={analysis} chart={true} />
    </div>
  );
}

export default NavView;
