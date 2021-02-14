import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";

class Income extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { incomes } = this.props;
    if (isEmpty(incomes)) {
      return null;
    }

    const dates = map(incomes, i => <th key={i.on}>{i.on}</th>);
    const interests = {
      gross_margin: "Gross Margin (%)",
      net_income_margin: "Net Income Margin (%)",
      opex_margin: "OPEX Margin (%)",
      ebit_margin: "EBIT Margin (%)",
      expense_margin: "Expense Margin (%)",
    };
    const rows = Object.entries(interests).map(([key, description]) => {
      const row = map(incomes, c => (
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

export default Income;
