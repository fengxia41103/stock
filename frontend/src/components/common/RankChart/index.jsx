import { Box, Grid } from "@material-ui/core";
import blueGrey from "@material-ui/core/colors/blueGrey";
import { map, isInteger } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import StockSymbol from "src/components/stock/StockSymbol";

export default function RankChart(props) {
  const { ranks, rank_val_name } = props;
  const line_color = blueGrey[400];

  const max_score = Math.max(
    ...map(ranks, (r) => {
      const val = !rank_val_name ? r.val : r[rank_val_name];
      return val;
    }),
  );

  const the_chart = map(ranks, (r) => {
    let val = !rank_val_name ? r.val : r[rank_val_name];
    if (!isInteger(val)) {
      val = val.toFixed(2);
    }
    const width = (100 * val) / max_score + "%";

    return (
      <Grid key={r.symbol} container spacing={1} alignItems="center">
        <Grid item lg={3} sm={4} xs={5}>
          <StockSymbol
            id={r.stock_id}
            symbol={r.symbol}
            resource_uri={r.stock_resource}
          />
        </Grid>
        <Grid item lg={7} sm={6} xs={5}>
          <Box height="10%" width={width} bgcolor={line_color} marginRight={2}>
            &nbsp;
          </Box>
        </Grid>
        {val}
      </Grid>
    );
  });
  return the_chart;
}

RankChart.propTypes = {
  ranks: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string,
      val: PropTypes.number,
      stock_id: PropTypes.number,
      stock_resource: PropTypes.string,
    }),
  ).isRequired,

  // optional, which is my rank value?
  // default to ".val" if not given
  rank_val_name: PropTypes.string,
};
