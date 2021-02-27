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
      show_rank_graph: false,
      show_historical_graph: false,
    };
    this.handle_show_rank_graph = this.handle_show_rank_graph.bind(this);
    this.handle_show_historical_graph = this.handle_show_historical_graph.bind(
      this
    );
  }

  handle_show_rank_graph(event) {
    // set values
    this.setState({
      show_rank_graph: !this.state.show_rank_graph,
    });
  }

  handle_show_historical_graph(event) {
    // set values
    this.setState({
      show_historical_graph: !this.state.show_historical_graph,
    });
  }

  render() {
    const { show_rank_graph, show_historical_graph } = this.state;

    const { highlights, category, ranks } = this.props;

    const vals = map(ranks, r => (
      <Cell key={r.symbol} text={r.symbol} val={r.val} {...this.props} />
    ));

    const category_decor = classNames(
      "my-key col m12 s12",
      vals.length <= 9 ? "l3" : "l12"
    );

    const rank_chart_toggle_decor = classNames(
      "fa fa-bar-chart-o right",
      show_rank_graph ? "myhighlight" : null
    );

    const historical_chart_toggle_decor = classNames(
      "fa fa-line-chart right",
      show_historical_graph ? "myhighlight" : null
    );

    return (
      <div className="row bottom-border">
        {category ? (
          <div className={category_decor}>
            <i
              className={rank_chart_toggle_decor}
              onClick={this.handle_show_rank_graph}
            />
            <i
              className={historical_chart_toggle_decor}
              onClick={this.handle_show_historical_graph}
            />
            {category}
          </div>
        ) : null}
        {vals}
        {show_rank_graph ? (
          <RowRankChart ranks={ranks} {...this.props} />
        ) : null}
        {show_historical_graph ? (
          <RowNormalizedHistoricalChart rank={ranks} {...this.props} />
        ) : null}
      </div>
    );
  }
}

class RowRankChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { category, ranks } = this.props;

    // charting the vals. I found using chart is easier to gauge
    // relative strength. However, it takes a lot of screen
    // space. Thus I'm making it toggle.
    const containerId = randomId();
    const categories = map(ranks, r => r.symbol);
    const chart_data = [
      {
        name: category,
        data: map(ranks, r => r.val),
      },
    ];

    return (
      <HighchartGraphBox
        containerId={containerId}
        type="bar"
        categories={categories}
        yLabel=""
        title=""
        legendEnabled={true}
        data={chart_data}
      />
    );
  }
}

class RowNormalizedHistoricalChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { ranks } = this.props;

    // charting the vals. I found using chart is easier to gauge
    // relative strength. However, it takes a lot of screen
    // space. Thus I'm making it toggle.
    const containerId = randomId();
    const categories = map(ranks[0].normalized_historicals, r => r.on);
    const chart_data = map(ranks, r => {
      return {
        name: r.symbol,
        data: map(r.normalized_historicals, n => n.close_price),
      };
    });

    return (
      <HighchartGraphBox
        containerId={containerId}
        type="line"
        categories={categories}
        yLabel=""
        title=""
        legendEnabled={true}
        data={chart_data}
      />
    );
  }
}

export default Row;
