import React, { useContext } from "react";
import { Box, Card, CardContent, Typography } from "@material-ui/core";
import StrategyValueView from "src/views/stock/StrategyValueView";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context.jsx";
import DictCard from "src/components/DictCard";
import TwoDayReturnView from "./two_day.jsx";

function DailyReturnView() {
  const data = useContext(StockHistoricalContext);
  const returns = data.indexes["daily return"];
  const { stats } = data;
  const { two_day_trend } = stats;

  const interests = {
    "avg daily up": "Average Up (%)",
    "avg daily down": "Average Down (%)",
    "daily up rsd": "RSD of UPs",
    "daily down rsd": "RSD of DOWNs",
    daily_ups: "UP days/Total days (%)",
    daily_downs: "DOWN days/Total days (%)",
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <StrategyValueView data={returns} name="Daily Return" />
        </CardContent>
      </Card>

      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h3">Statistic of Daily Returns</Typography>
            <Box mt={3}>
              <DictCard {...{ data: stats, interests }} />
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h3">Trend of Two-Day Returns</Typography>

            <Box mt={3}>
              <TwoDayReturnView {...{ data: two_day_trend }} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default DailyReturnView;
