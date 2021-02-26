import React, { Component } from "react";
import classNames from "classnames";
import { map, isNil } from "lodash";
import { randomId } from "../helper.jsx";
import HighchartGraphBox from "../shared/graph-highchart.jsx";

class Cell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hide: true,
    };
    this.handle_hide = this.handle_hide.bind(this);
  }

  handle_hide(event) {
    // set values
    this.setState({
      hide: !this.state.hide,
    });
  }

  render() {
    const { hide } = this.state;
    const { highlights, text, val, threshold } = this.props;

    let bk_color = "",
      font_color = "";
    if (!isNil(highlights[text])) {
      bk_color = "#" + highlights[text].background;
      font_color = highlights[text].font;
    }

    const threshold_decor = classNames(
      "bottom-border col l1 m2 s6 text-center",
      threshold == val ? "threshold" : null
    );

    return (
      <span
        className="bottom-border col l1 m2 s6 text-center"
        className={threshold_decor}
        style={{
          backgroundColor: bk_color,
          color: font_color,
        }}
        onMouseOver={this.handle_hide}
        onMouseLeave={this.handle_hide}
      >
        {hide ? text : null}
        {!hide ? val.toFixed(2) : null}
      </span>
    );
  }
}

class Row extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show_graph: false,
    };
    this.handle_show_graph = this.handle_show_graph.bind(this);
  }

  handle_show_graph(event) {
    // set values
    this.setState({
      show_graph: !this.state.show_graph,
    });
  }

  render() {
    const { show_graph } = this.state;

    const { highlights, category, ranks } = this.props;

    // func to compute median value
    const median = array => {
      array.sort((a, b) => b - a);
      const length = array.length;
      if (length % 2 == 0) {
        return (arr[length / 2] + arr[length / 2 - 1]) / 2;
      } else {
        return array[Math.floor(length / 2)];
      }
    };
    const median_val = median(map(ranks, r => r.val));

    const vals = map(ranks, r => (
      <Cell
        key={r.symbol}
        text={r.symbol}
        val={r.val}
        threshold={median_val}
        {...this.props}
      />
    ));

    // charting the vals. I found using chart is easier to gauge
    // relative strength. However, it takes a lot of screen
    // space. Thus I'm making it toggle.
    const containerId = randomId();
    const chart_categories = map(ranks, r => r.symbol);
    const chart_data = [
      {
        name: category,
        data: map(ranks, r => r.val),
      },
    ];

    return (
      <div className="row bottom-border">
        {category ? (
          <div className="my-key col l3 m12 s12">
            <i
              className="fa fa-bar-chart-o right"
              onClick={this.handle_show_graph}
            />
            {category}
          </div>
        ) : null}
        {vals}

        {show_graph ? (
          <HighchartGraphBox
            containerId={containerId}
            type="bar"
            categories={chart_categories}
            yLabel=""
            title=""
            legendEnabled={true}
            data={chart_data}
          />
        ) : null}
      </div>
    );
  }
}

export default Row;
