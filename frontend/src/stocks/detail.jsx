import React, { Component } from "react";
import { map } from "lodash";
import StockFinancial from "./valuation.jsx";
import RangeFilter from "./filter.jsx";

class StockDetail extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <StockFinancial {...this.props} />
        <RangeFilter {...this.props} />
      </div>
    );
  }
}
export default StockDetail;
