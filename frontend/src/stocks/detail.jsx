import React, { Component } from "react";
import classNames from "classnames";
import HighchartGraphBox from "../shared/graph-highchart.jsx";
import Fetch from "../shared/fetch.jsx";
import { map } from "lodash";

class StockDetail extends Fetch {
  constructor(props) {
    super(props);
    const { id } = this.props;
    this.state.resource = "/api/v1/stocks/" + id;
  }

  render_data(stock) {
    const { api } = this.props;
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
