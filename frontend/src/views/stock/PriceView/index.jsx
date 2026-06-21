import { groupBy, map, reverse } from "lodash";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);
import React, { useContext } from "react";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import { ColoredNumber } from "@fengxia41103/storybook";
import { useEarnings } from "@/api";

import GainPriceRanges from "@Components/stock/GainPriceRanges";
import MacroOverlay from "@Components/stock/MacroOverlay";
import PriceChart from "@Components/stock/PriceChart";

import StockHistoricalContext from "@Views/stock/StockHistoricalView/context";

const PriceView = () => {
  const data = useContext(StockHistoricalContext);
  if (!Array.isArray(data) || data.length === 0) return null;
  const [first_data] = data;
  const { symbol } = first_data;

  const stocks = map(data, (d) => {
    return { ...d, week: dayjs(d.on).week() };
  });

  const stockId = data[0]?.stock_id;

  // Earnings markers
  const { data: earnings } = useEarnings(stockId);
  const earningsInRange = (earnings || []).filter((e) => {
    const d = e.report_date;
    return data.some((p) => p.on === d) || (d >= data[0]?.on && d <= data[data.length - 1]?.on);
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
          <Card sx={{ height: "100%" }}>
            <CardHeader
              title={
                <Typography variant="h3">{symbol} Daily Prices</Typography>
              }
            />
            <CardContent>
              <PriceChart data={data} />
              {earningsInRange.length > 0 && (
                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                  {earningsInRange.map((e) => (
                    <Chip
                      key={e.id}
                      size="small"
                      label={`${e.report_date} ${e.surprise_pct != null ? (e.surprise_pct > 0 ? "+" : "") + e.surprise_pct.toFixed(1) + "%" : "📅"}`}
                      color={e.surprise_pct > 0 ? "success" : e.surprise_pct < 0 ? "error" : "default"}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item lg={4} md={4} sm={6} xs={12}>
          <Card sx={{ height: "100%" }}>
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
        <MacroOverlay priceData={data} />
      </Box>

      <Box mt={1}>
        <Grid container spacing={1}>
          {weekly_charts}
        </Grid>
      </Box>
    </>
  );
};

export default PriceView;
