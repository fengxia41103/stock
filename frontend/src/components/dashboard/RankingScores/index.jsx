import React from "react";
import {
  makeStyles,
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
} from "@material-ui/core";
import { map, sortBy, reverse, filter, forEach } from "lodash";
import clsx from "clsx";
import ABDonutChart from "src/components/ABDonutChart";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "src/components/Highchart";

const useStyles = makeStyles(theme => ({
  diary: {
    color: "#D52349",
  },
}));

export default function RankingScores(props) {
  const { stocks, ranks } = props;

  // compute a score score is 1-10, each symbol computes a score by
  // adding its score of a day when it's on the ranking chart. So,
  // the highest score indicates this stock shows up more, or shoots
  // high.
  const symbols = [...new Set(map(stocks, s => s.symbol))];
  let scores = [];

  forEach(symbols, symbol => {
    let positive_score = 0;
    let missing_the_list_count = 0;
    let on_the_list_count = 0;

    forEach(ranks, r => {
      // max score is the length of the picks. If you only have two
      // symbols on the list, then top score will be 2; if you have
      // top 10, then it will be 10, and so on.
      const picked_symbols = map(r.picks, p => p.symbol);
      const max_score = picked_symbols.length;

      let index = picked_symbols.indexOf(symbol);
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
      symbol: symbol,
      total: positive_score - missing_the_list_count,
      positive: positive_score,
      on_it_count: on_the_list_count,
      missing_it_count: missing_the_list_count,
    });
  });

  // - exclude 0 scores
  // - sort in descending order
  const rank_by_score = reverse(
    sortBy(
      filter(scores, s => s.total > 0),
      s => s.total
    )
  );

  const rank_by_on_it_count = reverse(
    sortBy(
      filter(scores, s => s.on_it_count > 0),
      s => s.on_it_count
    )
  );
  const on_vs_miss_donut_charts = map(rank_by_on_it_count, s => {
    const chart_data = {
      name: s.symbol,
      positive: s.on_it_count,
      negative: s.missing_it_count,
    };

    return (
      <Grid key={s.symbol} item lg={4} sm={6} xs={12}>
        <ABDonutChart data={chart_data} />
      </Grid>
    );
  });

  const containerId = randomId();
  const categories = map(rank_by_score, r => r.symbol);
  const chart_data = [
    { name: "score", data: map(rank_by_score, r => r.total) },
  ];

  return (
    <Box mt={1}>
      <Card>
        <CardContent>
          <HighchartGraphBox
            containerId={containerId}
            type="bar"
            categories={categories}
            yLabel=""
            title=""
            legendEnabled={true}
            data={chart_data}
            normalize={false}
          />
        </CardContent>
      </Card>
      <Box mt={1}>
        <Grid container spacing={1}>
          {on_vs_miss_donut_charts}
        </Grid>
      </Box>
    </Box>
  );
}
