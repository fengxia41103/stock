import React, { useContext } from "react";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";
import PriceLastLowerNextBetterChart from "src/components/stock/PriceLastLowerNextBetterChart";
import PriceTable from "src/components/stock/PriceTable";

import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
} from "@material-ui/core";

export default function LastLowerNextBetterView() {
  const data = useContext(StockHistoricalContext);

  return (
    <>
      <Card>
        <CardHeader
          title={
            <Typography variant="h3">
              {data[0].symbol} Price Time Span
            </Typography>
          }
        />

        <CardContent>
          <Typography variant="body2">
            Time span measures how far out we have seen a `close` price both in
            the past and in the future. This is meant to measure the trend of
            price. Take a day's close price, we look back to find the last time
            we have seen anything lower than this, then peeking into the future
            to find the first time we saw a price higher than this. On a dip,
            last lower shows how long the bull run has been; on a continuous
            rising, last lower will always be 1! Conversely, next better will be
            0 if the stock has been continuously dropping, and 1 if it is
            continuously rising.
          </Typography>
          <Box mt={3}>
            <PriceLastLowerNextBetterChart data={data} />
          </Box>
        </CardContent>
      </Card>
      <Box mt={1}>
        <Card>
          <CardContent>
            <PriceTable data={data} />
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
