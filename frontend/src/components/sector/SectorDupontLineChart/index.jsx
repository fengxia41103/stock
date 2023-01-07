import { MultilineChart } from "@fengxia41103/storybook";
import { map } from "lodash";
import PropTypes from "prop-types";
import React, { useContext } from "react";

import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";

export default function SectorDupontLineChart(props) {
  const { property } = props;
  const sector = useContext(SectorDetailContext);
  const chart_data = map(sector.stocks_detail, (d) => {
    return {
      symbol: d.symbol,
      data: d.dupont_model,
    };
  });

  return (
    <MultilineChart
      {...{
        data: chart_data,
        category_by: "on",
        label_by: "symbol",
        data_by: property,
        normalized: true,
      }}
    />
  );
}

SectorDupontLineChart.propTypes = {
  property: PropTypes.string.isRequired,
};
