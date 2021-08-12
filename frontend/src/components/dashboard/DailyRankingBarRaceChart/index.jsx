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
import { map, filter, reverse, sortBy } from "lodash";
import ColoredNumber from "src/components/common/ColoredNumber";
import StockSymbol from "src/components/stock/StockSymbol";
import ReactECharts from "echarts-for-react";
import LinearProgress from "@material-ui/core/LinearProgress";
import RefreshIcon from "@material-ui/icons/Refresh";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";

export default function DailyRankingBarRaceChart(props) {
  const { stocks, value, highlights } = props;
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

    data = reverse(sortBy(data, d => d[value])).slice(0, 10);

    return {
      dataset: {
        dimensions: [value, "symbol"],
        source: data,
      },
      xAxis: {
        max: "dataMax",
        //min: 0,
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
            x: value,
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
      <Box mt={1} paddingRight={1}>
        <ReactECharts
          option={update_option()}
          style={{
            height: "67vh",
            width: "100%",
          }}
        />
      </Box>
    </>
  );
}

DailyRankingBarRaceChart.propTypes = {
  value: PropTypes.string.isRequired,
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
  follow: PropTypes.string,
};
