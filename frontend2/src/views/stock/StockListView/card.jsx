import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  makeStyles,
  Grid,
  Divider,
  Link,
} from "@material-ui/core";
import { isNull } from "lodash";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import EventBusyIcon from "@material-ui/icons/EventBusy";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    height: "100%",
  },
}));

function StockListGroupCard(props) {
  const { reporting_date, stocks } = props;
  const classes = useStyles();

  const icon =
    reporting_date === "null" ? <EventBusyIcon /> : <CalendarTodayIcon />;
  const title = reporting_date === "null" ? "ETF" : reporting_date;
  return (
    <Grid item lg={3} sm={6} xs={12}>
      <Card className={clsx(classes.root, classes.card)}>
        <CardHeader title={title} />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {stocks.map(link => (
              <Grid item key={link} xs>
                {link}
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
}

StockListGroupCard.propTypes = {
  stocks: PropTypes.array,
};

export default StockListGroupCard;
