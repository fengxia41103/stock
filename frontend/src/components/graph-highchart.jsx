import React, { Component } from "react";
import Highcharts from "highcharts";
import addFunnel from "highcharts/modules/funnel";
import { map, filter, isNull } from "lodash";

//****************************************
//
//    Common graph containers
//
//****************************************
class HighchartGraphBox extends Component {
  constructor(props) {
    super(props);

    this.chart = null;

    this.state = {
      // per data line so chart height will scale
      height_step: 0,
      full_height: 0,
    };

    //binding
    this.makeViz = this.makeViz.bind(this);
    this._normalize = this._normalize.bind(this);
  }

  _normalize(data) {
    // Some may have 0s or all 0s.
    const tmp = filter(data, d => d !== 0);

    // if all 0s
    if (tmp.length === 0) return data;

    const base = tmp[0];
    const normalized = map(data, d => {
      if (d === 0) return 0;
      if (d === base) return 1;

      // both positive or negative, just straightforward normalizing to reference
      // as 1.
      if ((d > 0 && base > 0) || (d < 0 && base < 0)) {
        return d / Math.abs(base);
      } else {
        return (d - base) / Math.abs(base);
      }
    });

    return normalized;
  }

  makeViz() {
    const {
      type,
      title,
      footer,
      categories,
      yLabel,
      legendEnabled,
      data,
      normalize,
    } = this.props;

    // chart data can be normalized for comparison purpose
    let chart_data = data;
    if (normalize) {
      chart_data = map(chart_data, d => {
        let tmp = d;
        tmp.data = this._normalize(d.data);
        return tmp;
      });
    }

    // Set chart height dynamically
    const height = Math.max(500, this.state.height_step * categories.length);
    this.setState({
      full_height: height,
    });

    // Chart options
    const options = {
      chart: {
        type: type,
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        height: height,
        styleMode: true,
      },
      title: {
        text: title,
      },
      subtitle: {
        text: footer,
      },
      xAxis: {
        categories: categories,
        crosshair: true,
      },
      yAxis: {
        title: {
          text: yLabel,
        },
      },
      tooltip: {
        headerFormat:
          '<h5 class="page-header">{point.key}</h5><table class="table table-striped">',
        pointFormat: "<tr><td>{series.name}</td>" + "<td>{point.y}</td></tr>",
        footerFormat: "</table>",
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          negativeColor: "#d52349",
        },
        bar: {
          negativeColor: "#d52349",
        },
        line: {
          //negativeColor: "#d52349",
        },
      },
      legend: {
        enabled: legendEnabled,
      },
      series: chart_data,
    };

    // Render chart
    this.chart = new Highcharts["Chart"](this.props.containerId, options);
  }

  componentDidMount() {
    // Initialize graph
    // Apply funnel after window is present
    Highcharts.setOptions({
      lang: {
        thousandsSep: ",",
      },
    });
    addFunnel(Highcharts);

    this.makeViz();
  }

  componentWillUnmount() {
    if (isNull(this.chart)) return;
    this.chart.destroy();
  }

  render() {
    const { containerId, title } = this.props;

    return (
      <div className="bottom-border">
        <figure
          id={containerId}
          style={{ minHeight: this.state.full_height * 1.05 + "px" }}
        >
          <figcaption>{title}</figcaption>
        </figure>
      </div>
    );
  }
}

export default HighchartGraphBox;
