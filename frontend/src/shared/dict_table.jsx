import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";

class DictTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { data, interests } = this.props;

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
      <table className="table">
        <thead>
          <tr>
            <th></th>
            {dates}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

export default DictTable;
