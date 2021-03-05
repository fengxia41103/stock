import React, { Component } from "react";
import classNames from "classnames";
import Fetch from "../shared/fetch.jsx";
import { map } from "lodash";
import { StrategyValueChart, PriceChart, IndicatorChart } from "./charts.jsx";
import Stats from "./stats.jsx";
import Income from "./income.jsx";
import Cash from "./cash.jsx";
import StockDaily from "./daily.jsx";
import ValuationRatio from "./ratio.jsx";
import Balance from "./balance.jsx";
import RangeFilter from "./filter.jsx";
import DictCard from "../shared/dict_card.jsx";
import DCF from "./dcf.jsx";
import DuPont from "./dupont.jsx";
import NetAsset from "./nav.jsx";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";

class StockSummary extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { stock } = this.props;
    const interests = {
      latest_close_price: "Latest Close Price",
      last_reporting_date: "Last Reporting Date",
      profit_margin: "Profit Margin %",
      beta: "BETA",
      top_ten_institution_ownership: "Top 10 Institution Owned %",
      roa: "ROA",
      roe: "ROE",
      dupont_roe: "DuPont ROE",
      roe_dupont_reported_gap: "ROE Gap %",
    };

    return <DictCard data={stock} interests={interests} />;
  }
}

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

class StockDetail extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <StockFinancial {...this.props} />
        <RangeFilter {...this.props} />
      </div>
    );
  }
}
export { StockDetail, StockHistorical };
