import React, { Component } from "react";
import classNames from "classnames";
import Fetch from "../shared/fetch.jsx";
import { map } from "lodash";
import { StrategyValueChart, PriceChart } from "./charts.jsx";
import Stats from "./stats.jsx";

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

    const historicals = map(stock.olds, h => {
      return (
        <tr key={h.id}>
          <td>{h.on}</td>
          <td>{h.high_price}</td>
          <td>{h.low_price}</td>
          <td>{h.open_price}</td>
          <td>{h.adj_close}</td>
          <td>{h.vol}</td>
        </tr>
      );
    });

    return (
      <div>
        <h1>{stock.symbol}</h1>
        <span className="myhighlight">{start}</span>
        &mdash;
        <span className="myhighlight">{end}</span>
        <Stats stats={stock.stats} />
        <PriceChart data={stock.olds} />
        <StrategyValueChart
          name="Daily Return %"
          data={stock.indexes["daily return"]}
        />
        <StrategyValueChart
          name="Overnight Return %"
          data={stock.indexes["overnight return"]}
        />
        // daily trading data
        <table className="table highlight striped">
          <thead>
            <th>Date</th>
            <th>High</th>
            <th>Low</th>
            <th>Open</th>
            <th>Adj Close</th>
            <th>Vol (000)</th>
          </thead>
          <tbody>{historicals}</tbody>
        </table>
      </div>
    );
  }
}

export default StockDetail;
