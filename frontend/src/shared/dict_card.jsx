import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty } from "lodash";

class DictCard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { data, interests } = this.props;
    if (isEmpty(data)) {
      return <div className="positive">No data found.</div>;
    }

    const cards = Object.entries(interests).map(([key, description]) => {
      const val = data[key];
      const decor = classNames(
        val < 0 ? "negative" : null,
        val == 0 ? "is-zero" : null
      );

      return (
        <div key={key} className="col l3 m4 s12 card">
          <h4 className="mylabel">{description}</h4>
          <div className="quotation decor">{val.toFixed(2)}</div>
        </div>
      );
    });

    return <div className="row"> {cards}</div>;
  }
}

export default DictCard;
