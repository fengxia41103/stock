import React from "react";
import clsx from "clsx";
import {
  makeStyles,
  Grid,
  Link,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { map } from "lodash";
import ColoredNumber from "src/components/common/ColoredNumber";
import StockSymbol from "src/components/stock/StockSymbol";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    height: "100%",
  },
}));

export default function MoverCard(props) {
  const { title, subtitle, stocks, value, date } = props;
  const classes = useStyles();

  const entries = map(stocks, s => {
    return (
      <ListItem key={s.symbol} divider={true}>
        <Grid container spacing={2}>
          <Grid item xs>
            <ColoredNumber val={s[value]} />
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
        <List>{entries}</List>
      </CardContent>
      <CardActions>
        <Grid container spacing={1} justifyContent="flex-end">
          <Typography variant="body2">on {date}</Typography>
          <Link href={`/trending`}>&rArr;</Link>
        </Grid>
      </CardActions>
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
    })
  ).isRequired,
  value: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
};
