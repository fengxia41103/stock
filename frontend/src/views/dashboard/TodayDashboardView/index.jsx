import React, { useState, useContext } from "react";
import Fetch from "src/components/Fetch";
import { Box, Container, Grid } from "@material-ui/core";
import Page from "src/components/Page";
import GlobalContext from "src/context";
import MoverCard from "src/components/dashboard/MoverCard";
import { map, sortBy, reverse, filter } from "lodash";

export default function TodayDashboardView(props) {
  const { api } = useContext(GlobalContext);
  const [today] = useState(new Date().toLocaleDateString("en-CA"));
  const [resource] = useState(`/historicals?on__range=${today},${today}`);

  const render_data = data => {
    let stocks = data.objects;
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

    return (
      <Page title="Today">
        <Container maxWidth={false}>
          <Box mt={1}>
            <Grid container spacing={1}>
              <Grid item lg={4} sm={6} xs={12}>
                <MoverCard
                  title="Today's Volume Movers"
                  subtitle="as % of share outstanding"
                  stocks={mover}
                  value="vol_over_share_outstanding"
                />
              </Grid>
              <Grid item lg={4} sm={6} xs={12}>
                <MoverCard
                  title="Today's Volatility"
                  subtitle="as % of (high-low)/low"
                  stocks={volatility}
                  value="volatility"
                />
              </Grid>
              <Grid item lg={4} sm={6} xs={12}>
                <MoverCard
                  title="Today's Top Gainers"
                  subtitle="as % of (close-open)/open"
                  stocks={gainer}
                  value="gain"
                />
              </Grid>
              <Grid item lg={4} sm={6} xs={12}>
                <MoverCard
                  title="Today's Top Losers"
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
