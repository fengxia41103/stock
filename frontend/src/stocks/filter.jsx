import React, { Component } from "react";
import classNames from "classnames";
import { map, filter, sortBy } from "lodash";
import { Jumbotron } from "react-bootstrap";
import { DebounceInput } from "react-debounce-input";

import StockDetail from "./detail.jsx";

class RangeFilter extends Component {
  constructor(props) {
    super(props);

    this.state = { start: "2021-02-01", end: "2021-02-08" };

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
      <div className="row">
        <label htmlFor="start" className="col l3 m3 s12 mylabel">
          Start date:
        </label>
        <input
          type="date"
          id="start"
          name="start"
          value={start}
          onChange={this.start_change}
          className="col l3 m3 s12"
        />
        <label htmlFor="end" className="col l3 m3 s12 mylabel">
          End date:
        </label>
        <input
          type="date"
          id="end"
          name="end"
          value={end}
          onChange={this.end_change}
          className="col l3 m3 s12"
        />
        <StockDetail key={key} start={start} end={end} {...this.props} />
      </div>
    );
  }
}

export default RangeFilter;
