import React, { Component } from "react";
import classNames from "classnames";
import Fetch from "../shared/fetch.jsx";
import { map } from "lodash";
import { StrategyValueChart, PriceChart, IndicatorChart } from "./charts.jsx";
import Stats from "./stats.jsx";
import StockDaily from "./daily.jsx";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";

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
    const { olds: historicals, stats, indexes, id } = stock;
    const period = (
      <div>
        <span className="myhighlight">{start}</span>
        &mdash;
        <span className="myhighlight">{end}</span>
      </div>
    );

    const navs = [
      {
        title: "Price",
        content: <StockDaily historicals={historicals} />,
      },
      {
        title: "My Indicators",
        content: <Stats stats={stats} />,
      },
      {
        title: "Tech Indicators",
        content: <IndicatorChart data={historicals} period={period} />,
      },
      {
        title: "Overnight Return",
        content: (
          <StrategyValueChart
            name="Overnight Return %"
            data={indexes["overnight return"]}
          />
        ),
      },
      {
        title: "Daily Return",
        content: (
          <StrategyValueChart
            name="Daily Return %"
            data={indexes["daily return"]}
          />
        ),
      },
    ];

    const routes = map(navs, n => {
      const key = n.title.replace(" ", "_").toLowerCase();
      const path = "/stock/" + id + "/" + key;
      return <Route key={key} path={path} children={props => n.content} />;
    });

    const tabs = map(navs, n => {
      const key = n.title.replace(" ", "_").toLowerCase();
      const path = "/stock/" + id + "/" + key;
      return (
        <NavLink key={key} activeClassName="side-active" to={path}>
          |&nbsp;{n.title}&nbsp;
        </NavLink>
      );
    });

    return (
      <Router>
        <div>
          <div className="row">{tabs}</div>
          <PriceChart data={historicals} period={period} />
          <Switch>{routes}</Switch>
        </div>
      </Router>
    );
  }
}
export default StockHistorical;
