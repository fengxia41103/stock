import { filter, forEach, map, reverse, sortBy } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { RankChart } from "@fengxia41103/storybook";

import RankingOccuranceCharts from "@Components/dashboard/RankingOccuranceCharts";
import StocksPriceChart from "@Components/stock/StocksPriceChart";

const MyCard = styled(Card)({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

const RankingScores = (props) => {
  const { stocks, ranks, start, end } = props;

  // compute a score score is 1-10, each symbol computes a score by
  // adding its score of a day when it's on the ranking chart. So,
  // the highest score indicates this stock shows up more, or shoots
  // high.
  const symbols = [...new Set(map(stocks, (s) => s.symbol))];
  const symbol_id_lookup = new Map([
    ...new Set(map(stocks, (s) => [s.symbol, s.stock_id])),
  ]);
  const symbol_resource_lookup = new Map([
    ...new Set(map(stocks, (s) => [s.symbol, s.stock])),
  ]);

  const scores = [];

  forEach(symbols, (symbol) => {
    let positive_score = 0;
    let missing_the_list_count = 0;
    let on_the_list_count = 0;

    forEach(ranks, (r) => {
      // max score is the length of the ranks. If you only have two
      // symbols on the list, then top score will be 2; if you have
      // top 10, then it will be 10, and so on.
      const picked_symbols = map(r.stocks, (p) => p.symbol);
      const max_score = picked_symbols.length;

      const index = picked_symbols.indexOf(symbol);
      if (index > -1) {
        on_the_list_count += 1;
        positive_score += max_score - index;
      } else {
        // if index == -1, the symbol isn't on the list.
        // so we substract one point as this effect.
        missing_the_list_count += 1;
      }
    });

    scores.push({
      symbol,
      stock_id: symbol_id_lookup.get(symbol),
      stock_resource: symbol_resource_lookup.get(symbol),
      total: positive_score - missing_the_list_count,
      positive: positive_score,
      on_it_count: on_the_list_count,
      missing_it_count: missing_the_list_count,
    });
  });

  // - exclude 0 scores
  // - sort in descending order
  const rank_by_score_descending = reverse(
    sortBy(
      filter(scores, (s) => s.total > 0),
      (s) => s.total,
    ),
  );

  // get price charts
  // we only want the most active ones, so at least has a score
  // greater than the number of days I'm looking at.
  const my_interests = map(
    rank_by_score_descending.slice(0, 5),
    (s) => s.stock_id,
  );

  // put the most hit ones first
  const rank_by_on_it_count = reverse(
    sortBy(
      filter(scores, (s) => s.on_it_count > 0),
      (s) => s.on_it_count,
    ),
  );

  // occurance above 50%
  const rank_upper_50 = filter(
    rank_by_on_it_count,
    (r) => r.on_it_count >= r.missing_it_count,
  );

  // occurance below 50%
  const rank_lower_50 = filter(
    rank_by_on_it_count,
    (r) => r.on_it_count < r.missing_it_count,
  );

  return (
    <Box mt={1}>
      <Grid container spacing={1}>
        <Grid item lg={6} sm={6} xs={12}>
          <MyCard>
            <CardHeader
              title={<Typography variant="h3">Overall Scores</Typography>}
              subheader={
                <Typography variant="body2">
                  {start} to {end}
                </Typography>
              }
            />
            <CardContent>
              <Typography variant="body2">
                Score measures both the occurance of a symbol on the TOP list,
                and its relative ranking each time. If it&apos;s ranked #1, and
                there are 10 symbols on the list, it gets a (10-0)=10, then the
                2nd place would get 9, and so on.
              </Typography>
              <Box mt={3}>
                <RankChart
                  ranks={rank_by_score_descending}
                  rank_val_name="total"
                />
              </Box>
            </CardContent>
          </MyCard>
        </Grid>
        <Grid item lg={6} sm={6} xs={12}>
          <MyCard>
            <CardHeader
              title={
                <Typography variant="h3">Top Player Closing Prices</Typography>
              }
              subheader={
                <Typography variant="body2">
                  {start} to {end}
                </Typography>
              }
            />
            <CardContent>
              <Typography variant="body2">
                Closing price of top <strong>{my_interests.length}</strong>{" "}
                stocks out of <strong>{rank_by_score_descending.length}</strong>{" "}
                made to the ranking list.
              </Typography>
              <Box mt={3}>
                <StocksPriceChart
                  key={my_interests}
                  {...{ start, end, stocks: my_interests }}
                />
              </Box>
            </CardContent>
          </MyCard>
        </Grid>
      </Grid>
      <Box mt={1}>
        <Card>
          <CardHeader
            title={
              <Typography variant="h3">List of &ge;50% Occurances</Typography>
            }
            subheader={
              <Typography variant="body2">
                {start} to {end}
              </Typography>
            }
          />
          <CardContent>
            <RankingOccuranceCharts {...{ scores: rank_upper_50 }} />
          </CardContent>
        </Card>
      </Box>
      <Box mt={1}>
        <Card>
          <CardHeader
            title={
              <Typography variant="h3">List of &lt;50% Occurances</Typography>
            }
            subheader={
              <Typography variant="body2">
                {start} to {end}
              </Typography>
            }
          />
          <CardContent>
            <RankingOccuranceCharts {...{ scores: rank_lower_50 }} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

RankingScores.propTypes = {
  stocks: PropTypes.arrayOf(PropTypes.node).isRequired,
  ranks: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string,
      stocks: PropTypes.arrayOf(
        PropTypes.shape({
          symbol: PropTypes.string,
          stock_id: PropTypes.number,

          // stock resource uri
          stock: PropTypes.string,
        }),
      ),
    }),
  ).isRequired,
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
};

export default RankingScores;
