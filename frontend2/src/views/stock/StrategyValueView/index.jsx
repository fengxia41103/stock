import React from "react";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "src/components/graph-highchart.jsx";
import Box from "@material-ui/core/Box";
import { map } from "lodash";

function StrategyValueView(props) {
  const containerId = randomId();
  const { data, name } = props;
  const categories = map(data, d => d.hist__on);
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

export default StrategyValueView;
