import React, { Component } from "react";
import classNames from "classnames";
import Fetch from "../shared/fetch.jsx";
import { map } from "lodash";
import Row from "./row.jsx";

class Rank extends Fetch {
  constructor(props) {
    super(props);
    this.state.resource = "/api/v1/" + this.props.resource;
  }

  render_data(data) {
    const { highlights } = this.props;

    const rows = map(data.objects, d => {
      const name = d.name.replace(/_/g, " ");
      return (
        <Row key={d.name} category={name} ranks={d.stats} {...this.props} />
      );
    });

    return <div>{rows}</div>;
  }
}

export default Rank;
