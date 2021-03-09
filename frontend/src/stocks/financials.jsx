import React, { Component } from "react";
import { isEmpty, isUndefined } from "lodash";
import DictTable from "../shared/dict_table.jsx";

class Financials extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      title,
      data,
      reported,
      ratio,
      in_period_change,
      p2p_growth,
      pcnt,
    } = this.props;

    // if ETF, skip
    if (isEmpty(data)) {
      return null;
    }

    return (
      <div>
        <h4>{title}</h4>
        {isEmpty(reported) ? null : (
          <DictTable data={data} interests={reported} chart={true} />
        )}
        {isUndefined(ratio) ? null : (
          <div>
            Ratios
            <DictTable data={data} interests={ratio} chart={true} />
          </div>
        )}
        {isUndefined(in_period_change) ? null : (
          <div>
            In-Period Change (%)
            <DictTable data={data} interests={in_period_change} />
          </div>
        )}
        {isUndefined(pcnt) ? null : (
          <div>
            A-over-B as %
            <DictTable data={data} interests={pcnt} chart={true} />
          </div>
        )}
        {isUndefined(p2p_growth) ? null : (
          <div>
            Period-to-Period Growth Rates (%)
            <DictTable data={data} interests={p2p_growth} chart={true} />
          </div>
        )}
      </div>
    );
  }
}

export default Financials;
