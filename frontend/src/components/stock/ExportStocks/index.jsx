import { map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import GetAppIcon from "@mui/icons-material/GetApp";
import { Grid, Link, Typography } from "@mui/material";

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
