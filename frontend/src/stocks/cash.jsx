import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";

class Cash extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { cashes } = this.props;

    if (isEmpty(cashes)) {
      return null;
    }

    const dates = map(cashes, i => <th key={i.on}>{i.on}</th>);
    const interests = {
      beginning_cash: "Beggining Cash",
      ending_cash: "Ending Cash",
      cash_change_pcnt: "Cash Change (%)",
      free_cash_flow: "Free Cash Flow",
      net_income: "Net Income",
      operating_cash_flow: "Operating Cash Flow",
      capex: "CAPEX",
    };

    const rows = Object.entries(interests).map(([key, description]) => {
      const row = map(cashes, c => (
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

export default Cash;
