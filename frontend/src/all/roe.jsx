import React, { Component } from "react";
import classNames from "classnames";
import Fetch from "../shared/fetch.jsx";
import { map } from "lodash";

class RankByROE extends Fetch {
  constructor(props) {
    super(props);
    this.state.resource = "/api/v1/stock-ranks";
  }

  render_data(data) {
    const roe = data.objects[0].stats;
    const tmp = roe.slice(0, 10);
    const vals = map(tmp, r => {
      return (
        <span key={r.symbol} className="bottom-border col s1">
          {r.symbol}
        </span>
      );
    });

    return (
      <div className="row">
        <div className="myhighlight bottom-border col s2">ROE</div>
        {vals}
      </div>
    );
  }
}

export default RankByROE;
