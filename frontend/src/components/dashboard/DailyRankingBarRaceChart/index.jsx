import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Switch,
  Grid,
  FormGroup,
  FormControlLabel,
  Button,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { map, filter, reverse, sortBy, minBy, maxBy } from "lodash";
import ColoredNumber from "src/components/common/ColoredNumber";
import StockSymbol from "src/components/stock/StockSymbol";
import ReactECharts from "echarts-for-react";
import LinearProgress from "@material-ui/core/LinearProgress";
import RefreshIcon from "@material-ui/icons/Refresh";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";

export default function DailyRankingBarRaceChart(props) {
  const { stocks, order_by, highlights, negative, top } = props;
  const dates = reverse([...new Set(map(stocks, s => s.on))]);
  const [on, setOn] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pause, setPause] = useState(false);

  // set pause bool
  const toggle_pause = event => setPause(!pause);

  // reset index for rerun
  const on_rerun = event => {
    setPause(false);
    setOn(0);
  };

  const update_option = () => {
    let data = filter(stocks, r => r.on === dates[on]);

    // sort values, low to high
    data = sortBy(data, d => d[order_by]);

    if (!!negative) {
      // for negative values only
      data = filter(data, d => d[order_by] < 0);
    } else {
      // for positive ranking, we list high->low
      data = reverse(data);
    }

    // if truncate
    data = !!top ? data.slice(0, top) : data;

    // echart options
    return {
      dataset: {
        dimensions: [order_by, "symbol"],
        source: data,
      },
      xAxis: {
        max: Math.ceil(maxBy(data, d => d[order_by])),
        min: Math.floor(minBy(data, d => d[order_by])),
        label: {
          formatter: n => Math.round(n),
        },
      },
      yAxis: {
        type: "category",
        inverse: true,
        axisLabel: {
          show: false,
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
            x: order_by,
            y: "symbol",
          },
          label: {
            show: true,
            valueAnimation: true,
            fontFamily: "monospace",
            formatter: "{b}",
            position: !!negative ? "left" : "right",
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
      // if I'm on pause, do nothing
      if (pause) return;

      setProgress(Math.round(((on + 1) / dates.length) * 100));

      // this will trigger rendering?
      if (on < dates.length - 1) {
        setOn(on + 1);
      }
    }, 2000);
    return () => clearTimeout(timer);
  });

  return (
    <>
      <LinearProgress variant="determinate" value={progress} />
      <Grid container direction="row" alignItems="center" spacing={2}>
        <Grid item lg={8} sm={6} xs={4}>
          <Typography variant="h3">{dates[on]}</Typography>
        </Grid>
        <Grid item xs>
          {pause ? (
            <PlayCircleFilledIcon onClick={toggle_pause} />
          ) : (
            <PauseCircleFilledIcon onClick={toggle_pause} />
          )}
        </Grid>
        <Grid item xs>
          <Button color="secondary" onClick={on_rerun}>
            <RefreshIcon />
            Re-run
          </Button>
        </Grid>
      </Grid>
      <ReactECharts
        option={update_option()}
        style={{
          height: "67vh",
          width: "100%",
        }}
      />
    </>
  );
}

DailyRankingBarRaceChart.propTypes = {
  order_by: PropTypes.string.isRequired,
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
  highlights: PropTypes.object.isRequired,
  negative: PropTypes.bool,
  top: PropTypes.number,
};
