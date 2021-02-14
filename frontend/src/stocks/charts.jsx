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

class PriceChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const containerId = randomId();
    const { data } = this.props;
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
}

class RangeChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const containerId = randomId();
    const { data } = this.props;
    const categories = map(data, d => d.on);
    const range_data = map(data, d => [d.on, d.open_price, d.close_price]);

    const chart_data = [
      {
        name: "Price",
        data: range_data,
      },
    ];

    return <StockGraphBox containerId={containerId} title="this" />;
  }
}

class VolChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const containerId = randomId();
    const { data } = this.props;
    const categories = map(data, d => d.on);
    const chart_data = [
      {
        name: "Vols",
        data: map(data, d => d.vol),
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

export { StrategyValueChart, PriceChart, RangeChart, VolChart };
