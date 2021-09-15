import { map } from "lodash";
import React from "react";


import HighchartGraphBox from "src/components/common/Highchart";
import { randomId } from "src/utils/helper.jsx";

export default function PriceChart(props) {
  const containerId = randomId();
  const { data } = props;
  const categories = map(data, d => d.on);
  const chart_data = [
    {
      name: "Open Price",
      data: map(data, d => d.open_price),
      lineWidth: 5,
    },
    {
      name: "Close Price",
      data: map(data, d => d.close_price),
      lineWidth: 5,
    },
    {
      name: "High Price",
      data: map(data, d => d.high_price),
      visible: false,
    },
    {
      name: "Low Price",
      data: map(data, d => d.low_price),
      visible: false,
    },
  ];

  return (
    <HighchartGraphBox
      containerId={containerId}
      type="line"
      categories={categories}
      yLabel=""
      title=""
      legendEnabled={true}
      data={chart_data}
    />
  );
}
