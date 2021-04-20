import React from "react";
import { map } from "lodash";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "src/components/Highchart";

export default function Row1MonthHistoricalChart(props) {
  // One month historical normalized chart.  Used in conjunction w/
  // ranking to see how history correlates with ranks.
  const { ranks } = props;

  const containerId = randomId();
  const categories = map(ranks[0].one_month_historicals, r => r.on);
  const chart_data = map(ranks, r => {
    return {
      name: r.symbol,
      data: map(r.one_month_historicals, n => n.close_price),
    };
  });

  return (
    <HighchartGraphBox
      containerId={containerId}
      type="line"
      categories={categories}
      yLabel=""
      title=""
      legendEnabled={true}
      data={chart_data}
      normalize={true}
    />
  );
}
