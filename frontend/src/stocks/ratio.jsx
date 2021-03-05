import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";
import { randomId } from "../helper.jsx";
import HighchartGraphBox from "../shared/graph-highchart.jsx";

class ValuationRatioChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { ratios } = this.props;

    // if ETF, skip
    if (isEmpty(ratios)) {
      return null;
    }

    const containerId = randomId();
    const categories = map(ratios, r => r.on);
    const forward_pe = map(ratios, r => r.forward_pe);
    const pe = map(ratios, r => r.pe);
    const pb = map(ratios, r => r.pb);
    const peg = map(ratios, r => r.peg);
    const ps = map(ratios, r => r.ps);
    const chart_data = [
      {
        name: "P/E",
        data: pe,
      },
      {
        name: "P/B",
        data: pb,
        visible: false,
      },
      {
        name: "Forward P/E",
        data: forward_pe,
        visible: false,
      },
      {
        name: "PEG",
        data: peg,
        visible: false,
      },
      {
        name: "P/S",
        data: ps,
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
        normalize={true}
      />
    );
  }
}

class ValuationRatioTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { ratios } = this.props;

    const headers = (
      <tr>
        <th>Date</th>
        <th>Forward P/E</th>
        <th>P/E</th>
        <th>P/B</th>
        <th>PEG</th>
        <th>P/S</th>
      </tr>
    );

    const rows = map(ratios, r => (
      <tr key={r.on}>
        <td>{r.on}</td>
        <td>{r.forward_pe.toFixed(2)}</td>
        <td>{r.pe.toFixed(2)}</td>
        <td>{r.pb.toFixed(2)}</td>
        <td>{r.peg.toFixed(2)}</td>
        <td>{r.ps.toFixed(2)}</td>
      </tr>
    ));

    return (
      <table className="table striped">
        <thead>{headers}</thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

class ValuationRatio extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { ratios } = this.props;
    if (isEmpty(ratios)) {
      return null;
    }
    return (
      <div>
        Valuation Ratios
        <ValuationRatioChart {...this.props} />
        <ValuationRatioTable {...this.props} />
      </div>
    );
  }
}

export default ValuationRatio;
