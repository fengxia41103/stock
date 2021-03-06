import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";
import DictTable from "../shared/dict_table.jsx";
import { randomId } from "../helper.jsx";
import HighchartGraphBox from "../shared/graph-highchart.jsx";

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
      investing_cash_flow: "Investing Cash Flow",
      capex: "CAPEX",
      dividend_paid: "Dividend Paid",
    };

    const analysis = {
      cash_change_pcnt: "Cash Growth from Beginning (%)",
      operating_cash_flow_growth: "Operating Cash from Prev (%)",
      fcf_over_ocf: "FCF/Operating CF (%)",
      fcf_over_net_income: "FCF/Net Income (%)",
      ocf_over_net_income: "Operating CF/Net Income",
      dividend_payout_ratio: "Dividend Paid/Net Income",
    };

    return (
      <div>
        Cash Flow Statement
        <CashFlowChart interests={reported} {...this.props} />
        <DictTable data={cashes} interests={reported} />
        <DictTable data={cashes} interests={analysis} />
      </div>
    );
  }
}

class CashFlowChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const containerId = randomId();
    const { cashes, interests } = this.props;
    const dates = map(cashes, i => i.on);
    const chart_data = Object.entries(interests).map(([key, description]) => {
      const vals = map(cashes, i => i[key]);
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
        normalize={true}
      />
    );
  }
}

export default Cash;
