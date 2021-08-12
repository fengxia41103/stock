import React, { useState, useEffect } from "react";
import { Box, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import { map, filter, reverse, sortBy } from "lodash";
import ColoredNumber from "src/components/common/ColoredNumber";
import StockSymbol from "src/components/stock/StockSymbol";
import ReactECharts from "echarts-for-react";
import LinearProgress from "@material-ui/core/LinearProgress";

export default function DailyRankingBarRaceChart(props) {
  const { stocks, dimension, highlights } = props;
  const dates = reverse([...new Set(map(stocks, s => s.on))]);
  const [on, setOn] = useState(0);
  const [progress, setProgress] = useState(0);

  const update_option = () => {
    let data = filter(stocks, r => r.on === dates[on]);

    data = reverse(sortBy(data, d => d[dimension])).slice(0, 10);

    return {
      grid: {
        top: 10,
        bottom: 30,
        left: 150,
        right: 80,
      },
      dataset: {
        dimensions: [dimension, "symbol"],
        source: data,
      },
      xAxis: {
        max: "dataMax",
        min: 0,
        label: {
          formatter: n => Math.round(n),
        },
      },
      yAxis: {
        type: "category",
        inverse: true,
        //max: 10,
        axisLabel: {
          show: false,
        },
        // animationDuration: 300,
        // animationDurationUpdate: 300,
        // axisLabel: {
        //   show: false,
        //   fontSize: 14,
        // },
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
            x: dimension,
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
      animationDurationUpdate: 1000,
      animationEasing: "linear",
      animationEasingUpdate: "linear",
    };
  };

  useEffect(() => {
    // initialize progress bar
    setProgress(Math.round(((on + 1) / dates.length) * 100));

    // animation chart
    const timer = setTimeout(() => {
      setProgress(Math.round(((on + 1) / dates.length) * 100));

      // this will trigger rendering?
      if (on < dates.length - 1) {
        setOn(on + 1);
      }
    }, 3000);
    return () => clearTimeout(timer);
  });

  return (
    <>
      <Typography variant="h3">{dates[on]}</Typography>
      <LinearProgress variant="determinate" value={progress} />
      <Box mt={3}>
        <ReactECharts
          option={update_option()}
          style={{
            width: "100%",
          }}
        />
      </Box>
    </>
  );
}

DailyRankingBarRaceChart.propTypes = {
  dimension: PropTypes.string.isRequired,
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
