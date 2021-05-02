import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HC_more from "highcharts/highcharts-more"; //module
import addFunnel from "highcharts/modules/funnel";
import { map, filter, isNull } from "lodash";
import PropTypes from "prop-types";

//****************************************
//
//    Common graph containers
//
//****************************************
export default function HighchartGraphBox(props) {
  const [height_step, setHeightStep] = useState(0);
  const [full_height, setFullHeight] = useState(0);
  const { containerId, title } = props;

  let chart = null;

  useEffect(() => {
    // We initializ graphy after component is mounted.

    //MUST: init module!
    HC_more(Highcharts);

    // Apply funnel after window is present
    Highcharts.setOptions({
      lang: {
        thousandsSep: ",",
      },
    });
    addFunnel(Highcharts);

    // draw
    makeViz();

    // clearnup when unmount
    return () => {
      if (isNull(chart)) return;
      chart.destroy();
    };
  });

  const _normalize = data => {
    // Some may have 0s or all 0s.
    const tmp = filter(data, d => d !== 0);

    // if all 0s
    if (tmp.length === 0) return data;

    const base = tmp[0];
    const normalized = map(data, d => {
      if (d === 0) return 0;
      if (d === base) return 1;

      // both positive or negative, just straightforward normalizing
      // to reference as 1.
      if ((d > 0 && base > 0) || (d < 0 && base < 0)) {
        return d / Math.abs(base);
      } else {
        return (d - base) / Math.abs(base);
      }
    });

    return normalized;
  };

  const makeViz = () => {
    const {
      type,
      title,
      footer,
      categories,
      xLabel,
      yLabel,
      legendEnabled,
      data,
      normalize,
    } = props;

    // chart data can be normalized for comparison purpose
    let chart_data = data;
    if (normalize) {
      chart_data = map(chart_data, d => {
        let tmp = d;
        tmp.data = _normalize(d.data);
        return tmp;
      });
    }

    // Set chart height dynamically
    const height = Math.max(500, height_step * categories.length);
    setFullHeight(height);

    // Chart options
    const options = {
      chart: {
        type: type,
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        height: height,
        styleMode: true,
        zoomType: "xy",
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
        title: {
          text: xLabel ? xLabel : "",
        },
      },
      yAxis: {
        title: {
          text: yLabel ? yLabel : "",
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
        scatter: {
          marker: {
            radius: 5,
            states: {
              hover: {
                enabled: true,
                lineColor: "rgb(100,100,100)",
              },
            },
          },
          states: {
            hover: {
              marker: {
                enabled: false,
              },
            },
          },
          tooltip: {
            headerFormat: "<b>{series.name}</b><br>",
            pointFormat: "{point.x}, {point.y}",
          },
        },
        bubble: {
          tooltip: {
            useHTML: true,
            pointFormat: "{point.z}",
            followPointer: true,
          },
        },
      },
      legend: {
        enabled: legendEnabled,
      },
      series: chart_data,
    };

    // Render chart
    chart = new Highcharts["Chart"](containerId, options);
  };

  return (
    <figure id={containerId} style={{ minHeight: full_height * 1.05 + "px" }}>
      <figcaption>{title}</figcaption>
    </figure>
  );
}

HighchartGraphBox.propTypes = {
  containerId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  footer: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  legendEnabled: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  normalize: PropTypes.bool,
};
