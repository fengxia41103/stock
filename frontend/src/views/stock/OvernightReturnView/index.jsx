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

export default function OvernightReturnView() {
  const data = useContext(StockHistoricalContext);
  const returns = data.indexes["overnight return"];
  const { stats } = data;

  const interests = {
    nightly_ups: "UP overnights/Total days (%)",
    nightly_downs: "DOWN overnights/Total days (%)",
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <StrategyValueView data={returns} name="Overnight Return" />
        </CardContent>
      </Card>
      <Box mt={3}>
        <Card>
          <CardHeader
            title={
              <Typography variant="h3">
                Statistic of Overnight Returns
              </Typography>
            }
          />
          <CardContent>
            <DictCard {...{ data: stats, interests }} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
