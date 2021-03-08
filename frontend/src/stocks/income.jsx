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

    // if ETF, skip
    if (isEmpty(incomes)) {
      return null;
    }

    const reported = {
      basic_eps: "Basic EPS",
    };
    const analysis = {
      net_income_margin: "Net Profit Margin (%)",
      cogs_margin: "COGS Margin (%)",
      gross_margin: "Gross Margin (%)",
      operating_income_margin: "Operating Income Margin (%)",
      operating_expense_margin: "Operating Expense Margin (%)",
      selling_ga_margin: "Selling G&A Margin (%)",
      ebit_margin: "EBIT Margin (%)",
      total_expense_margin: "Total Expense Margin (%)",
      interest_income_margin: "Interest Income (%)",
      other_income_expense_margin: "Other Income Expense Margin (%)",
      pretax_income_margin: "Pretax Income Margin (%)",
    };

    return (
      <div>
        Income Statement
        <DictTable data={incomes} interests={reported} />
        <DictTable data={incomes} interests={analysis} chart={true} />
      </div>
    );
  }
}

export default Income;
