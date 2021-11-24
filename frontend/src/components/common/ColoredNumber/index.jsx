import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import clsx from "clsx";
import { isNumber } from "lodash";
import PropTypes from "prop-types";
import React from "react";

// A style sheet
const useStyles = makeStyles((theme) => ({
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

  if (!val) {
    return (
      <Typography variant="body2" color="error" display="inline">
        n/a
      </Typography>
    );
  }

  const style_me = (me) => {
    let color = null;
    let tmp = me;

    if (isNumber(me)) {
      tmp = isNumber(roundTo) ? me.toFixed(roundTo) : me.toFixed(2);
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
        {unit ? unit : null}
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
