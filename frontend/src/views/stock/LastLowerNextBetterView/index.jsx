import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
} from "@material-ui/core";
import React, { useContext } from "react";


import GainProbabilityChart from "src/components/stock/GainProbabilityChart";
import PriceLastLowerNextBetterChart from "src/components/stock/PriceLastLowerNextBetterChart";
import PriceTable from "src/components/stock/PriceTable";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";

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
          <CardHeader
            title={
              <Typography variant="h3">
                {data[0].symbol} Gain Probabilities
              </Typography>
            }
          />
          <CardContent>
            <Typography variant="body2">
              Gain probabilities measure how like you could gain by purchasing
              at close price on a particular day. The `Gain bought today & hold`
              is, as name indicates, is an absolute gain/loss in percentage if
              you buy at today's close price and hold till now. The "Gain
              probability" measures likelyhood you could make a positive gain
              from this date on. For example, if there are 30 days from the date
              to the end of period, and 10 days had prices higher than the
              date's close price, the probability is 10/30=1/3=33%. In other
              words, you have 33% chance to make a positive gain.
            </Typography>
            <Box mt={3}>
              <GainProbabilityChart data={data} />
            </Box>
          </CardContent>
        </Card>
      </Box>
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
