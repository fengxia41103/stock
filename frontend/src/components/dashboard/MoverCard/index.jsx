import {
  makeStyles,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import clsx from "clsx";
import { map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import ColoredNumber from "src/components/common/ColoredNumber";
import StockSymbol from "src/components/stock/StockSymbol";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    height: "100%",
  },
}));

export default function MoverCard(props) {
  const { title, subtitle, stocks, value, roundTo } = props;
  const classes = useStyles();

  const entries = map(stocks, (s) => {
    return (
      <ListItem key={s.symbol} divider={true}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <ColoredNumber {...{ val: s[value], roundTo }} />
          </Grid>
          <Grid item xs>
            <StockSymbol
              id={s.stock_id}
              symbol={s.symbol}
              resource_uri={s.stock}
            />
          </Grid>
        </Grid>
      </ListItem>
    );
  });

  return (
    <Card className={clsx(classes.root, classes.card)}>
      <CardHeader
        title={<Typography variant="h3">{title}</Typography>}
        subheader={
          <Typography variant="body2" color="secondary">
            {subtitle}
          </Typography>
        }
      />
      <CardContent>
        {stocks.length ? <List>{entries}</List> : "No stock for this list"}
      </CardContent>
    </Card>
  );
}

MoverCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      stock_id: PropTypes.number,
      symbol: PropTypes.string,

      // stock's own resource uri
      stock: PropTypes.string,
    }),
  ).isRequired,
  value: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  roundTo: PropTypes.number,
};
