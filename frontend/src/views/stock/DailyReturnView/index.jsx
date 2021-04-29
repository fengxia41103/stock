import React, { useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardHeader,
} from "@material-ui/core";
import StrategyValueView from "src/views/stock/StrategyValueView";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context.jsx";
import DictCard from "src/components/DictCard";
import TwoDayReturnView from "./two_day.jsx";

export default function DailyReturnView() {
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
          <CardHeader
            title={
              <Typography variant="h3">Statistic of Daily Returns</Typography>
            }
          />
          <CardContent>
            <DictCard {...{ data: stats, interests }} />
          </CardContent>
        </Card>
      </Box>
      <Box mt={3}>
        <Card>
          <CardHeader
            title={
              <Typography variant="h3">Trend of Two-Day Returns</Typography>
            }
          />
          <CardContent>
            <TwoDayReturnView {...{ data: two_day_trend }} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
