import React, { Component } from "react";
import classNames from "classnames";
import Fetch from "../shared/fetch.jsx";
import { map } from "lodash";
import { StrategyValueChart, PriceChart, VolChart } from "./charts.jsx";
import Stats from "./stats.jsx";
import Income from "./income.jsx";
import Cash from "./cash.jsx";
import StockDaily from "./daily.jsx";
import ValuationRatio from "./ratio.jsx";
import Balance from "./balance.jsx";
import RangeFilter from "./filter.jsx";

class StockFinancial extends Fetch {
  constructor(props) {
    super(props);
    this.state.resource = this.props.resource;
  }

  render_data(stock) {
    return (
      <div>
        <h2>{stock.symbol}</h2>
        Balance Sheet
        <Balance balances={stock.balances} />
        Valuation Ratios
        <ValuationRatio ratios={stock.ratios} />
        Income Statement
        <Income incomes={stock.incomes} />
        Cash Flow Statement
        <Cash cashes={stock.cashes} />
      </div>
    );
  }
}

class StockHistorical extends Fetch {
  constructor(props) {
    super(props);

    // resource is composed by its caller
    const { resource, start, end } = this.props;
    const range_filter = "?start=" + start + "&end=" + end;
    this.state.resource = resource + range_filter;
  }

  render_data(stock) {
    const { start, end } = this.props;
    const period = (
      <div>
        <span className="myhighlight">{start}</span>
        &mdash;
        <span className="myhighlight">{end}</span>
      </div>
    );

    return (
      <div>
        <h3>My Indicators</h3>
        {period}
        <Stats stats={stock.stats} />

        <h3>Daily & Overnight Returns</h3>
        <div className="col s6">
          {period}
          <StrategyValueChart
            name="Overnight Return %"
            data={stock.indexes["overnight return"]}
          />
        </div>

        <div className="col s6">
          {period}
          <StrategyValueChart
            name="Daily Return %"
            data={stock.indexes["daily return"]}
          />
        </div>

        <h2>Price History</h2>
        {period}
        <PriceChart data={stock.olds} />
        <VolChart data={stock.olds} />
        <StockDaily historicals={stock.olds} />
      </div>
    );
  }
}

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
export { StockDetail, StockHistorical };
