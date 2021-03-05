import React, { Component } from "react";
import classNames from "classnames";
import Fetch from "../shared/fetch.jsx";
import { map } from "lodash";

import DCF from "./dcf.jsx";
import DuPont from "./dupont.jsx";
import NetAsset from "./nav.jsx";
import Income from "./income.jsx";
import Cash from "./cash.jsx";
import StockDaily from "./daily.jsx";
import ValuationRatio from "./ratio.jsx";
import Balance from "./balance.jsx";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import StockSummary from "./summary.jsx";

class StockFinancial extends Fetch {
  constructor(props) {
    super(props);
    this.state.resource = this.props.resource;
  }

  render_data(stock) {
    const { id } = stock;
    const navs = [
      {
        title: "DuPont",
        content: <DuPont dupont={stock.dupont_model} />,
      },
      {
        title: "Net Asset",
        content: <NetAsset nav={stock.nav_model} />,
      },
      {
        title: "DCF",
        content: <DCF stock={stock} />,
      },
      {
        title: "Balance Sheet",
        content: <Balance balances={stock.balances} />,
      },
      {
        title: "Income Statement",
        content: <Income incomes={stock.incomes} />,
      },
      {
        title: "Cash Flow Statement",
        content: <Cash cashes={stock.cashes} />,
      },
      {
        title: "Valuation Ratios",
        content: <ValuationRatio ratios={stock.ratios} />,
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
          <h2>{stock.symbol}</h2>
          <div className="row">{tabs}</div>
          <StockSummary stock={stock} />
          <Switch>{routes}</Switch>
        </div>
      </Router>
    );
  }
}
export default StockFinancial;
