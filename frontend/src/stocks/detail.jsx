import React, { Component } from "react";
import classNames from "classnames";
import Fetch from "../shared/fetch.jsx";
import { map } from "lodash";
import { StrategyValueChart, PriceChart, VolChart } from "./charts.jsx";
import Stats from "./stats.jsx";
import Income from "./income.jsx";
import Cash from "./cash.jsx";
import StockDaily from "./daily.jsx";

class StockDetail extends Fetch {
  constructor(props) {
    super(props);

    // resource is composed by its caller
    const { resource, start, end } = this.props;
    const range_filter = "?start=" + start + "&end=" + end;
    this.state.resource = resource + range_filter;
  }

  render_data(stock) {
    const { start, end } = this.props;

    return (
      <div>
        <h1>{stock.symbol}</h1>
        <Income incomes={stock.incomes} />
        <Cash cashes={stock.cashes} />
        <span className="myhighlight">{start}</span>
        &mdash;
        <span className="myhighlight">{end}</span>
        <Stats stats={stock.stats} />
        <PriceChart data={stock.olds} />
        <StrategyValueChart
          name="Daily Return %"
          data={stock.indexes["daily return"]}
        />
        <VolChart data={stock.olds} />
        <StrategyValueChart
          name="Overnight Return %"
          data={stock.indexes["overnight return"]}
        />
        // daily trading data
        <StockDaily historicals={stock.olds} />
      </div>
    );
  }
}

export default StockDetail;
