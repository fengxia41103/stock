import { filter, map, reverse, sortBy } from "lodash";
import moment from "moment";
import React, { useMemo, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
} from "@mui/material";

import { Page } from "@fengxia41103/storybook";

import ShowResource from "@Components/common/ShowResource";
import MoverCard from "@Components/dashboard/MoverCard";

const getLastTradingDay = (m) => {
  const cloned = moment(m);
  const day = cloned.day();
  if (day === 0) cloned.subtract(2, "days");
  else if (day === 6) cloned.subtract(1, "days");
  return cloned;
};

const TodayDashboardView = () => {
  const TOP = 10;
  const [today, setToday] = useState(() => getLastTradingDay(moment()));

  const resource = useMemo(() => {
    const end = today.format("YYYY-MM-DD");
    const start = moment(today).subtract(3, "days").format("YYYY-MM-DD");
    return `/historicals/?on__range=${start},${end}&ordering=-on`;
  }, [today]);

  const today_change = (event) => {
    const now = moment(event.target.value, "YYYY-MM-DD");
    setToday(getLastTradingDay(now));
  };

  const render_data = (data) => {
    const all = Array.isArray(data) ? data : data.objects || [];

    // Use only the most recent date's records
    const latestDate = all.length ? all[0].on : null;
    let stocks = latestDate ? filter(all, (s) => s.on === latestDate) : [];

    stocks = map(stocks, (s) => ({
      gain: ((s.close_price - s.open_price) / s.open_price) * 100,
      volatility: ((s.high_price - s.low_price) / s.low_price) * 100,
      ...s,
    }));

    const today_string = today.format("dddd, ll");

    const dashboards = [
      {
        title: "Drop Scale (days)",
        subtitle: "days ago when saw this low",
        stocks: reverse(sortBy(stocks, (s) => s.last_lower)),
        value: "last_lower",
        roundTo: 0,
      },
      {
        title: "Rebound Scale (days)",
        subtitle: "days ago when saw this high",
        stocks: reverse(sortBy(stocks, (s) => s.last_better)),
        value: "last_better",
        roundTo: 0,
      },
      {
        title: "Top Volume Movers",
        subtitle: "as % of share outstanding",
        stocks: reverse(sortBy(stocks, (s) => s.vol_over_share_outstanding)),
        value: "vol_over_share_outstanding",
      },
      {
        title: "Top Volatility",
        subtitle: "as % of (high-low)/low",
        stocks: reverse(sortBy(stocks, (s) => s.volatility)),
        value: "volatility",
      },
      {
        title: "Top Gainers",
        subtitle: "as % of (close-open)/open",
        stocks: reverse(
          sortBy(
            filter(stocks, (s) => s.gain > 0),
            (s) => s.gain,
          ),
        ),
        value: "gain",
      },
      {
        title: "Top Losers",
        subtitle: "as % of (close-open)/open",
        stocks: sortBy(
          filter(stocks, (s) => s.gain < 0),
          (s) => s.gain,
        ),
        value: "gain",
      },
    ];

    const dashboard_tops = map(dashboards, (d) => ({
      ...d,
      stocks: d.stocks.slice(0, TOP),
    }));

    const mover_top_cards = map(dashboard_tops, (d) => (
      <Grid key={d.title} item lg={4} sm={6} xs={12}>
        <MoverCard date={today_string} {...d} />
      </Grid>
    ));

    return (
      <Page title="Today">
        <Container maxWidth>
          <Box mt={1}>
            <Card>
              <CardContent>
                <TextField
                  label="Pick a date"
                  type="date"
                  value={today.format("YYYY-MM-DD")}
                  onChange={today_change}
                  fullWidth
                />
              </CardContent>
            </Card>
          </Box>

          <Box mt={1}>
            <Grid container spacing={1}>
              {mover_top_cards}
            </Grid>
          </Box>
        </Container>
      </Page>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
};

export default TodayDashboardView;
