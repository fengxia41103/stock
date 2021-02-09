import React, { Component } from "react";
import classNames from "classnames";
import { map, isUndefined } from "lodash";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
} from "react-router-dom";
import { DashboardCard } from "../dashboard.jsx";

class SideNavBox extends Component {
  constructor(props) {
    super(props);

    this._create_nav = this._create_nav.bind(this);
    this._create_main = this._create_main.bind(this);
  }

  _create_nav(link) {
    return (
      <NavLink
        exact={link.exact}
        key={link.path}
        to={link.path}
        activeClassName="active"
        className="col s12"
      >
        {link.sidebar}
      </NavLink>
    );
  }

  _create_main(link) {
    return (
      <Route
        children={<link.main />}
        exact={link.exact}
        key={link.path}
        path={link.path}
      />
    );
  }

  render() {
    const { routes } = this.props;
    const links = map(routes, r => {
      if (isUndefined(r.group)) {
        return this._create_nav(r);
      } else {
        const children = map(r.links, l => this._create_nav(l));
        return (
          <div className="col s12">
            <DashboardCard name={r.group} />
            {children}
          </div>
        );
      }
    });

    const mains = map(routes, r => {
      if (isUndefined(r.group)) {
        return this._create_main(r);
      } else {
        return map(r.links, l => this._create_main(l));
      }
    });

    return (
      <Router>
        <div className="row">
          <div className="col l2 m4 s12 my-sidenav">{links}</div>

          <div className="col l10 m8 s12" style={{ paddingLeft: "1em" }}>
            <Switch>{mains}</Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default SideNavBox;
