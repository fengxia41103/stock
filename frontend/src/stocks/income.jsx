import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";
import DictTable from "../shared/dict_table.jsx";
import { randomId } from "../helper.jsx";
import HighchartGraphBox from "../shared/graph-highchart.jsx";

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
      opex_margin: "OPEX Margin (%)",
      ebit_margin: "EBIT Margin (%)",
      total_expense_margin: "Total Expense Margin (%)",
    };

    return (
      <div>
        Income Statement
        <IncomeChangeChart interests={analysis} {...this.props} />
        <DictTable data={incomes} interests={reported} />
        <DictTable data={incomes} interests={analysis} />
      </div>
    );
  }
}

class IncomeChangeChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const containerId = randomId();
    const { incomes, interests } = this.props;
    const dates = map(incomes, i => i.on);
    const chart_data = Object.entries(interests).map(([key, description]) => {
      const vals = map(incomes, i => i[key]);
      return { name: description, data: vals };
    });

    return (
      <HighchartGraphBox
        containerId={containerId}
        type="line"
        categories={dates}
        yLabel=""
        title=""
        legendEnabled={true}
        data={chart_data}
      />
    );
  }
}

export default Income;
