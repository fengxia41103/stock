import { filter, map, reverse, sortBy } from "lodash";
import dayjs from "dayjs";
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
import MacroWidget from "@Components/dashboard/MacroWidget";
import MoverCard from "@Components/dashboard/MoverCard";
import UpcomingEarningsWidget from "@Components/dashboard/UpcomingEarningsWidget";

const getLastTradingDay = (m) => {
  let d = dayjs(m);
  if (d.day() === 0) d = d.subtract(2, "day");
  else if (d.day() === 6) d = d.subtract(1, "day");
  return d;
};

const TodayDashboardView = () => {
  const TOP = 10;
  const [today, setToday] = useState(() => getLastTradingDay(dayjs()));

  const resource = useMemo(() => {
    const end = today.format("YYYY-MM-DD");
    const start = dayjs(today).subtract(3, "days").format("YYYY-MM-DD");
    return `/historicals/?on__range=${start},${end}&ordering=-on`;
  }, [today]);

  const today_change = (event) => {
    const now = dayjs(event.target.value);
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

    const today_string = today.format("dddd, MMM D, YYYY");

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
              <Grid item lg={8} sm={12} xs={12}>
                <MacroWidget />
              </Grid>
              <Grid item lg={4} sm={12} xs={12}>
                <UpcomingEarningsWidget />
              </Grid>
            </Grid>
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
