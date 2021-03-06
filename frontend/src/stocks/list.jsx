import React, { Component } from "react";
import classNames from "classnames";
import { map, filter, sortBy, groupBy } from "lodash";
import { Jumbotron } from "react-bootstrap";
import { DebounceInput } from "react-debounce-input";
import ToggleDetails from "../shared/toggle_details.jsx";
import Fetch from "../shared/fetch.jsx";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import StockDetail from "./detail.jsx";

class StockList extends Fetch {
  constructor(props) {
    super(props);
    this.state.resource = "/api/v1/stocks";
    this.state.searching = "BFAM";

    // binding
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const tmp = event.target.value.trim().toUpperCase();

    this.setState({
      searching: tmp,
    });
  }

  render_data(data) {
    const stocks = data.objects;
    const { resource: url_root } = this.state;

    // filter based on search string
    const filtered = filter(stocks, x =>
      x.symbol.includes(this.state.searching)
    );

    // routing to detail page
    const details = map(filtered, v => {
      // this value must match w/ NavLink `to` value!
      const tmp = "/stock/" + v.id;

      const resource = url_root + "/" + v.id;
      return (
        <Route
          key={v.id}
          path={tmp}
          children={props => (
            <StockDetail
              key={v.id}
              id={v.id}
              resource={resource}
              {...this.props}
            />
          )}
        />
      );
    });

    // when select
    const grouped = groupBy(filtered, v => v.last_reporting_date);
    const selectors = map(grouped, (symbols, reporting_date) => {
      const sorted = sortBy(symbols, s => s.symbol);
      const links = map(sorted, v => {
        const url = "/stock/" + v.id;
        return (
          <NavLink
            key={v.id}
            activeClassName="active"
            className="col l3 m4 s6 "
            to={url}
          >
            {v.symbol}
          </NavLink>
        );
      });

      return (
        <div key={reporting_date} className="row card">
          <div className="col s12" title="Latest financial reporting date">
            <i className="fa fa-microphone"></i>
            &nbsp;
            {reporting_date == "null" ? "ETF/Index" : reporting_date}
          </div>
          {links}
        </div>
      );
    });

    // presentation of the selector
    const pick = (
      <Jumbotron className="row">
        <DebounceInput
          className="input-field"
          debounceTimeout={500}
          value={this.state.searching}
          onChange={this.handleChange}
        />

        {selectors}
      </Jumbotron>
    );

    return (
      <Router>
        <div>
          <ToggleDetails details={pick} show="true" title="Select a stock" />

          <Switch>{details}</Switch>
        </div>
      </Router>
    );
  }
}

export default StockList;
