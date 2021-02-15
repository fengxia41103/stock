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

    const interests = {
      beginning_cash: "Beggining Cash",
      ending_cash: "Ending Cash",
      cash_change_pcnt: "Cash Change (%)",
      free_cash_flow: "Free Cash Flow",
      net_income: "Net Income",
      operating_cash_flow: "Operating Cash Flow",
      capex: "CAPEX",
    };

    return <DictTable data={cashes} interests={interests} />;
  }
}

export default Cash;
