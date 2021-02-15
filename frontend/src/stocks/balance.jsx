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
    const interests = {
      current_ratio: "Current Ratio",
      quick_ratio: "Quick Ratio",
      debt_to_equity_ratio: "Debt/Equity Ratio",
    };

    return <DictTable data={balances} interests={interests} />;
  }
}

export default Balance;
