import React, { useState, useEffect } from "react";
import { Box, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import { map, filter, clone } from "lodash";
import ColoredNumber from "src/components/common/ColoredNumber";
import StockSymbol from "src/components/stock/StockSymbol";
import ReactECharts from "echarts-for-react";

export default function DailyRankingBarRaceChart(props) {
  const { ranks, follow, highlights } = props;
  const dates = [...new Set(map(ranks, s => s.on))];
  const [on, setOn] = useState(0);
  let option = {};
  const update_option = () => {
    const data = filter(ranks, r => r.on === dates[on])[0].picks;
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

    return {
      grid: {
        top: 10,
        bottom: 30,
        left: 150,
        right: 80,
      },
      xAxis: {
        max: "dataMax",
        label: {
          formatter: n => Math.round(n),
        },
      },
      dataset: {
        dimensions: [val, "symbol"],
        source: data,
      },
      yAxis: {
        type: "category",
        inverse: true,
        max: 10,
        axisLabel: {
          show: true,
          textStyle: {
            fontSize: 14,
          },
        },
        animationDuration: 300,
        animationDurationUpdate: 300,
      },
      series: [
        {
          realtimeSort: true,
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
            precision: 1,
            position: "right",
            valueAnimation: true,
            fontFamily: "monospace",
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
            right: 160,
            bottom: 60,
            style: {
              text: dates[on],
              font: "bolder 80px monospace",
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
      console.log(on_date);
      option = update_option();

      // this will trigger rendering?
      if (on < dates.length - 1) {
        setOn(on + 1);
      }
    }, 3000);
    return () => clearTimeout(timer);
  });

  return <ReactECharts option={update_option()} />;
}

DailyRankingBarRaceChart.propTypes = {
  follow: PropTypes.string.isRequired,
  ranks: PropTypes.arrayOf(
    PropTypes.shape({
      on: PropTypes.string,
      picks: PropTypes.arrayOf(
        PropTypes.shape({
          symbol: PropTypes.string,
          gain: PropTypes.number,
          volatility: PropTypes.number,
          vol_over_share_outstanding: PropTypes.number,
          last_lower: PropTypes.number,
          next_better: PropTypes.number,
        })
      ),
    })
  ).isRequired,
  highlights: PropTypes.object,
};
