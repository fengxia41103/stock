import React, { Component } from "react";
import classNames from "classnames";
import { map } from "lodash";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
} from "react-router-dom";

class TopNavBox extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { routes } = this.props;
    const links = map(routes, r => {
      if (r.exact) {
        return (
          <NavLink
            exact
            key={r.path}
            to={r.path}
            activeClassName="active"
            className="col l3 m3 s6 center"
          >
            {r.sidebar}
          </NavLink>
        );
      } else {
        return (
          <NavLink
            key={r.path}
            to={r.path}
            activeClassName="active"
            className="col l3 m3 s6 center"
          >
            {r.sidebar}
          </NavLink>
        );
      }
    });

    return (
      <Router>
        <div>
          <div className="row">{links}</div>

          <div className="row">
            <Switch>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  exact={route.exact}
                  children={<route.main />}
                />
              ))}
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default TopNavBox;
