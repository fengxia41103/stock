import React, { Component } from "react";
import Financials from "./financials.jsx";

class Income extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { incomes: data } = this.props;

    const reported = {
      basic_eps: "Basic EPS",
    };

    const pcnt = {
      net_income_margin: "Net Profit Margin",
      cogs_margin: "COGS Margin",
      gross_margin: "Gross Margin",
      operating_income_margin: "Operating Income Margin",
      operating_expense_margin: "Operating Expense Margin",
      selling_ga_margin: "Selling G&A Margin",
      ebit_margin: "EBIT Margin",
      total_expense_margin: "Total Expense Margin",
      interest_income_margin: "Interest Income",
      other_income_expense_margin: "Other Income Expense Margin",
      pretax_income_margin: "Pretax Income Margin",
    };

    return (
      <Financials
        title="Income Statement"
        data={data}
        reported={reported}
        pcnt={pcnt}
      />
    );
  }
}

export default Income;
