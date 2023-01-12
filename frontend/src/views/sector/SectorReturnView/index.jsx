import { groupBy, map, reverse } from "lodash";
import moment from "moment";
import React, { useContext, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";

import { ShowResource } from "@fengxia41103/storybook";

import SectorReturnComparisonChart from "src/components/sector/SectorReturnComparisonChart";
import { get_last_month_string, get_today_string } from "src/utils/helper";
import SectorDetailContext from "src/views/sector/SectorDetailView/context";

const SectorReturnView = () => {
  const sector = useContext(SectorDetailContext);
  const {stocks_detail} = sector;

  const stock_ids = map(stocks_detail, (s) => s.id).join(",");

  const [start] = useState(get_last_month_string());
  const [end] = useState(get_today_string());
  const [resource] = useState(
    `/historicals?stock__in=${stock_ids}&on__range=${start},${end}`,
  );

  const render_data = (data) => {
    let stocks = data.objects;

    // compute week index
    stocks = map(stocks, (s) => {
      return { ...s, week: moment(s.on).week() };
    });

    // group data by week index
    const group_by_week = groupBy(stocks, (s) => s.week);

    // compose charts
    const weekly_comparison_charts = reverse(
      map(group_by_week, (prices, week) => {
        return (
          <Box key={week} mt={1}>
            <Card>
              <CardHeader
                title={
                  <Typography variant="h3">Returns of Week {week}</Typography>
                }
              />

              <CardContent>
                <Grid container spacing={1}>
                  <Grid item lg={6} xs={12}>
                    <Typography variant="body2">Daytime Returns</Typography>
                    <SectorReturnComparisonChart data={prices} kind="daily" />
                  </Grid>
                  <Grid item lg={6} xs={12}>
                    <Typography variant="body2">Overnight Returns</Typography>
                    <SectorReturnComparisonChart
                      data={prices}
                      kind="overnight"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );
      }),
    );

    return (
      <>
        <Typography variant="h1">Returns Comparison</Typography>

        <Box mt={1}>{weekly_comparison_charts}</Box>
      </>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
};
export default SectorReturnView;
