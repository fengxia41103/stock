import React, { Component } from "react";
import classNames from "classnames";
import { map } from "lodash";

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
    const { highlights, text, val } = this.props;
    const { hide } = this.state;
    const color = highlights[text];
    return (
      <span
        className="bottom-border col s1 text-center"
        style={{ backgroundColor: color }}
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
          <div className="my-key col s3 text-right">{category}</div>
        ) : null}
        {vals}
      </div>
    );
  }
}

export default Row;
