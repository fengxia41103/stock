import React, { Component } from "react";
import classNames from "classnames";
import { map, isEmpty, isNumber } from "lodash";

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
      let val = data[key];
      let decor = null;

      if (isNumber(val)) {
        decor = classNames(
          "quotation",
          val < 0 ? "negative" : null,
          val == 0 ? "is-zero" : null
        );
        val = val.toFixed(2);
      } else {
        decor = classNames("quotation");
      }

      return (
        <div key={key} className="col l4 m6 s12 card">
          <h4 className="mylabel">{description}</h4>
          <div className={decor}>{val}</div>
        </div>
      );
    });

    return <div className="row"> {cards}</div>;
  }
}

export default DictCard;
