import React, { Component } from "react";
import classNames from "classnames";
import { map } from "lodash";

class Cash extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { cashes } = this.props;

    const dates = map(cashes, i => <th key={i.on}>{i.on}</th>);

    const interests = {
      free_cash_flow: "Free Cash Flow",
    };

    const rows = Object.entries(interests).map(([key, description]) => {
      const row = map(cashes, c => <td key={c.on}>{c[key].toFixed(2)}</td>);
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

export default Cash;
