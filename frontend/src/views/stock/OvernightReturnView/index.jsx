import React, { useContext } from "react";
import { Box, Card, CardContent, Typography } from "@material-ui/core";
import StrategyValueView from "src/views/stock/StrategyValueView";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context.jsx";
import DictCard from "src/components/dict_card.jsx";
import OvernightFlipView from "./flip.jsx";

function OvernightReturnView() {
  const data = useContext(StockHistoricalContext);
  const returns = data.indexes["overnight return"];
  const { stats } = data;

  const interests = {
    nightly_ups: "UP overnights/Total days (%)",
    nightly_downs: "DOWN overnights/Total days (%)",
  };

  return (
    <Box>
      <Box mt={3}>
        <Card>
          <CardContent>
            <StrategyValueView data={returns} name="Overnight Return" />
          </CardContent>
        </Card>
      </Box>
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h3">Statistic of Overnight Returns</Typography>
            <DictCard {...{ data: stats, interests }} />
          </CardContent>
        </Card>
      </Box>
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h3">Night-Day Flips</Typography>
            <OvernightFlipView {...{ data: stats }} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default OvernightReturnView;
