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
            <Typography variant="body2">
              Gain probabilities measure how like you could gain by purchasing
              at close price on a particular day. The `Gain bought today & hold`
              is, as name indicates, is an absolute gain/loss in percentage if
              you buy at today&apos;s close price and hold till now. The
              &quot;Gain probability&quot; measures likelyhood you could make a
              positive gain from this date on. For example, if there are 30 days
              from the date to the end of period, and 10 days had prices higher
              than the date&apos;s close price, the probability is
              10/30=1/3=33%. In other words, you have 33% chance to make a
              positive gain.
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
