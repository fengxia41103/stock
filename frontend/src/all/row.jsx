import React, { Component } from "react";
import classNames from "classnames";
import { map, isNil } from "lodash";
import { randomId } from "../helper.jsx";
import HighchartGraphBox from "../shared/graph-highchart.jsx";
import { DebounceInput } from "react-debounce-input";

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

    // assing a special color to text I'm interested in
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
      show_1m_graph: false,
      show_threshold: false,
    };
    this.handle_show_rank_graph = this.handle_show_rank_graph.bind(this);
    this.handle_show_1m_graph = this.handle_show_1m_graph.bind(this);
    this.handle_show_threshold = this.handle_show_threshold.bind(this);
  }

  handle_show_rank_graph(event) {
    // set values
    this.setState({
      show_rank_graph: !this.state.show_rank_graph,
    });
  }

  handle_show_1m_graph(event) {
    // set values
    this.setState({
      show_1m_graph: !this.state.show_1m_graph,
    });
  }
  handle_show_threshold(event) {
    // set values
    this.setState({
      show_threshold: !this.state.show_threshold,
    });
  }

  render() {
    const { show_rank_graph, show_1m_graph, show_threshold } = this.state;

    const { highlights, category, ranks, threshold, handle_ratio } = this.props;
    const category_name = category.replace(/_/g, " ");

    // show rank values
    const vals = map(ranks, r => (
      <Cell key={r.symbol} text={r.symbol} val={r.val} {...this.props} />
    ));

    // show threshold cutoff if any
    let cutoff = null;
    if (threshold) {
      cutoff = (
        <DebounceInput
          className="input-field"
          name={category}
          debounceTimeout={1000}
          type="text"
          value={threshold}
          onChange={handle_ratio}
        />
      );
    }

    const category_decor = classNames(
      "my-key col m12 s12",
      vals.length <= 9 ? "l3" : "l12",
      cutoff ? "cutoff" : null
    );

    const rank_chart_toggle_decor = classNames(
      "fa fa-bar-chart-o right",
      show_rank_graph ? "myhighlight" : null
    );

    const historical_chart_toggle_decor = classNames(
      "fa fa-line-chart right",
      show_1m_graph ? "myhighlight" : null
    );

    const threshold_toggle_decor = classNames(
      "fa fa-calculator right",
      show_threshold ? "myhighlight" : null
    );

    return (
      <div className="row bottom-border">
        {category ? (
          <div className={category_decor}>
            {cutoff ? (
              <i
                className={threshold_toggle_decor}
                onClick={this.handle_show_threshold}
                title="threshold"
              />
            ) : null}

            <i
              className={rank_chart_toggle_decor}
              onClick={this.handle_show_rank_graph}
              title="rank bars"
            />
            <i
              className={historical_chart_toggle_decor}
              onClick={this.handle_show_1m_graph}
              title="1m historical price"
            />
            {category_name}
            {show_threshold && cutoff ? cutoff : null}
          </div>
        ) : null}
        {vals}
        {cutoff ? <i className="fa fa-flag" title={threshold} /> : null}

        {show_rank_graph ? (
          <RowRankChart ranks={ranks} {...this.props} />
        ) : null}
        {show_1m_graph ? (
          <Row1MonthHistoricalChart rank={ranks} {...this.props} />
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

class Row1MonthHistoricalChart extends Component {
  // One month historical normalized chart.  Used in conjunction w/
  // ranking to see how history correlates with ranks.
  constructor(props) {
    super(props);
  }

  render() {
    const { ranks } = this.props;

    const containerId = randomId();
    const categories = map(ranks[0].one_month_historicals, r => r.on);
    const chart_data = map(ranks, r => {
      return {
        name: r.symbol,
        data: map(r.one_month_historicals, n => n.close_price),
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
        normalize={true}
      />
    );
  }
}

export default Row;
