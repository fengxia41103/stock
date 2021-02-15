import React, { Component } from "react";
import classNames from "classnames";

class Stats extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { stats } = this.props;
    const my_class = (val, threshold) => {
      return classNames("quotation", val > threshold ? "positive" : "negative");
    };

    const total_days = (
      <div className="col l3 m4 s12 card">
        <h4 className="mylabel">Trading Days</h4>
        <div className="quotation">{stats.days}</div>
      </div>
    );

    const total_return = (
      <div className="col l3 m4 s12 card">
        <h4 className="mylabel">End-to-End Return %</h4>
        <div className={my_class(stats.return, 100)}>{stats.return}</div>
      </div>
    );
    const close_price_rsd = (
      <div className="col l3 m4 s12 card">
        <h4 className="mylabel">Close Price RSD %</h4>
        <div className="quotation">{stats["close price rsd"]}</div>
      </div>
    );

    const overnight_trend = (
      <div className="col l3 m4 s12 card">
        <h4 className="mylabel">
          Overnight&mdash;
          <span className="negative">Flip</span>/Consistency
        </h4>
        <div className="quotation">
          <span className="negative">{stats.overnight[0]}</span>/
          {stats.overnight[1]}
        </div>
      </div>
    );

    const two_day_trend = (
      <div className="col l3 m4 s12 card">
        <h4 className="mylabel">
          Two-day Trend&mdash;
          <span className="positive">Up</span>/
          <span className="negative">Down</span>/Flip
        </h4>
        <div className="quotation">
          <span className="positive">{stats.trend[1]}</span>/
          <span className="negative">{stats.trend[2]}</span>/{stats.trend[3]}
        </div>
      </div>
    );

    const daily_return = (
      <div className="col l3 m4 s12 card">
        <h4 className="mylabel">
          Daily Return&mdash;
          <span className="positive">UP %</span>/DOWN %
        </h4>
        <div className="quotation">
          <span className="positive">{stats.ups}</span>/{stats.downs}
        </div>
      </div>
    );
    const compounded_return = (
      <div className="col l3 m4 s12 card">
        <h4 className="mylabel">Compounded Return %</h4>
        <div className={my_class(stats["compounded return"], 100)}>
          {stats["compounded return"]}
        </div>
      </div>
    );

    const up_trend = (
      <div className="col l3 m4 s12 card">
        <h4 className="mylabel">
          UP Daily Return&mdash;
          <span className="negative">Avg</span>/RSD %
        </h4>
        <div className="quotation">
          <span className="positive">{stats["avg daily up"]}</span>/
          {stats["daily up rsd"]}
        </div>
      </div>
    );
    const down_trend = (
      <div className="col l3 m4 s12 card">
        <h4 className="mylabel">
          DOWN Daily Return&mdash;
          <span className="negative">Avg</span>/RSD %
        </h4>
        <div className="quotation">
          <span className="negative">{stats["avg daily down"]}</span>/
          {stats["daily down rsd"]}
        </div>
      </div>
    );

    return (
      <div className="row">
        {total_days}
        {total_return}
        {compounded_return}
        {close_price_rsd}
        {overnight_trend}
        {two_day_trend}
        {daily_return}
        {up_trend}
        {down_trend}
      </div>
    );
  }
}

export default Stats;
