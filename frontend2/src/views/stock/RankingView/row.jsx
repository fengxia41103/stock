import React, { useState } from "react";
import { map } from "lodash";
import Cell from "./cell.jsx";
import {
  makeStyles,
  Box,
  Grid,
  TextField,
  Typography,
  Tooltip,
} from "@material-ui/core";

import { BarChart, Timeline } from "@material-ui/icons";
import CompareArrowsSharpIcon from "@material-ui/icons/CompareArrowsSharp";
import RankChart from "./rank_chart.jsx";
import PriceChart from "./price_chart.jsx";

const useStyles = makeStyles(theme => ({
  category: {
    color: "#3f51b5",
  },
}));

function Row(props) {
  const [show_rank_graph, setShowRank] = useState(false);
  const [show_1m_graph, setShow1m] = useState(false);
  const [show_threshold, setShowThreshold] = useState(false);
  const classes = useStyles();

  const handle_show_rank_graph = event => setShowRank(!show_rank_graph);
  const handle_show_1m_graph = event => setShow1m(!show_1m_graph);
  const handle_show_threshold = event => setShowThreshold(!show_threshold);

  const { category, ranks, threshold, handle_ratio_change } = props;
  const category_name = category.replace(/_/g, " ");

  // show rank values
  const vals = map(ranks, r => (
    <Cell key={r.symbol} text={r.symbol} val={r.val} {...props} />
  ));

  // show threshold cutoff if any
  let cutoff = null;
  if (threshold) {
    cutoff = (
      <TextField
        label="Threshold"
        value={threshold}
        onChange={handle_ratio_change}
        fullWidth={true}
      />
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item lg={2} sm={6} xs={12}>
          <Typography variant="body1" className={classes.category}>
            {category_name}
          </Typography>
        </Grid>
        <Grid item lg={1} sm={6} xs={12}>
          <Tooltip title="View ranks as bar chart">
            <BarChart onClick={handle_show_rank_graph} />
          </Tooltip>

          <Tooltip title="View normalized price of last 30 days">
            <Timeline onClick={handle_show_1m_graph} />
          </Tooltip>
          {threshold ? (
            <CompareArrowsSharpIcon onClick={handle_show_threshold} />
          ) : null}
          {show_threshold ? <Box mt={3}>{cutoff}</Box> : null}
        </Grid>
        <Grid item lg={9} sm={12} xs={12}>
          <Box>
            <Grid container spacing={1}>
              {vals}
            </Grid>
          </Box>

          {show_rank_graph ? (
            <Box mt={3}>
              <RankChart {...props} />
            </Box>
          ) : null}
          {show_1m_graph ? (
            <Box mt={3}>
              <PriceChart {...props} />
            </Box>
          ) : null}
        </Grid>
      </Grid>
    </Box>
  );
}

export default Row;
