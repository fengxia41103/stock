import {
  makeStyles,
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
} from "@material-ui/core";
import clsx from "clsx";
import { map, groupBy, reverse } from "lodash";
import moment from "moment";
import React, { useContext } from "react";

import ColoredNumber from "src/components/common/ColoredNumber";
import GainPriceRanges from "src/components/stock/GainPriceRanges";
import PriceChart from "src/components/stock/PriceChart";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";

const useStyles = makeStyles((theme) => ({
  card: {
    height: "100%",
  },
}));

export default function PriceView() {
  const data = useContext(StockHistoricalContext);
  const classes = useStyles();

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
                <Typography variant="h3">
                  {data[0].symbol} Daily Prices
                </Typography>
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
}
