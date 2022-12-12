import { map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import { Grid, Link, Typography } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";

export default function ExportStocks(props) {
  const { stocks } = props;
  const symbols = map(stocks, (s) => s.symbol);

  return (
    <Link
      href={`data:text/text;charset=utf-8,${encodeURIComponent(
        symbols.join(","),
      )}`}
      download="stocks.txt"
    >
      <Grid container spacing={1} direction="row" alignItems="center">
        <GetAppIcon />
        <Typography variant="body2">Export Stocks</Typography>
      </Grid>
    </Link>
  );
}

ExportStocks.propTypes = {
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string,
    }),
  ).isRequired,
};
