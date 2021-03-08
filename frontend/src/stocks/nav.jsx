import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";
import DictTable from "../shared/dict_table.jsx";

class NetAsset extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { nav } = this.props;

    if (isEmpty(nav)) {
      return null;
    }

    const analysis = {
      nav: "NAV",
    };

    return (
      <div>
        Net Asset Model
        <DictTable data={nav} interests={analysis} chart={true} />
      </div>
    );
  }
}

export default NetAsset;
