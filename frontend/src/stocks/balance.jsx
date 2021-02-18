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

    // if ETF, skip
    if (isEmpty(balances)) {
      return null;
    }

    const reported = {
      current_ratio: "Current Ratio",
      quick_ratio: "Quick Ratio",
      debt_to_equity_ratio: "Debt/Equity Ratio",
      capital_structure: "Debt % of Capital",
    };

    const analysis = {
      debt_growth_rate: "Debt(%)",
      ap_growth_rate: "AP(%)",
      ac_growth_rate: "AC(%)",
      all_cash_growth_rate: "Cashes (%)",
      working_capital_growth_rate: "Working Capital (%)",
      net_ppe_growth_rate: "Net PP&E (%)",
    };

    return (
      <div>
        Balance Sheet
        <DictTable data={balances} interests={reported} />
        Period-to-Period Changes
        <DictTable data={balances} interests={analysis} />
      </div>
    );
  }
}

export default Balance;
