import { map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import { Grid } from "@material-ui/core";

import StockRankingGridColumn from "src/components/dashboard/StockRankingGridColumn";

export default function StockRankingGrid(props) {
  const { ranks } = props;

  const ranking_in_columns = map(ranks, (r) => {
    return (
      <Grid item key={r.category} lg={1} sm={2} xs={2}>
        <StockRankingGridColumn
          {...{
            category: r.category,
            stocks: r.stocks,
            ...props,
          }}
        />
      </Grid>
    );
  });

  return (
    <Grid container spacing={1}>
      {ranking_in_columns}
    </Grid>
  );
}

StockRankingGrid.propTypes = {
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
  highlights: PropTypes.object.isRequired,
};
