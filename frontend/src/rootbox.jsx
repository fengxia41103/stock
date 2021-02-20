import React, { Component } from "react";
import classNames from "classnames";
import TopNavBox from "./shared/top_nav.jsx";
import StockList from "./stocks/list.jsx";
import Summary from "./all/summary.jsx";

class RootBox extends Component {
  constructor(props) {
    super(props);
    const SERVER = "localhost";
    const PORT = "8003";
    this.state = {
      api: "http://" + SERVER + ":" + PORT,
    };
  }

  render() {
    const { api } = this.state;
    const routes = [
      {
        path: "/summary",
        exact: true,
        sidebar: "Summary",
        main: props => <Summary api={api} />,
      },
      {
        path: "/",
        exact: true,
        sidebar: "Stocks",
        main: props => <StockList api={api} />,
      },
    ];

    return (
      <div className="container">
        <TopNavBox routes={routes} />
      </div>
    );
  }
}

export default RootBox;
