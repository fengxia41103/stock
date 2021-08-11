import React, { useState } from "react";
import { map } from "lodash";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Tooltip,
  Link,
} from "@material-ui/core";
import { BarChart, Timeline } from "@material-ui/icons";
import CompareArrowsSharpIcon from "@material-ui/icons/CompareArrowsSharp";
import RankChart from "src/components/common/RankChart";
import StocksPriceChart from "src/components/stock/StocksPriceChart";
import HighlightedText from "src/components/common/HighlightedText";
import { get_today_string, get_last_month_string } from "src/utils/helper.jsx";
import PropTypes from "prop-types";

export default function StockRankingRow(props) {
  const [show_rank_graph, setShowRank] = useState(false);
  const [show_1m_graph, setShow1m] = useState(false);
  const [show_threshold, setShowThreshold] = useState(false);
  const [start] = useState(get_last_month_string());
  const [end] = useState(get_today_string());

  const handle_show_rank_graph = event => setShowRank(!show_rank_graph);
  const handle_show_1m_graph = event => setShow1m(!show_1m_graph);
  const handle_show_threshold = event => setShowThreshold(!show_threshold);

  const { category, ranks, threshold, handle_ratio_change } = props;
  const category_name = category.replace(/_/g, " ");

  // show rank values
  const vals = map(ranks, r => (
    <Grid item key={r.symbol} lg={1} xs={2}>
      <Link href={`/stocks/${r.id}/historical/price`}>
        <HighlightedText text={r.symbol} val={r.val} {...props} />
      </Link>
    </Grid>
  ));

  // show threshold cutoff if any
  let cutoff = null;
  if (!!threshold) {
    cutoff = (
      <TextField
        label="Threshold"
        name={category_name}
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

  const menu_content = (
    <>
      <Tooltip title="View ranks as bar chart">
        <BarChart onClick={handle_show_rank_graph} />
      </Tooltip>
      <Tooltip title="View normalized price of last 30 days">
        <Timeline onClick={handle_show_1m_graph} />
      </Tooltip>
      {threshold ? (
        <CompareArrowsSharpIcon onClick={handle_show_threshold} />
      ) : null}
      {show_threshold ? cutoff : null}
    </>
  );
  return (
    <Grid container alignItems="center" spacing={1}>
      <Grid item lg={2} xs={9}>
        <Typography variant="body1" color="textSecondary">
          {category_name}
        </Typography>
      </Grid>
      <Grid item lg={1} xs={3}>
        {menu_content}
      </Grid>
      {vals}

      <Grid item xs={12}>
        {show_rank_graph ? (
          <Box>
            <RankChart ranks={added_stock_ids} />
          </Box>
        ) : null}
        {show_1m_graph ? (
          <StocksPriceChart {...{ start, end, stocks: stock_ids }} />
        ) : null}
      </Grid>
    </Grid>
  );
}

//   const { category, ranks, threshold, handle_ratio_change } = props;
StockRankingRow.propTypes = {
  category: PropTypes.string.isRequired,
  ranks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      on: PropTypes.string,
      symbol: PropTypes.string,
      val: PropTypes.number,
    })
  ).isRequired,
  threshold: PropTypes.string,
  handle_ratio_change: PropTypes.func,
};
