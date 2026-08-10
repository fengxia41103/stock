import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { maxBy, minBy, reverse } from "lodash";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";

import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button, Grid, Typography } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";

const DailyRankingBarRaceChart = (props) => {
  const { ranks, order_by, highlights, negative } = props;
  const dates = reverse([...new Set(ranks.map((s) => s.category))]);
  const [on, setOn] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pause, setPause] = useState(false);
  const chartRef = useRef(null);

  // set pause bool
  const toggle_pause = () => setPause(!pause);

  // reset index for rerun
  const on_rerun = () => {
    setPause(false);
    setOn(0);
  };

  const getOptions = () => {
    const data = ranks[on].stocks;

    // Generate distinct colors for each bar
    const COLORS = [
      "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981",
      "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
      "#14b8a6", "#f43f5e", "#a855f7", "#0ea5e9", "#22c55e",
    ];

    const categories = data.map((d) => d.symbol);
    const values = data.map((d, i) => ({
      y: d[order_by],
      color: highlights[d.symbol]?.background
        ? `#${highlights[d.symbol].background}`
        : COLORS[i % COLORS.length],
    }));

    return {
      chart: {
        type: "bar",
        backgroundColor: "transparent",
        height: "67%",
        animation: {
          duration: 1000,
          easing: "linear",
        },
      },
      title: { text: undefined },
      xAxis: {
        categories,
        labels: {
          style: { color: "#94a3b8" },
          enabled: !negative,
        },
        lineColor: "#334155",
        reversed: true,
      },
      yAxis: {
        title: { text: null },
        min: Math.floor(minBy(data, (d) => d[order_by])?.[order_by] || 0),
        max: Math.ceil(maxBy(data, (d) => d[order_by])?.[order_by] || 0),
        labels: {
          style: { color: "#94a3b8" },
          formatter: function () {
            return Math.round(this.value);
          },
        },
        gridLineColor: "#334155",
      },
      tooltip: {
        style: { color: "#94a3b8" },
        backgroundColor: "#1e293b",
        borderColor: "#334155",
      },
      legend: { enabled: false },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            format: "{point.category}",
            align: negative ? "right" : "left",
            style: {
              color: "#94a3b8",
              textOutline: "none",
              fontFamily: "monospace",
            },
          },
          animation: {
            duration: 1000,
          },
        },
        series: {
          animation: {
            duration: 1000,
          },
        },
      },
      series: [
        {
          name: order_by,
          data: values,
        },
      ],
      credits: { enabled: false },
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

      // this will trigger rendering
      if (on < dates.length - 1) {
        setOn(on + 1);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [on, dates, pause]);

  return (
    <>
      <LinearProgress variant="determinate" value={progress} />
      <Grid container direction="row" alignItems="center" spacing={2}>
        <Grid item lg={6} sm={6} xs={4}>
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
      <HighchartsReact
        highcharts={Highcharts}
        options={getOptions()}
        ref={chartRef}
        containerProps={{ style: { height: "67vh", width: "100%" } }}
      />
    </>
  );
};

DailyRankingBarRaceChart.propTypes = {
  order_by: PropTypes.string.isRequired,
  ranks: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string,
      stocks: PropTypes.arrayOf(
        PropTypes.shape({
          symbol: PropTypes.string,
          stock_id: PropTypes.number,

          // stock resource uri
          stock: PropTypes.string,
        }),
      ),
    }),
  ).isRequired,
  highlights: PropTypes.node.isRequired,
  negative: PropTypes.bool,
};

export default DailyRankingBarRaceChart;
