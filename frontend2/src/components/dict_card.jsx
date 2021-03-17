import React from "react";
import { makeStyles } from "@material-ui/styles";
import classNames from "classnames";
import { map, isEmpty, isNumber } from "lodash";

import { Box, Grid, Card, CardContent, Typography } from "@material-ui/core";

// A style sheet
const useStyles = makeStyles({
  number: {
    positive: {
      color: "green",
    },
    negative: {
      color: "#d52349",
    },
    zero: {
      color: "orange",
    },
  },
});

function DictCard(props) {
  const classes = useStyles();
  const { data, interests } = props;

  if (isEmpty(data)) {
    return (
      <Typography variant="body2" color="error">
        No data found.
      </Typography>
    );
  }

  const style_me = val => {
    if (isNumber(val)) {
      if (val < 0) {
        return (
          <Typography
            variant="h3"
            color="textPrimary"
            className={classes.number.negative}
          >
            {val.toFixed(2)}
          </Typography>
        );
      } else if (val == 0) {
        return (
          <Typography
            variant="h3"
            color="textPrimary"
            className={classes.number.zero}
          >
            {val.toFixed(2)}
          </Typography>
        );
      } else {
        return (
          <Typography
            variant="h3"
            color="textPrimary"
            className={classes.number.positive}
          >
            {val.toFixed(2)}
          </Typography>
        );
      }
    } else {
      return (
        <Typography variant="h3" color="textPrimary">
          {val ? val : "Not Available"}
        </Typography>
      );
    }
  };

  const cards = Object.entries(interests).map(([key, description]) => {
    let val = data[key];
    let decor = null;
    return (
      <Grid item key={key} lg={3} sm={6} xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {description}
            </Typography>
            {style_me(val)}
          </CardContent>
        </Card>
      </Grid>
    );
  });

  return (
    <Grid container spacing={3}>
      {cards}
    </Grid>
  );
}

export default DictCard;
