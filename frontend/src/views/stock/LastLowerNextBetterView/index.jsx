import React, { useContext } from "react";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";

import GainProbabilityChart from "src/components/stock/GainProbabilityChart";
import PriceLastLowerNextBetterChart from "src/components/stock/PriceLastLowerNextBetterChart";
import PriceTable from "src/components/stock/PriceTable";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";

const LastLowerNextBetterView = () => {
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
            Translate price movement into a time term. For a price drop, the
            drop scale measures in <code>days</code> when we saw a price lower
            than this. It's equivalent to say that if you had bought and held
            this stock between these dates, this drop would have wiped out all
            the gains in between. If stock has forever risen, this scale will
            always be 0; and if it has forever declining, this will always be 1.
            Thus, any value other than 0 or 1 indicates a drop.
          </Typography>

          <Typography variant="body2">
            Conversely, the rebound scale shows a price climbing back to a
            historical point. If it has forever risen, this scale will always be
            0; and if it has forever declining, it would have been always 1.
            Thus, any value other than 0 or 1 indicates a rebound.
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
};

export default LastLowerNextBetterView;
