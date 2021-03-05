import React, { Component } from "react";
import classNames from "classnames";
import { map, filter, sortBy } from "lodash";
import { Jumbotron } from "react-bootstrap";
import { DebounceInput } from "react-debounce-input";

import StockHistorical from "./historical.jsx";

class RangeFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      start: "2021-02-01",
      end: new Date().toLocaleDateString("en-CA"),
    };

    // binding
    this.start_change = this.start_change.bind(this);
    this.end_change = this.end_change.bind(this);
  }

  start_change(event) {
    this.setState({
      start: event.target.value,
    });
  }
  end_change(event) {
    this.setState({
      end: event.target.value,
    });
  }

  render() {
    const { start, end } = this.state;

    // make up a key to force child re-rendering
    const key = start + end;

    return (
      <div>
        <h2>My Trend Analysis</h2>
        <div className="row pin-card">
          <span className="col l2 m2 s12" style={{ fontSize: "1em" }}>
            Start date:
          </span>
          <input
            className="col l4 m4 s12"
            type="date"
            id="start"
            name="start"
            value={start}
            onChange={this.start_change}
          />
          <span className="col l2 m2 s12" style={{ fontSize: "1em" }}>
            End date:
          </span>
          <input
            className="col l4 m4 s12"
            type="date"
            id="end"
            name="end"
            value={end}
            onChange={this.end_change}
          />
        </div>
        <StockHistorical key={key} start={start} end={end} {...this.props} />
      </div>
    );
  }
}

export default RangeFilter;
