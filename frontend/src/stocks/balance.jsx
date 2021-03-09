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

    const analysis = {
      current_ratio: "Current Ratio",
      quick_ratio: "Quick Ratio",
      debt_to_equity_ratio: "Debt/Equity Ratio",
      equity_multiplier: "Equity Multipler",
      working_capital_to_current_liabilities:
        "Working Capital/Current Liabilities Ratio",
      liability_to_asset: "Total Liabilities/Total Assets (%)",
      current_asset_to_total_asset: "Current Assets/Total Assets (%)",
      retained_earnings_to_equity: "Retained Earnings/Equity (%)",
    };

    const p2p_changes = {
      capital_structure: "Debt % of Asset",
      debt_growth_rate: "Debt(%)",
      ap_growth_rate: "Account Payable (%)",
      ar_growth_rate: "Account Receivable (%)",
      all_cash_growth_rate: "Cashes (%)",
      working_capital_growth_rate: "Working Capital (%)",
      net_ppe_growth_rate: "Net PP&E (%)",
    };

    return (
      <div>
        Balance Sheet
        <DictTable data={balances} interests={analysis} chart={true} />
        Period-to-Period Changes
        <DictTable data={balances} interests={p2p_changes} />
      </div>
    );
  }
}

export default Balance;
