import React, { Component } from "react";
import { map } from "lodash";

class StockDaily extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { historicals } = this.props;

    const rows = map(historicals, h => {
      return (
        <tr key={h.on}>
          <td>{h.on}</td>
          <td>{h.high_price.toFixed(2)}</td>
          <td>{h.low_price.toFixed(2)}</td>
          <td>{h.open_price.toFixed(2)}</td>
          <td>{h.adj_close.toFixed(2)}</td>
          <td>{h.vol.toFixed(0)}</td>
        </tr>
      );
    });

    return (
      // daily trading data
      <table className="table highlight striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>High</th>
            <th>Low</th>
            <th>Open</th>
            <th>Adj Close</th>
            <th>Vol (000)</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

export default StockDaily;
