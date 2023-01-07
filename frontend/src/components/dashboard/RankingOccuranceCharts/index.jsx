import { ABDonutChart } from "@fengxia41103/storybook";
import { Grid } from "@mui/material";
import { isEmpty, map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

export default function RankingOccuranceCharts(props) {
  const { scores } = props;

  if (isEmpty(scores)) {
    return "No one matches this condition.";
  }

  // compose A/B charts
  const on_vs_miss_donut_charts = map(scores, (s) => {
    const chart_data = {
      name: s.symbol,
      A: {
        label: "In",
        val: s.on_it_count,
      },
      B: {
        label: "Out",
        val: s.missing_it_count,
      },
    };

    return (
      <Grid key={s.symbol} item lg={4} sm={4} xs={12}>
        <ABDonutChart data={chart_data} subheader="Occurance in the TOP list" />
      </Grid>
    );
  });

  return (
    <Grid container spacing={1}>
      {on_vs_miss_donut_charts}
    </Grid>
  );
}

RankingOccuranceCharts.propTypes = {
  scores: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string,
      on_it_count: PropTypes.number,
      missing_it_count: PropTypes.number,
    }),
  ).isRequired,
};
