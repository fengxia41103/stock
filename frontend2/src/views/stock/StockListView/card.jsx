import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  Box,
  Card,
  CardContent,
  Typography,
  makeStyles,
  Grid,
} from "@material-ui/core";
import { isNull } from "lodash";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import EventBusyIcon from "@material-ui/icons/EventBusy";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
}));

const StockListGroupCard = ({ reporting_date, stocks, ...rest }) => {
  const classes = useStyles();

  return (
    <Box mt={3}>
      <Card {...rest}>
        <CardContent>
          <Typography
            align="left"
            color="textPrimary"
            gutterBottom
            variant="h4"
          >
            {reporting_date ? <EventBusyIcon /> : <CalendarTodayIcon />}
            &nbsp;
            {reporting_date ? reporting_date : "ETF"}
          </Typography>
          <Grid container spacing={3}>
            {stocks.map(symbol => (
              <Grid item key={symbol} lg={2} md={3} xs={4}>
                <Typography align="left" color="textSecondary" variant="body2">
                  {symbol}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

StockListGroupCard.propTypes = {
  stocks: PropTypes.array,
};

export default StockListGroupCard;
