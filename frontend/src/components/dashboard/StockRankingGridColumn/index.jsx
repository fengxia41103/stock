import React from "react";
import { makeStyles, Grid, Link, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import HighlightedText from "src/components/common/HighlightedText";
import clsx from "clsx";
import { map } from "lodash";

const useStyles = makeStyles(theme => ({
  category: {
    color: "#D52349",
  },
}));

export default function StockRankingGridColumn(props) {
  const { category, ranks, order_by, highlights } = props;
  const classes = useStyles();

  const picks = map(ranks, p => {
    const val = p[order_by];
    return (
      <Grid item key={p.stock_id} xs>
        <Link href={`/stocks/${p.stock_id}/historical/price`}>
          <HighlightedText {...{ highlights, text: p.symbol, val: val }} />
        </Link>
      </Grid>
    );
  });

  return (
    <Grid container direction="column" alignContent="center">
      <Grid item xs>
        <Typography className={clsx(classes.category)}>{category}</Typography>
      </Grid>
      {picks}
    </Grid>
  );
}

StockRankingGridColumn.propTypes = {
  category: PropTypes.string.isRequired,
  order_by: PropTypes.string.isRequired,
  ranks: PropTypes.arrayOf(
    PropTypes.shape({
      stock_id: PropTypes.number,
      symbol: PropTypes.string,
    })
  ).isRequired,
  highlights: PropTypes.object.isRequired,
};
