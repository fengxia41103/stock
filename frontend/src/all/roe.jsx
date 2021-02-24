import React, { Component } from "react";
import classNames from "classnames";
import Fetch from "../shared/fetch.jsx";
import { map } from "lodash";
import Row from "./row.jsx";

class RankByROE extends Fetch {
  constructor(props) {
    super(props);
    this.state.resource = "/api/v1/stock-ranks";
  }

  render_data(data) {
    const { highlights } = this.props;

    const roe = data.objects[0].stats;
    const tmp = map(roe.slice(0, 12), r => {
      let aa = r;
      aa.val = r.roe;
      return aa;
    });

    return (
      <div className="jumbotron">
        <div className="myhighlight">ROE</div>
        <Row category="" ranks={tmp} {...this.props} />
      </div>
    );
  }
}

export default RankByROE;
