import React from "react";
import { map } from "lodash";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "src/components/graph-highchart.jsx";

export default function RowRankChart(props) {
  const { category, ranks } = props;

  // charting the vals. I found using chart is easier to gauge
  // relative strength. However, it takes a lot of screen
  // space. Thus I'm making it toggle.
  const containerId = randomId();
  const categories = map(ranks, r => r.symbol);
  const chart_data = [
    {
      name: category,
      data: map(ranks, r => r.val),
    },
  ];

  return (
    <HighchartGraphBox
      containerId={containerId}
      type="bar"
      categories={categories}
      yLabel=""
      title=""
      legendEnabled={true}
      data={chart_data}
    />
  );
}
