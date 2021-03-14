import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  colors,
  makeStyles,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Divider,
  Link,
} from "@material-ui/core";
import { isNull } from "lodash";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import MoneyIcon from "@material-ui/icons/Money";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  avatar: {
    backgroundColor: "#d52349",
    height: 56,
    width: 56,
  },
  card: {
    height: "100%",
  },
}));

function StockListGroupCard(props) {
  const { reporting_date, stocks } = props;
  const classes = useStyles();

  const title = reporting_date === "null" ? "ETF" : reporting_date;
  return (
    <Grid item lg={3} sm={6} xs={12}>
      <Card className={clsx(classes.root, classes.card)}>
        <CardContent>
          <Box mb={2}>
            <Grid container justify="space-between" spacing={3}>
              <Grid item>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Latest Reporting Date
                </Typography>
                <Typography color="info" variant="h3">
                  {title}
                </Typography>
              </Grid>
              <Grid item>
                <Avatar className={classes.avatar}>
                  <CalendarTodayIcon />
                </Avatar>
              </Grid>
            </Grid>
          </Box>
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
