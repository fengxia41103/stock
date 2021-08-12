import React, { useState, useEffect } from "react";
import { Box, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import { map, filter, reverse, sortBy } from "lodash";
import ColoredNumber from "src/components/common/ColoredNumber";
import StockSymbol from "src/components/stock/StockSymbol";
import ReactECharts from "echarts-for-react";

export default function DailyRankingBarRaceChart(props) {
  const { stocks, follow, highlights } = props;
  const dates = reverse([...new Set(map(stocks, s => s.on))]);
  const [on, setOn] = useState(0);

  let option = {};
  const update_option = () => {
    let data = filter(stocks, r => r.on === dates[on]);

    let val = null;

    // determine data dimension
    switch (follow) {
      case "gainer":
      case "loser":
        val = "gain";
        break;
      case "volume":
        val = "vol_over_share_outstanding";
        break;
      case "volatility":
        val = "volatility";
        break;

      case "last lower":
        val = "last_lower";
        break;
      case "next better":
        val = "next_better";
        break;

      default:
        val = "gain";
        break;
    }
    data = reverse(sortBy(data, d => d[val]));

    return {
      grid: {
        top: 10,
        bottom: 30,
        left: 150,
        right: 80,
      },
      dataset: {
        dimensions: [val, "symbol"],
        source: data,
      },
      xAxis: {
        max: "dataMax",
        label: {
          formatter: n => Math.round(n),
        },
      },
      yAxis: {
        type: "category",
        inverse: true,
        //max: 10,
        animationDuration: 300,
        animationDurationUpdate: 300,
        axisLabel: {
          show: false,
          fontSize: 14,
        },
      },
      series: [
        {
          seriesLayoutBy: "column",
          type: "bar",
          itemStyle: {
            color: param => {
              const symbol = param.value["symbol"];
              return "#" + highlights[symbol]["background"] || "#5470c6";
            },
          },
          encode: {
            x: val,
            y: "symbol",
          },
          label: {
            show: true,
            valueAnimation: true,
            fontFamily: "monospace",
            formatter: "{b}",
          },
        },
      ],
      // Disable init animation.
      animationDuration: 0,
      animationDurationUpdate: 2000,
      animationEasing: "linear",
      animationEasingUpdate: "linear",
      graphic: {
        elements: [
          {
            type: "text",
            right: 50,
            bottom: 0,
            style: {
              text: dates[on],
              font: "bolder 40px monospace",
              fill: "rgba(100, 100, 100, 0.25)",
            },
            z: 100,
          },
        ],
      },
    };
  };

  useEffect(() => {
    // initialize chart
    option = update_option();

    // animation chart
    const timer = setTimeout(() => {
      const on_date = dates[on];
      option = update_option();

      // this will trigger rendering?
      if (on < dates.length - 1) {
        setOn(on + 1);
      }
    }, 3000);
    return () => clearTimeout(timer);
  });

  return (
    <ReactECharts
      option={update_option()}
      style={{
        height: `${(stocks.length / dates.length) * 20}px`,
        width: "100%",
      }}
    />
  );
}

DailyRankingBarRaceChart.propTypes = {
  follow: PropTypes.string.isRequired,
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string,
      gain: PropTypes.number,
      volatility: PropTypes.number,
      vol_over_share_outstanding: PropTypes.number,
      last_lower: PropTypes.number,
      next_better: PropTypes.number,
    })
  ).isRequired,
  highlights: PropTypes.object,
};
