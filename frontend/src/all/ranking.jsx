import React, { Component } from "react";
import classNames from "classnames";
import { map } from "lodash";
import { DebounceInput } from "react-debounce-input";
import Rank from "./rank.jsx";

class Ranking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interests: [],

      // how many in a rank I'm interested in, eg. top 10
      top: 5,

      // thresholds
      // well, there seems to be certain _filter_ method
      // that sets up a threhold on an index, which essentially
      // captures someone's judgement of _what is good/safe_.
      // key: API rank data's key
      // val: ">=" or "<="
      thresholds: {
        roe: ">=20",
        current_ratio: ">=2",
        equity_multiplier: "<=2.5",
        dividend_payout_ratio: ">=25",
        net_income_margin: ">=20",
        gross_margin: ">=40",
        ocf_over_net_income: ">=100",
      },
    };

    this.handle_change = this.handle_change.bind(this);
    this.handle_top = this.handle_top.bind(this);
    this.get_contrast = this.get_contrast.bind(this);
    this.handle_ratio = this.handle_ratio.bind(this);
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

  handle_ratio(event) {
    const value = event.target.value;
    let old_thresholds = this.state.thresholds;
    old_thresholds[event.target.name] = value;
    this.setState({
      thresholds: old_thresholds,
    });
  }

  get_contrast(background) {
    // func to compute font color to contrast w/ background color
    return parseInt(background, 16) > 0xffffff / 2 ? "black" : "white";
  }

  render() {
    const { interests, top, thresholds } = this.state;

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

    const ranking_mapping = {
      ROE: "stock-ranks",
      "Balance Sheet": "balance-ranks",
      "Income Statement": "income-ranks",
      "Cash Flow Statement": "cash-ranks",
    };
    const rankings = map(ranking_mapping, (resource, title) => {
      return (
        <div className="card">
          <h4 className="bottom-border">{title}</h4>
          <Rank
            resource={resource}
            highlights={highlights}
            top={top}
            thresholds={thresholds}
            handle_ratio={this.handle_ratio}
            {...this.props}
          />
        </div>
      );
    });

    // render
    return (
      <div>
        <div className="row">
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
        </div>
        {rankings}
      </div>
    );
  }
}

export default Ranking;
