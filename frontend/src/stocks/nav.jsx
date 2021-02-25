import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";
import DictTable from "../shared/dict_table.jsx";
import { randomId } from "../helper.jsx";
import HighchartGraphBox from "../shared/graph-highchart.jsx";

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
        <DictTable data={nav} interests={analysis} />
        <NavChart interests={analysis} {...this.props} />
      </div>
    );
  }
}

class NavChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const containerId = randomId();
    const { nav, interests } = this.props;
    const dates = map(nav, i => i.on);
    const chart_data = Object.entries(interests).map(([key, description]) => {
      const vals = map(nav, i => i[key]);
      return { name: description, data: vals };
    });

    return (
      <HighchartGraphBox
        containerId={containerId}
        type="line"
        categories={dates}
        yLabel=""
        title=""
        legendEnabled={true}
        data={chart_data}
      />
    );
  }
}

export default NetAsset;
