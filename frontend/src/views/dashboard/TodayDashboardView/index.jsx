import React, { useState, useContext, useEffect } from "react";
import Fetch from "src/components/common/Fetch";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
} from "@material-ui/core";
import Page from "src/components/common/Page";
import GlobalContext from "src/context";
import MoverCard from "src/components/dashboard/MoverCard";
import { map, sortBy, reverse, filter, uniqBy } from "lodash";
import moment from "moment";
import UpdateAllStock from "src/components/stock/UpdateAllStock";

export default function TodayDashboardView() {
  const { api } = useContext(GlobalContext);
  const [resource, setResource] = useState("");
  const [today, setToday] = useState(moment());

  const set_today = now => {
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

    let tmp = now.add(adjust_in_day, "days").format("YYYY-MM-DD");
    setResource(`/historicals?on__range=${tmp},${tmp}`);
  };

  useEffect(() => {
    set_today(today);
  });

  const today_change = event => {
    const now = moment(event.target.value, "YYYY-MM-DD");

    // update state
    setToday(now);

    // update resource
    set_today(now);
  };

  const render_data = data => {
    let stocks = data.objects;

    const stocks_with_unique_id = map(uniqBy(stocks, "stock_id"), s => {
      return { id: s.stock_id };
    });

    stocks = map(stocks, s => {
      return {
        gain: ((s.close_price - s.open_price) / s.open_price) * 100,
        volatility: ((s.high_price - s.low_price) / s.low_price) * 100,
        ...s,
      };
    });

    const gainer = reverse(
      sortBy(
        filter(stocks, s => s.gain > 0),
        s => s.gain
      )
    ).slice(0, 10);
    const loser = sortBy(
      filter(stocks, s => s.gain < 0),
      s => s.gain
    ).slice(0, 10);
    const mover = reverse(
      sortBy(stocks, s => s.vol_over_share_outstanding)
    ).slice(0, 10);
    const volatility = reverse(sortBy(stocks, s => s.volatility)).slice(0, 10);

    const today_string = today.format("dddd, ll");

    return (
      <Page title="Today">
        <Container maxWidth={false}>
          <Box mt={1}>
            <Grid
              container
              spacing={1}
              direction="row"
              justifyContent="flex-end"
            >
              <Grid item xs>
                <UpdateAllStock stocks={stocks_with_unique_id} />
              </Grid>
            </Grid>
          </Box>

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
              <Grid item lg={4} sm={6} xs={12}>
                <MoverCard
                  date={today_string}
                  title="Top Volume Movers"
                  subtitle="as % of share outstanding"
                  stocks={mover}
                  value="vol_over_share_outstanding"
                />
              </Grid>
              <Grid item lg={4} sm={6} xs={12}>
                <MoverCard
                  date={today_string}
                  title="Top Volatility"
                  subtitle="as % of (high-low)/low"
                  stocks={volatility}
                  value="volatility"
                />
              </Grid>
              <Grid item lg={4} sm={6} xs={12}>
                <MoverCard
                  date={today_string}
                  title="Top Gainers"
                  subtitle="as % of (close-open)/open"
                  stocks={gainer}
                  value="gain"
                />
              </Grid>
              <Grid item lg={4} sm={6} xs={12}>
                <MoverCard
                  date={today_string}
                  title="Top Losers"
                  subtitle="as % of (close-open)/open"
                  stocks={loser}
                  value="gain"
                />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Page>
    );
  };

  return <Fetch {...{ api, resource, render_data }} />;
}
