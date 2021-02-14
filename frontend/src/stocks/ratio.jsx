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

    const dates = map(ratios, i => <th key={i.on}>{i.on}</th>);
    const interests = {
      forward_pe: "Forward P/E",
      pe: "P/E",
      pb: "P/B",
      peg: "PEG",
      ps: "P/S",
    };
    const rows = Object.entries(interests).map(([key, description]) => {
      const row = map(ratios, c => (
        <td key={c.on} className={c[key] < 0 ? "negative" : null}>
          {c[key].toFixed(2)}
        </td>
      ));
      return (
        <tr key={key}>
          <td>{description}</td>
          {row}
        </tr>
      );
    });

    return (
      <table className="table striped">
        <thead>
          <tr>
            <th></th>
            {dates}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

export default ValuationRatio;
