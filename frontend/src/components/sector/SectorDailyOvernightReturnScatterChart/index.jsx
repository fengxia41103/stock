import React, { useState, useContext } from "react";
import GlobalContext from "src/context";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import { map } from "lodash";
import HighchartGraphBox from "src/components/Highchart";
import { randomId } from "src/utils/helper.jsx";

export default function SectorDailyOvernightReturnScatterChart(props) {
  const { data: stats } = props;

  // scatter graphy doesn't need categories
  const categories = [];

  const chart_data = map(stats, s => {
    const daily_returns = s.stats.indexes["daily return"];
    const overnight_returns = s.stats.indexes["overnight return"];
    const my_data = map(daily_returns, (s, index) => {
      return [s.val, overnight_returns[index].val];
    });

    return {
      name: s.stats.symbol,
      data: my_data,
    };
  });

  const containerId = randomId();
  return (
    <HighchartGraphBox
      containerId={containerId}
      type="scatter"
      categories={categories}
      xLabel="Daily Return (%)"
      yLabel="Overnight Return (%)"
      title=""
      legendEnabled={true}
      data={chart_data}
    />
  );
}
