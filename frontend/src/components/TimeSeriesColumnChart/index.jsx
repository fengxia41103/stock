import React from "react";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "src/components/Highchart";
import { map, isUndefined } from "lodash";

export default function TimeSeriesColumnChart(props) {
  const containerId = randomId();
  const { data, name } = props;
  const categories = map(data, d => {
    if (isUndefined(d.on)) {
      return d.hist__on;
    } else {
      return d.on;
    }
  });
  const chart_data = [
    {
      name: name,
      data: map(data, d => d.val),
    },
  ];

  return (
    <HighchartGraphBox
      containerId={containerId}
      type="column"
      categories={categories}
      yLabel=""
      title=""
      legendEnabled={true}
      data={chart_data}
    />
  );
}
