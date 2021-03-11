import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty, isNull } from "lodash";
import { randomId } from "../helper.jsx";
import HighchartGraphBox from "./graph-highchart.jsx";

class DictTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { data, interests, chart } = this.props;

    if (isEmpty(data)) {
      return <div className="positive">No data found.</div>;
    }

    const dates = map(data, i => <th key={i.on}>{i.on}</th>);

    const rows = Object.entries(interests).map(([key, description]) => {
      const row = map(data, c => {
        const decor = classNames(
          c[key] < 0 ? "negative" : null,
          c[key] == 0 ? "is-zero" : null
        );

        if (isNull(c[key])) {
          console.log(c);
          console.log(key);
        }

        return (
          <td key={c.on} className={decor}>
            {c[key].toFixed(2)}
          </td>
        );
      });
      return (
        <tr key={key}>
          <td className="my-key">{description}</td>
          {row}
        </tr>
      );
    });

    return (
      <div>
        {chart ? <Chart {...this.props} /> : null}
        <table className="table">
          <thead>
            <tr>
              <th></th>
              {dates}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  }
}

class Chart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const containerId = randomId();
    const { data, interests } = this.props;
    const dates = map(data, i => i.on);
    const chart_data = Object.entries(interests).map(([key, description]) => {
      const vals = map(data, i => i[key]);
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
        normalize={true}
      />
    );
  }
}

export default DictTable;
