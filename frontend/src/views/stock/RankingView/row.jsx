import React, { useState } from "react";
import { map } from "lodash";
import {
  makeStyles,
  Box,
  Grid,
  TextField,
  Typography,
  Tooltip,
  Divider,
} from "@material-ui/core";

import { BarChart, Timeline } from "@material-ui/icons";
import CompareArrowsSharpIcon from "@material-ui/icons/CompareArrowsSharp";
import RankChart from "src/components/RankChart";
import StocksPriceChart from "src/components/stock/StocksPriceChart";
import HighlightedText from "src/components/HighlightedText";
import { get_today_string, get_last_month_string } from "src/utils/helper.jsx";

const useStyles = makeStyles(theme => ({
  category: {
    color: "#3f51b5",
  },
}));

export default function Row(props) {
  const [show_rank_graph, setShowRank] = useState(false);
  const [show_1m_graph, setShow1m] = useState(false);
  const [show_threshold, setShowThreshold] = useState(false);
  const [start] = useState(get_last_month_string());
  const [end] = useState(get_today_string());
  const classes = useStyles();

  const handle_show_rank_graph = event => setShowRank(!show_rank_graph);
  const handle_show_1m_graph = event => setShow1m(!show_1m_graph);
  const handle_show_threshold = event => setShowThreshold(!show_threshold);

  const { category, ranks, threshold, handle_ratio_change } = props;
  const category_name = category.replace(/_/g, " ");

  // show rank values
  const vals = map(ranks, r => (
    <Grid key={r.symbol} item xs>
      <HighlightedText text={r.symbol} val={r.val} {...props} />
    </Grid>
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

  // stock ids
  const stock_ids = map(ranks, r => r.id);
  const added_stock_ids = map(ranks, r => {
    return { stock_id: r.id, ...r };
  });

  return (
    <Box mt={1}>
      <Grid container alignItems="center" spacing={1}>
        <Grid item lg={2} sm={6} xs>
          <Typography variant="body1" className={classes.category}>
            {category_name}
          </Typography>
        </Grid>
        <Grid item lg={1} xs>
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
          <Grid container spacing={1}>
            {vals}
          </Grid>
        </Grid>
      </Grid>

      <Box mt={1} mb={2}>
        {show_rank_graph ? <RankChart ranks={added_stock_ids} /> : null}
        {show_1m_graph ? (
          <StocksPriceChart {...{ start, end, stocks: stock_ids }} />
        ) : null}
      </Box>
      <Divider />
    </Box>
  );
}
