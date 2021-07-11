import React from "react";
import { map, isInteger } from "lodash";
import PropTypes from "prop-types";
import { Box, Grid } from "@material-ui/core";
import pink from "@material-ui/core/colors/pink";
import StockSymbol from "src/components/stock/StockSymbol";

export default function RankChart(props) {
  const { ranks, rank_val_name } = props;
  const line_color = pink[400];

  const max_score = Math.max(
    ...map(ranks, r => {
      const val = !!!rank_val_name ? r.val : r[rank_val_name];
      return val;
    })
  );

  const the_chart = map(ranks, r => {
    let val = !!!rank_val_name ? r.val : r[rank_val_name];
    if (!isInteger(val)) {
      val = val.toFixed(2);
    }
    const width = (100 * val) / max_score + "%";

    return (
      <Grid key={r.symbol} container spacing={1} alignItems="center">
        <Grid item lg={2} sm={2} xs={3}>
          <StockSymbol id={r.stock_id} symbol={r.symbol} />
        </Grid>
        <Grid item lg={8} sm={8} xs={7}>
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
    })
  ).isRequired,

  // optional, which is my rank value?
  // default to ".val" if not given
  rank_val_name: PropTypes.string,
};
