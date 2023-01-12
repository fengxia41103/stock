import { map } from "lodash";
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

import PriceLastLowerNextBetterChart from "src/components/stock/PriceLastLowerNextBetterChart";
import { get_last_month_string, get_today_string } from "src/utils/helper";
import SectorDetailContext from "src/views/sector/SectorDetailView/context";

const SectorStocksLowerBetterView = () => {
  const sector = useContext(SectorDetailContext);
  const {stocks_detail} = sector;

  const [start] = useState(get_last_month_string());
  const [end] = useState(get_today_string());

  const stock_price_trend_charts = map(stocks_detail, (d) => {
    const resource = `/historicals?stock=${d.id}&on__range=${start},${end}&order_by=on`;

    const render_data = (data) => {
      const historicals = data.objects;
      return (
        <Grid item lg={6} sm={6} xs={12}>
          <Card>
            <CardHeader
              title={<Typography variant="h3">{d.symbol}</Typography>}
            />

            <CardContent>
              <PriceLastLowerNextBetterChart data={historicals} />
            </CardContent>
          </Card>
        </Grid>
      );
    };

    return (
      <ShowResource
        {...{ key: d.id, resource, on_success: render_data, silent: true }}
      />
    );
  });

  return (
    <>
      <Typography variant="h1">Scales of Stock Gain & Loss</Typography>

      <Box mt={1}>
        <Grid container spacing={1}>
          {stock_price_trend_charts}
        </Grid>
      </Box>
    </>
  );
};

export default SectorStocksLowerBetterView;
