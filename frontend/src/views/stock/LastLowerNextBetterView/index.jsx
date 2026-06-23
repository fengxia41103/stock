import React, { useContext } from "react";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";

import GainProbabilityChart from "@Components/stock/GainProbabilityChart";
import PriceLastLowerNextBetterChart from "@Components/stock/PriceLastLowerNextBetterChart";
import PriceTable from "@Components/stock/PriceTable";

import StockHistoricalContext from "@Views/stock/StockHistoricalView/context";

const LastLowerNextBetterView = () => {
  const data = useContext(StockHistoricalContext);
  if (!Array.isArray(data) || data.length === 0) return null;
  const [first] = data;
  const { symbol } = first;

  return (
    <>
      <Card>
        <CardHeader
          title={<Typography variant="h3">{symbol} Price Time Span</Typography>}
        />

        <CardContent>
          <Typography variant="body2" paragraph>
            <strong>Drop Scale (last_lower)</strong> — &quot;How many days ago
            did I last see a price LOWER than today&apos;s close?&quot;
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>
              <code>0</code> = at the bottom (no prior price was lower →
              continuously falling or at all-time low)
            </li>
            <li>
              <code>30</code> = today&apos;s drop just erased 30 days of gains
            </li>
            <li>Higher value = more significant the drop</li>
          </Typography>

          <Typography variant="body2" paragraph sx={{ mt: 2 }}>
            <strong>Rebound Scale (last_better)</strong> — &quot;How many days
            ago did I last see a price HIGHER than today&apos;s close?&quot;
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>
              <code>0</code> = at or near a peak (no prior close was higher →
              making new highs)
            </li>
            <li>
              <code>15</code> = 15 days ago was the last time price was higher
              than today
            </li>
            <li>
              Higher value = deeper below a previous high (still recovering)
            </li>
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
              <Typography variant="h3">{symbol} Gain Probabilities</Typography>
            }
          />
          <CardContent>
            <Typography variant="body2" paragraph>
              <strong>Gain Bought Today &amp; Hold</strong> — If you bought at
              this day&apos;s close price and held until the end of the period,
              what would your total return be? Positive = profitable hold,
              negative = you would have lost money.
            </Typography>

            <Typography variant="body2" paragraph>
              <strong>Gain Probability</strong> — Of all remaining trading days
              after a given date, what percentage had a price higher than that
              day&apos;s close? This is your chance of being able to sell at a
              profit.
            </Typography>

            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>
                Example: 30 days remain, 10 had prices above today&apos;s close
                → probability = 10/30 = 33%
              </li>
              <li>
                <code>90-100%</code> = bought near the bottom (almost every
                future day was higher)
              </li>
              <li>
                <code>0-10%</code> = bought near the top (almost no future day
                was higher)
              </li>
              <li>
                Use this to see which price levels historically gave the best
                odds
              </li>
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
