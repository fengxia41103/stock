import React, { Component } from "react";
import classNames from "classnames";
import { map, filter, sortBy } from "lodash";
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
import { StockDetail } from "./detail.jsx";

class StockList extends Fetch {
  constructor(props) {
    super(props);
    const filter = "?limit=50";
    this.state.stock = "/api/v1/stocks";
    this.state.resource = this.state.stock + filter;
    this.state.searching = "TSM";

    // binding
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({
      searching: event.target.value,
    });
  }

  render_data(data) {
    const stocks = data.objects;

    // filter based on search string
    const filtered = filter(stocks, x =>
      x.symbol.includes(this.state.searching)
    );

    // routing to detail page
    const details = map(stocks, v => {
      const tmp = "/stock/" + v.id;
      const resource = this.state.stock + "/" + v.id;
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
    const selectors = map(
      sortBy(filtered, x => x.symbol),
      v => {
        return (
          <NavLink
            activeClassName="active"
            className="col l4 m6 s12 "
            key={v.id}
            to={"/stock/" + v.id}
          >
            <i className="fa fa-code-fork"></i>
            &nbsp;{v.symbol}
          </NavLink>
        );
      }
    );

    // presentation of the selector
    const pick = (
      <Jumbotron className="row">
        <DebounceInput
          className="input-field"
          debounceTimeout={2000}
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
