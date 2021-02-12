import React, { Component } from "react";
import classNames from "classnames";
import Highcharts from "highcharts";
import addFunnel from "highcharts/modules/funnel";

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
    } = this.props;

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
        pointFormat:
          "<tr><td><b>{series.name}</b></td>" + "<td>{point.y}</td></tr>",
        footerFormat: "</table>",
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
        },
        pie: {
          dataLabels: {
            enabled: true,
            distance: -50,
            style: {
              fontWeight: "bold",
              color: "white",
            },
          },
          startAngle: -90,
          endAngle: 90,
          center: ["50%", "85%"],
          showInLegend: true,
        },
      },
      legend: {
        enabled: legendEnabled,
      },
      series: data,
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
