import React, { Component } from "react";
import classNames from "classnames";
import { map, filter, sortBy } from "lodash";
import { Jumbotron } from "react-bootstrap";
import { DebounceInput } from "react-debounce-input";
import { randomId } from "./helper.jsx";
import HighchartGraphBox from "./shared/graph-highchart.jsx";
import ToggleDetails from "./shared/toggle_details.jsx";
import Fetch from "./shared/fetch.jsx";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";

class StockList extends Fetch {
  constructor(props) {
    super(props);
    this.state.resource = "/api/v1/stocks";

    this.state.searching = "AAPL";
    this.state.changed = true;

    // binding
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const changed = !(this.state.searching === event.target.value);

    this.setState({
      searching: event.target.value,
      changed: changed,
    });
  }

  render_data(data) {
    const { api } = this.props;
    const stocks = data.objects;

    // filter based on search string
    const filtered = filter(stocks, x =>
      x.symbol.includes(this.state.searching)
    );

    // routing to detail page
    const details = map(stocks, v => {
      const tmp = "/stock/" + v.id;
      return (
        <Route
          key={v.id}
          path={tmp}
          children={props => <StockDetail key={v.id} id={v.id} api={api} />}
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

class StockDetail extends Fetch {
  constructor(props) {
    super(props);
    const { id } = this.props;
    this.state.resource = "/api/v1/stocks/" + id;
  }

  render_data(stock) {
    const { api } = this.props;

    return (
      <div>
        <h1>{stock.symbol}</h1>
      </div>
    );
  }
}

export default StockList;
