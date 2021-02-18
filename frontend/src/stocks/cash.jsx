import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";
import DictTable from "../shared/dict_table.jsx";

class Cash extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { cashes } = this.props;

    // if ETF, skip
    if (isEmpty(cashes)) {
      return null;
    }

    const reported = {
      beginning_cash: "Beggining Cash",
      ending_cash: "Ending Cash",
      free_cash_flow: "Free Cash Flow",
      net_income: "Net Income",
      operating_cash_flow: "Operating Cash Flow",
      capex: "CAPEX",
    };

    const analysis = {
      cash_change_pcnt: "Cash Growth from Beginning (%)",
      operating_cash_flow_growth: "Operating Cash from Prev (%)",
    };

    return (
      <div>
        Cash Flow Statement
        <DictTable data={cashes} interests={reported} />
        <DictTable data={cashes} interests={analysis} />
      </div>
    );
  }
}

export default Cash;
