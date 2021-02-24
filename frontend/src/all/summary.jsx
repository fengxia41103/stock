import React, { Component } from "react";
import classNames from "classnames";
import { map, random } from "lodash";
import { DebounceInput } from "react-debounce-input";
import RankByROE from "./roe.jsx";
import Rank from "./rank.jsx";

class Summary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interests: [],
    };

    this.handle_change = this.handle_change.bind(this);
  }

  handle_change(event) {
    // inputs are space delimited values
    const tmp = event.target.value
      .split(/\s+/g)
      .map(x => x.trim())
      .map(x => x.toUpperCase());

    // set values
    this.setState({
      interests: tmp,
    });
  }

  render() {
    const { interests } = this.state;

    // highlight color choices
    const colors = [
      "#fDD837",
      "#fbeeac",
      "#f1d1d0",
      "#fbaccc",
      "#f875aa",
      "#f0a500",
      "#e45826",
      "#007965",
      "#42AF5F",
      "#607DB8",
    ];

    // randomly assign a color to a symbol
    let highlights = map(interests, s => {
      const index = random(0, colors.length);
      return [s, colors[index]];
    });
    highlights = Object.fromEntries(highlights);

    // render
    return (
      <div>
        <DebounceInput
          className="input-field"
          debounceTimeout={5000}
          value={interests.join(" ")}
          onChange={this.handle_change}
        />
        <RankByROE highlights={highlights} {...this.props} />
        <Rank
          resource="balance-ranks"
          highlights={highlights}
          {...this.props}
        />
        <Rank resource="cash-ranks" highlights={highlights} {...this.props} />
        <Rank resource="income-ranks" highlights={highlights} {...this.props} />
      </div>
    );
  }
}

export default Summary;
