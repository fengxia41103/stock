import React, { useContext } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Grid,
} from "@material-ui/core";

import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";
import PriceTable from "./table";
import PriceChart from "./chart";
import { map, groupBy, reverse } from "lodash";
import moment from "moment";
import ColoredNumber from "src/components/ColoredNumber";

export default function PriceView() {
  const data = useContext(StockHistoricalContext);

  const stocks = map(data, d => {
    return { ...d, week: moment(d.on).week() };
  });

  // group data by week index
  const group_by_week = groupBy(stocks, s => s.week);
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
                <Typography variant="h3">Pricess of Week {week}</Typography>
              }
            />

            <CardContent>
              <Typography variant="body3">
                End-2-End return: <ColoredNumber val={e2e_return} />%
              </Typography>
              <PriceChart data={prices} />
            </CardContent>
          </Card>
        </Grid>
      );
    })
  );

  return (
    <Box>
      <Card>
        <CardHeader
          title={
            <Typography variant="h3">{data[0].symbol} Daily Prices</Typography>
          }
        />
        <CardContent>
          <PriceChart data={data} />
          <Box mt={1}>
            <PriceTable data={data} />
          </Box>
        </CardContent>
      </Card>
      <Box mt={1}>
        <Grid container spacing={1}>
          {weekly_charts}
        </Grid>
      </Box>
    </Box>
  );
}
