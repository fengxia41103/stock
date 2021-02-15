import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";
import DictTable from "../shared/dict_table.jsx";

class Income extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { incomes } = this.props;
    const analysis = {
      basic_eps: "Basic EPS",
      gross_margin: "Gross Margin (%)",
      net_income_margin: "Net Income Margin (%)",
      operating_margin: "Operating Margin (%)",
      opex_margin: "OPEX Margin (%)",
      ebit_margin: "EBIT Margin (%)",
      expense_margin: "Expense Margin (%)",
    };

    return <DictTable data={incomes} interests={analysis} />;
  }
}

export default Income;
