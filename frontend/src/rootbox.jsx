import React, { Component } from "react";
import classNames from "classnames";
import TopNavBox from "./shared/top_nav.jsx";
import StockList from "./stocks/list.jsx";
import Ranking from "./all/ranking.jsx";

class RootBox extends Component {
  constructor(props) {
    super(props);
    const SERVER = "192.168.68.107";
    const PORT = "8003";
    this.state = {
      api: "http://" + SERVER + ":" + PORT,
    };
  }

  render() {
    const { api } = this.state;
    const routes = [
      {
        path: "/ranking",
        exact: true,
        sidebar: "Rankiing",
        main: props => <Ranking api={api} />,
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
