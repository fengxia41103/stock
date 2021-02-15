import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";

class ValuationRatio extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { ratios } = this.props;
    if (isEmpty(ratios)) {
      return null;
    }

    const headers = (
      <tr>
        <th>Date</th>
        <th>Forward P/E</th>
        <th>P/E</th>
        <th>P/B</th>
        <th>P/E-2-G</th>
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

export default ValuationRatio;
