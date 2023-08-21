import clsx from "clsx";
import { map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import { ColoredNumber } from "@fengxia41103/storybook";

import StockSymbol from "@Components/stock/StockSymbol";

const myStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    height: "100%",
  },
}));

const MoverCard = (props) => {
  const { title, subtitle, stocks, value, roundTo } = props;
  const classes = myStyles();

  const entries = map(stocks, (s) => {
    return (
      <ListItem key={s.symbol} divider>
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

  const subHeader = (
    <Typography variant="body2" color="secondary">
      {subtitle}
    </Typography>
  );

  return (
    <Card className={clsx(classes.root, classes.card)}>
      <CardHeader
        title={<Typography variant="h3">{title}</Typography>}
        subheader={subHeader}
      />
      <CardContent>
        {stocks.length ? <List>{entries}</List> : "No stock for this list"}
      </CardContent>
    </Card>
  );
};

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
  roundTo: PropTypes.number,
};

export default MoverCard;
