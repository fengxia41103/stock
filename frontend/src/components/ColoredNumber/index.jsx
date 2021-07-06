import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Typography } from "@material-ui/core";
import { map, isNumber } from "lodash";
import clsx from "clsx";
import PropTypes from "prop-types";

// A style sheet
const useStyles = makeStyles(theme => ({
  positive: {
    color: "green",
  },
  negative: {
    color: "#d52349",
  },
  zero: {
    color: "orange",
  },
}));

export default function ColoredNumber(props) {
  const classes = useStyles();
  const { val } = props;

  if (!!!val) {
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
            variant="body2"
            color="textPrimary"
            className={clsx(classes.negative)}
          >
            {val.toFixed(2)}
          </Typography>
        );
      } else if (val === 0) {
        return (
          <Typography
            variant="body2"
            color="textPrimary"
            className={clsx(classes.zero)}
          >
            {val.toFixed(2)}
          </Typography>
        );
      } else {
        return (
          <Typography
            variant="body2"
            color="textPrimary"
            className={clsx(classes.positive)}
          >
            {val.toFixed(2)}
          </Typography>
        );
      }
    } else {
      return (
        <Typography variant="body2" color="textPrimary">
          {val ? val : "Not Available"}
        </Typography>
      );
    }
  };

  return style_me(val);
}

ColoredNumber.propTypes = {
  val: PropTypes.number.isRequired,
};
