import React, { Component } from "react";
import classNames from "classnames";
import Fetch from "../shared/fetch.jsx";
import { map, filter } from "lodash";
import Row from "./row.jsx";

class Rank extends Fetch {
  constructor(props) {
    super(props);
    this.state.resource = "/api/v1/" + this.props.resource;
  }

  render_data(data) {
    const { top, thresholds } = this.props;
    const rows = map(data.objects, d => {
      let stats = d.stats;
      let threshold = null;

      if (thresholds.hasOwnProperty(d.name)) {
        threshold = thresholds[d.name];
        const tmp = threshold.split("=");

        // if malformat, do nothing!
        if (tmp.length != 2) return;

        const sign = tmp[0];
        const threshold_value = parseFloat(tmp[1]);

        stats = filter(stats, s => {
          if (sign == ">") {
            return s.val >= threshold_value;
          } else {
            return s.val <= threshold_value;
          }
        });
      }

      const ranks = stats.slice(0, top);
      return (
        <Row
          key={d.name}
          category={d.name}
          ranks={ranks}
          threshold={threshold}
          {...this.props}
        />
      );
    });

    return <div>{rows}</div>;
  }
}

export default Rank;
