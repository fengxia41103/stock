import { map } from "lodash";
import PropTypes from "prop-types";
import React, { useState } from "react";

import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";

import { ShowResource } from "@fengxia41103/storybook";

import DailyRankingBarRaceChart from "@Components/dashboard/DailyRankingBarRaceChart";
import { get_highlights } from "@Utils/helper";
import stocks_daily_ranking from "@Utils/stock/ranking";

const SectorPriceTrending = (props) => {
  const INTERESTS = [
    { name: "Gainer/Loser", val: "gain" },
    { name: "Volume", val: "vol_over_share_outstanding" },
    { name: "Volatility", val: "volatility" },
    { name: "Last Time Saw Lower (days)", val: "last_lower" },
    { name: "Next See Higher (days)", val: "next_better" },
  ];
  const { start, end, stocks: stock_ids } = props;
  const [resource] = useState(
    `/historicals?stock__in=${stock_ids.join(
      ","
    )}&on__range=${start},${end}&order_by=-on`
  );

  const render_data = (data) => {
    const stocks = data.objects;

    // all symbols are color-coded
    const symbols = [...new Set(map(stocks, (s) => s.symbol))];

    let highlights = [];
    if (symbols.length !== highlights.length) {
      // only recompute highlight color if list length is different
      highlights = get_highlights(symbols);
    }

    const trendings = map(INTERESTS, (i) => {
      const title = i.name;
      const order_by = i.val;

      // get ranks
      const ranks = stocks_daily_ranking(stocks, order_by, true);

      return (
        <Grid key={order_by} item lg={6} sm={6} xs={12}>
          <Card>
            <CardHeader
              title={<Typography variant="h3">Trending: {title}</Typography>}
              subheader={
                <Typography variant="body2" color="secondary">
                  {start} to {end}
                </Typography>
              }
            />

            <CardContent>
              <DailyRankingBarRaceChart {...{ ranks, order_by, highlights }} />
            </CardContent>
          </Card>
        </Grid>
      );
    });
    return (
      <Grid container spacing={1}>
        {trendings}
      </Grid>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
};

SectorPriceTrending.propTypes = {
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  stocks: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default SectorPriceTrending;
