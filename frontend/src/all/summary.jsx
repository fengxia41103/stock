import React, { Component } from "react";
import classNames from "classnames";
import { map } from "lodash";
import { DebounceInput } from "react-debounce-input";
import RankByROE from "./roe.jsx";
import Rank from "./rank.jsx";

class Summary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interests: [],

      // how many in a rank I'm interested in, eg. top 10
      top: 9,
    };

    this.handle_change = this.handle_change.bind(this);
    this.handle_top = this.handle_top.bind(this);
    this.get_contrast = this.get_contrast.bind(this);
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

  handle_top(event) {
    // set values
    this.setState({
      top: event.target.value,
    });
  }

  get_contrast(background) {
    // func to compute font color to contrast w/ background color
    return parseInt(background, 16) > 0xffffff / 2 ? "black" : "white";
  }

  render() {
    const { interests, top } = this.state;

    // highlight background color choices
    let highlights = map(interests, i => {
      const bk_color = Math.floor(Math.random() * 16777215).toString(16);
      const font_color = this.get_contrast(bk_color);
      return [
        i,
        {
          background: bk_color,
          font: font_color,
        },
      ];
    });
    highlights = Object.fromEntries(highlights);

    // render
    return (
      <div>
        <div className="col l9 m7 s12">
          Symbol
          <DebounceInput
            className="input-field"
            debounceTimeout={500}
            value={interests.join(" ")}
            onChange={this.handle_change}
          />
        </div>
        <div className="col l3 m5 s12">
          Top
          <DebounceInput
            className="input-field"
            debounceTimeout={1000}
            value={top}
            type="number"
            onChange={this.handle_top}
          />
        </div>

        <Rank
          resource="stock-ranks"
          highlights={highlights}
          top={top}
          {...this.props}
        />
        <h4 className="bottom-border">Income Statement</h4>
        <Rank
          resource="income-ranks"
          highlights={highlights}
          top={top}
          {...this.props}
        />
        <h4 className="bottom-border">Balance Sheet</h4>
        <Rank
          resource="balance-ranks"
          highlights={highlights}
          top={top}
          {...this.props}
        />
        <h4 className="bottom-border">Cash Flow</h4>
        <Rank
          resource="cash-ranks"
          highlights={highlights}
          top={top}
          {...this.props}
        />
      </div>
    );
  }
}

export default Summary;
