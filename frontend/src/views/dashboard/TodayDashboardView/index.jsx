import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
} from "@material-ui/core";
import { map, sortBy, reverse, filter } from "lodash";
import moment from "moment";
import React, { useState, useEffect } from "react";

import Page from "src/components/common/Page";
import ShowResource from "src/components/common/ShowResource";
import MoverCard from "src/components/dashboard/MoverCard";

export default function TodayDashboardView() {
  const [resource, setResource] = useState("");
  const [today, setToday] = useState(moment());
  const TOP = 10;

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

  useEffect(() => {
    set_today(today);
  });

  const today_change = (event) => {
    const now = moment(event.target.value, "YYYY-MM-DD");

    // update state
    setToday(now);

    // update resource
    set_today(now);
  };

  const render_data = (data) => {
    let stocks = data.objects;

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

    const dashboard_tops = map(dashboards, (d) => {
      return { ...d, stocks: d.stocks.slice(0, TOP) };
    });

    const contents = map(dashboard_tops, (d) => {
      return (
        <Grid key={d.title} item lg={4} sm={6} xs={12}>
          <MoverCard date={today_string} {...d} />
        </Grid>
      );
    });

    return (
      <Page title="Today">
        <Container maxWidth={false}>
          <Box mt={1}>
            <Card>
              <CardContent>
                <TextField
                  label="Pick a date"
                  type="date"
                  value={today.format("YYYY-MM-DD")}
                  onChange={today_change}
                  fullWidth={true}
                />
              </CardContent>
            </Card>
          </Box>

          <Box mt={1}>
            <Grid container spacing={1}>
              {contents}
            </Grid>
          </Box>
        </Container>
      </Page>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
}
