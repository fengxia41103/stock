import { map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import { Grid } from "@mui/material";

import StockRankingGridColumn from "@Components/dashboard/StockRankingGridColumn";

const StockRankingGrid = (props) => {
  const { ranks } = props;

  const ranking_in_columns = map(ranks, (r) => {
    return (
      <Grid item key={r.category} sx={{ minWidth: 80 }}>
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
    <Grid
      container
      spacing={1}
      sx={{ overflowX: "auto", flexWrap: "nowrap", pb: 1 }}
    >
      {ranking_in_columns}
    </Grid>
  );
};

StockRankingGrid.propTypes = {
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
};

export default StockRankingGrid;
