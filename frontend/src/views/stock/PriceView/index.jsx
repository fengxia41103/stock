import React, { useContext } from "react";
import { Card, CardContent, Box } from "@material-ui/core";

import StockHistoricalContext from "src/views/stock/StockHistoricalView/context.jsx";

import PriceChart from "./chart.jsx";
import DailyReturnView from "src/views/stock/DailyReturnView";
import OvernightReturnView from "src/views/stock/OvernightReturnView";
import OvernightReturnFlip from "src/components/stock/OvernightReturnFlip";

function PriceView() {
  const data = useContext(StockHistoricalContext);
  const { olds: prices, stats } = data;

  return (
    <Box>
      <Card>
        <CardContent>
          <PriceChart data={prices} />
        </CardContent>
      </Card>

      <Box mt={3}>
        <OvernightReturnFlip data={stats} />
      </Box>

      <Box mt={3}>
        <DailyReturnView />
      </Box>
      <Box mt={3}>
        <OvernightReturnView />
      </Box>
    </Box>
  );
}

export default PriceView;
