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
    const { highlights, text, val } = this.props;

    let bk_color = "",
      font_color = "";
    if (!isNil(highlights[text])) {
      bk_color = "#" + highlights[text].background;
      font_color = highlights[text].font;
    }

    return (
      <span
        className="bottom-border col l1 m2 s6 text-center"
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

    const vals = map(ranks, r => (
      <Cell key={r.symbol} text={r.symbol} val={r.val} {...this.props} />
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

    const category_decor = classNames(
      "my-key col m12 s12",
      vals.length <= 9 ? "l3" : "l12"
    );

    return (
      <div className="row bottom-border">
        {category ? (
          <div className={category_decor}>
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
