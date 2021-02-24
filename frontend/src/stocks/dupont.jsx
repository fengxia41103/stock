import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";
import DictTable from "../shared/dict_table.jsx";
import { randomId } from "../helper.jsx";
import HighchartGraphBox from "../shared/graph-highchart.jsx";

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
        <DupontChart interests={analysis} {...this.props} />
        <DictTable data={dupont} interests={analysis} />
        <DictTable data={dupont} interests={reported} />
      </div>
    );
  }
}

class DupontChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const containerId = randomId();
    const { dupont, interests } = this.props;
    const dates = map(dupont, i => i.on);
    const chart_data = Object.entries(interests).map(([key, description]) => {
      const vals = map(dupont, i => i[key]);
      return { name: description, data: vals };
    });

    return (
      <HighchartGraphBox
        containerId={containerId}
        type="bar"
        categories={dates}
        yLabel=""
        title=""
        legendEnabled={true}
        data={chart_data}
      />
    );
  }
}

export default DuPont;
