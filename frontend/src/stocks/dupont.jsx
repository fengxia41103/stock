import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";
import DictTable from "../shared/dict_table.jsx";

class DuPont extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { dupont } = this.props;

    if (isEmpty(dupont)) {
      return null;
    }

    const reported = {
      revenue: "Revenue",
      assets: "Total Assets",
      debts: "Debts",
      equity: "Stockholder Equity",
    };
    const analysis = {
      roe: "ROE %",
      net_profit_margin: "Net Profit Margin %",
      asset_turnover: "Asset Turnover %",
      equity_multiplier: "Equity Multiplier",
    };

    return (
      <div>
        DuPont Model
        <DictTable data={dupont} interests={analysis} chart={true} />
        <DictTable data={dupont} interests={reported} chart={true} />
      </div>
    );
  }
}

export default DuPont;
