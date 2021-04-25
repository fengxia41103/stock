import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid } from "@material-ui/core";
import { isNil } from "lodash";

function Cell(props) {
  const [hide, setHide] = useState(true);

  const handle_hide_toggle = event => setHide(!hide);

  const { highlights, text, val } = props;

  // assing a special color to text I'm interested in
  let bk_color = "",
    font_color = "";
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
    <Grid item xs>
      <Typography
        className={classes.root}
        onMouseOver={handle_hide_toggle}
        onMouseLeave={handle_hide_toggle}
        align="center"
      >
        {hide ? text : null}
        {!hide ? val.toFixed(2) : null}
      </Typography>
    </Grid>
  );
}

export default Cell;
