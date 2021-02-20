import React, { Component } from "react";
import classNames from "classnames";
import Fetch from "../shared/fetch.jsx";
import { map } from "lodash";

class Rank extends Fetch {
  constructor(props) {
    super(props);
    this.state.resource = "/api/v1/" + this.props.resource;
  }

  render_data(data) {
    const rows = map(data.objects, d => {
      const row = map(d.stats, s => {
        return (
          <span key={s.symbol} className="bottom-border col s1">
            {s.symbol}
          </span>
        );
      });

      return (
        <div className="row">
          <div className="myhighlight bottom-border col s2">{d.name}</div>
          {row}
        </div>
      );
    });

    return <div>{rows}</div>;
  }
}

export default Rank;
