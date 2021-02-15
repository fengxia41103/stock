import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";
import DictTable from "../shared/dict_table.jsx";

class Balance extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { balances } = this.props;
    const reported = {
      current_ratio: "Current Ratio",
      quick_ratio: "Quick Ratio",
      debt_to_equity_ratio: "Debt/Equity Ratio",
    };

    const analysis = {
      debt_growth_rate: "Debt Growth from Prev (%)",
      ap_growth_rate: "AP Growth from Prev (%)",
      ac_growth_rate: "AC Growth from Prev (%)",
      all_cash_growth_rate: "Cash & Equivalents from Prev (%)",
      working_capital_growth_rate: "Working Capital from Prev (%)",
      net_ppe_growth_rate: "Net PP&E from Prev (%)",
    };

    return (
      <div>
        Balance Sheet
        <DictTable data={balances} interests={reported} />
        Balance Sheet Period-to-Period
        <DictTable data={balances} interests={analysis} />
      </div>
    );
  }
}

export default Balance;
