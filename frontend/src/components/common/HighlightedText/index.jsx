import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { isNil } from "lodash";
import PropTypes from "prop-types";
import React, { useState } from "react";

export default function HighlightedText(props) {
  const [hide, setHide] = useState(true);

  const handle_hide_toggle = (event) => setHide(!hide);

  const { highlights, text, val } = props;

  // assing a special color to text I'm interested in
  let bk_color = "";
  let font_color = "";
  if (!isNil(highlights[text])) {
    bk_color = "#" + highlights[text].background;
    font_color = highlights[text].font;
  }

  const useStyles = makeStyles({
    root: {
      backgroundColor: bk_color,
      color: font_color,
    },
  });
  const classes = useStyles();

  return (
    <Typography
      className={classes.root}
      onMouseOver={handle_hide_toggle}
      onMouseLeave={handle_hide_toggle}
      align="center"
    >
      {hide ? text : null}
      {!hide ? val.toFixed(2) : null}
    </Typography>
  );
}

HighlightedText.propTypes = {
  highlights: PropTypes.objectOf(
    PropTypes.shape({
      background: PropTypes.string,
      font: PropTypes.string,
    }),
  ).isRequired,
  text: PropTypes.string.isRequired,
  val: PropTypes.number.isRequired,
};
