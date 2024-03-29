import clsx from "clsx";
import { groupBy, map, reverse } from "lodash";
import moment from "moment";
import React, { useContext } from "react";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import { ColoredNumber } from "@fengxia41103/storybook";

import GainPriceRanges from "@Components/stock/GainPriceRanges";
import PriceChart from "@Components/stock/PriceChart";

import StockHistoricalContext from "@Views/stock/StockHistoricalView/context";

const myStyles = makeStyles(() => ({
  card: {
    height: "100%",
  },
}));

const PriceView = () => {
  const data = useContext(StockHistoricalContext);
  const [first_data] = data;
  const { symbol } = first_data;

  const classes = myStyles();

  const stocks = map(data, (d) => {
    return { ...d, week: moment(d.on).week() };
  });

  // group data by week index
  const group_by_week = groupBy(stocks, (s) => s.week);
  const weekly_charts = reverse(
    map(group_by_week, (prices, week) => {
      const last = [...prices].pop();
      const first = prices[0];
      const e2e_return =
        ((last.close_price - first.open_price) / first.open_price) * 100;

      return (
        <Grid key={week} item lg={4} sm={6} xs={12}>
          <Card>
            <CardHeader
              title={
                <Typography variant="h3">Prices of Week {week}</Typography>
              }
            />

            <CardContent>
              <PriceChart data={prices} />
              <Divider />
              <Box mt={2}>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">End-2-End return</Typography>
                  <Chip
                    variant="default"
                    label={
                      <Typography variant="h1">
                        <ColoredNumber val={e2e_return} unit="%" />
                      </Typography>
                    }
                  />
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      );
    }),
  );

  return (
    <>
      <Grid container spacing={1}>
        <Grid item lg={8} md={8} sm={6} xs={12}>
          <Card className={clsx(classes.card)}>
            <CardHeader
              title={
                <Typography variant="h3">{symbol} Daily Prices</Typography>
              }
            />
            <CardContent>
              <PriceChart data={data} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item lg={4} md={4} sm={6} xs={12}>
          <Card className={clsx(classes.card)}>
            <CardHeader
              title={<Typography variant="h3">Gain Probability</Typography>}
              subheader={
                <Typography variant="body2" color="secondary">
                  if bought at this OPEN price
                </Typography>
              }
            />
            <CardContent>
              <GainPriceRanges data={data} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={1}>
        <Grid container spacing={1}>
          {weekly_charts}
        </Grid>
      </Box>
    </>
  );
};

export default PriceView;
