import React, { useState } from "react";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardHeader,
  Grid,
} from "@material-ui/core";
import { map } from "lodash";
import { get_today_string, get_last_month_string } from "src/utils/helper.jsx";
import PriceLastLowerNextBetterChart from "src/components/stock/PriceLastLowerNextBetterChart";
import Fetch from "src/components/common/Fetch";

export default function SectorStocksLowerBetterView() {
  const sector = useContext(SectorDetailContext);
  const [start] = useState(get_last_month_string());
  const [end] = useState(get_today_string());

  const stock_price_trend_charts = map(sector.stocks_detail, (d) => {
    const resource = `/historicals?stock=${d.id}&on__range=${start},${end}&order_by=on`;

    const render_data = (data) => {
      let historicals = data.objects;
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

    return <Fetch key={d.id} {...{ resource, render_data, silent: true }} />;
  });

  return (
    <>
      <Typography variant={"h1"}>Scales of Stock Gain & Loss</Typography>

      <Box mt={1}>
        <Grid container spacing={1}>
          {stock_price_trend_charts}
        </Grid>
      </Box>
    </>
  );
}
