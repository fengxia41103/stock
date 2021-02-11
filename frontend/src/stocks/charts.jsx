import React, { Component } from "react";
import { randomId } from "../helper.jsx";
import HighchartGraphBox from "../shared/graph-highchart.jsx";
import { map } from "lodash";

class StrategyValueChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const containerId = randomId();
    const { data, name } = this.props;
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
}

export { StrategyValueChart };
