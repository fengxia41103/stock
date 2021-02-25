import React, { Component } from "react";
import classNames from "classnames";
import { map, isNil } from "lodash";

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
          mixBlendMode: "hard-light",
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
  }

  render() {
    const { highlights, category, ranks } = this.props;

    const vals = map(ranks, r => (
      <Cell key={r.symbol} text={r.symbol} val={r.val} {...this.props} />
    ));

    return (
      <div className="row bottom-border">
        {category ? (
          <div className="my-key col l3 m4 s12 text-right">{category}</div>
        ) : null}
        {vals}
      </div>
    );
  }
}

export default Row;
