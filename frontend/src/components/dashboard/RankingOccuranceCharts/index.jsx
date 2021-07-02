import React from "react";
import { Grid } from "@material-ui/core";
import { map, sortBy, reverse, filter } from "lodash";
import ABDonutChart from "src/components/ABDonutChart";
import PropTypes from "prop-types";

export default function RankingOccuranceCharts(props) {
  const { scores } = props;

  // put the most hit ones first
  const rank_by_on_it_count = reverse(
    sortBy(
      filter(scores, s => s.on_it_count > 0),
      s => s.on_it_count
    )
  );

  // compose A/B charts
  const on_vs_miss_donut_charts = map(rank_by_on_it_count, s => {
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
      <Grid key={s.symbol} item lg={4} sm={6} xs={12}>
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
  scores: PropTypes.shape({
    symbol: PropTypes.string,
    on_it_count: PropTypes.number,
    missing_it_count: PropTypes.number,
  }).isRequired,
};
