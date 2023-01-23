import { filter, map, reverse, sortBy } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
} from "@mui/material";

import { CountCards, Page, ShowResource } from "@fengxia41103/storybook";

import MoverCard from "@Components/dashboard/MoverCard";

const TodayDashboardView = () => {
  // constant
  const TOP = 10;

  // states
  const [resource, setResource] = useState("");
  const [today, setToday] = useState(moment());

  // hooks
  useEffect(() => {
    set_today(today);
  });

  // helpers
  const set_today = (now) => {
    let adjust_in_day;
    switch (now.day()) {
      case 0:
        // sunday
        adjust_in_day = -2;
        break;

      case 6:
        // saturday
        adjust_in_day = -1;
        break;

      default:
        adjust_in_day = 0;
        break;
    }

    const tmp = now.add(adjust_in_day, "days").format("YYYY-MM-DD");
    setResource(`/historicals?on__range=${tmp},${tmp}`);
  };

  // event handlers
  const today_change = (event) => {
    const now = moment(event.target.value, "YYYY-MM-DD");

    // update state
    setToday(now);

    // update resource
    set_today(now);
  };

  // renders
  const render_data = (data) => {
    let stocks = data.objects;

    // compute gain & volatility on the fly
    stocks = map(stocks, (s) => {
      return {
        gain: ((s.close_price - s.open_price) / s.open_price) * 100,
        volatility: ((s.high_price - s.low_price) / s.low_price) * 100,
        ...s,
      };
    });

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

    // pick top 10
    const dashboard_tops = map(dashboards, (d) => {
      return { ...d, stocks: d.stocks.slice(0, TOP) };
    });

    // render mover top contents
    const mover_top_cards = map(dashboard_tops, (d) => {
      return (
        <Grid key={d.title} item lg={4} sm={6} xs={12}>
          <MoverCard date={today_string} {...d} />
        </Grid>
      );
    });

    const count_by_gainer = (s) => s.gain > 0;

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
              <CountCards
                {...{
                  data: stocks,
                  count_by_lambda: count_by_gainer,
                  title: "Gainers",
                }}
              />
            </Grid>
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
