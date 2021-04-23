import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  makeStyles,
  Avatar,
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
} from "@material-ui/core";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import SectorLabel from "src/components/stock/SectorLabel";
import { map } from "lodash";

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

export default function ListStockCard(props) {
  const { stocks, index, group_by, actions } = props;
  const classes = useStyles();

  let title;
  switch (group_by) {
    case "last_reporting_date":
      title = index === "null" ? "ETF" : index;
      break;

    case "sector":
      title = <SectorLabel resource={index} />;
      break;

    default:
      title = index;
      break;
  }

  const footers = map(actions, (action, index) => (
    <Grid key={index} item>
      {action}
    </Grid>
  ));

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
        <CardActions>
          <Grid container spacing={3}>
            {footers}
          </Grid>
        </CardActions>
      </Card>
    </Grid>
  );
}

ListStockCard.propTypes = {
  stocks: PropTypes.array,
};
