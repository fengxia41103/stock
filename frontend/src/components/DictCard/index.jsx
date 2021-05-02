import React from "react";
import { makeStyles } from "@material-ui/styles";
import { map, isEmpty, isNumber, isUndefined, sortBy } from "lodash";

import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardHeader,
} from "@material-ui/core";
import PropTypes from "prop-types";

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

export default function DictCard(props) {
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
      } else if (val === 0) {
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

  const cards = map(interests, (description, key) => {
    let val = data[key];
    return (
      <Grid item key={key} lg={4} sm={6} xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant="body2">{description}</Typography>}
          />
          <CardContent>{style_me(val)}</CardContent>
        </Card>
      </Grid>
    );
  });

  return (
    <Grid container spacing={1}>
      {cards}
    </Grid>
  );
}

DictCard.propTypes = {
  interests: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};
