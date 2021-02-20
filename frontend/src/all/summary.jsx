import React, { Component } from "react";
import classNames from "classnames";
import { map } from "lodash";
import RankByROE from "./roe.jsx";
import Rank from "./rank.jsx";

class Summary extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="row">
        <RankByROE {...this.props} />
        <Rank resource="balance-ranks" {...this.props} />
        <Rank resource="cash-ranks" {...this.props} />
      </div>
    );
  }
}

export default Summary;
