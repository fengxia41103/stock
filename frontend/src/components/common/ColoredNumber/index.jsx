import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Box, Typography } from "@material-ui/core";
import { isNumber, isUndefined } from "lodash";
import clsx from "clsx";
import PropTypes from "prop-types";

// A style sheet
const useStyles = makeStyles(theme => ({
  positive: {
    color: "#137333",
  },
  negative: {
    color: "#a50e0e",
  },
  zero: {
    color: "orange",
  },
}));

export default function ColoredNumber(props) {
  const classes = useStyles();
  const { val, unit, roundTo } = props;

  if (!!!val) {
    return (
      <Typography variant="body2" color="error" display="inline">
        n/a
      </Typography>
    );
  }

  const style_me = val => {
    let color = null;
    let tmp = val;

    if (isNumber(val)) {
      tmp = !isUndefined(roundTo) ? val.toFixed(roundTo) : val.toFixed(2);
      if (val < 0) {
        color = clsx(classes.negative);
      } else if (val === 0) {
        color = clsx(classes.zero);
      } else {
        color = clsx(classes.positive);
      }
    }

    return (
      <Box className={color} display="inline">
        {tmp}
        {!!unit ? unit : null}
      </Box>
    );
  };

  return style_me(val);
}

ColoredNumber.propTypes = {
  val: PropTypes.number,
  unit: PropTypes.string,
  roundTo: PropTypes.number,
};
