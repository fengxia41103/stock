import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  makeStyles,
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from "@material-ui/core";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";

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
  const { stocks, index, group_by } = props;
  const classes = useStyles();

  const title =
    group_by === "last_reporting_date" && index === "null" ? "ETF" : index;

  return (
    <Grid item lg={3} sm={6} xs={12}>
      <Card className={clsx(classes.root, classes.card)}>
        <CardContent>
          <Box mb={2}>
            <Grid container justify="space-between" spacing={3}>
              <Grid item>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  By {group_by}
                </Typography>
                <Typography color="textPrimary" variant="h3">
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
            {stocks.map((link, index) => (
              <Grid item key={index} xs={3}>
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
