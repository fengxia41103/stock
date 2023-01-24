import { map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import { Grid, Link, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { HighlightedText } from "@fengxia41103/storybook";

const MyColumnHeader = styled(Typography)({
  color: "#d52349",
});

const StockRankingGridColumn = (props) => {
  const { category, stocks, order_by, highlights } = props;

  const ranks = map(stocks, (stock) => {
    const val = stock[order_by];
    const { symbol, stock_id } = stock;
    const mycolor = highlights[symbol];

    return (
      <Grid item key={stock_id} xs>
        <Link href={`/stocks/${stock_id}/historical/price`}>
          <HighlightedText {...{ highlights: mycolor, text: symbol, val }} />
        </Link>
      </Grid>
    );
  });

  return (
    <Grid container direction="column" alignContent="center">
      <Grid item xs>
        <MyColumnHeader>{category}</MyColumnHeader>
      </Grid>
      {ranks}
    </Grid>
  );
};

StockRankingGridColumn.propTypes = {
  category: PropTypes.string.isRequired,
  order_by: PropTypes.string.isRequired,
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      stock_id: PropTypes.number,
      symbol: PropTypes.string,
    }),
  ).isRequired,
  highlights: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default StockRankingGridColumn;
