import React, { useContext } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
} from "@material-ui/core";

import StockHistoricalContext from "src/views/stock/StockHistoricalView/context.jsx";
import PriceTable from "./table";
import PriceChart from "./chart";

export default function PriceView() {
  const data = useContext(StockHistoricalContext);
  const { olds: prices } = data;

  return (
    <Box>
      <Card>
        <CardHeader
          title={<Typography variant="h3">Daily Prices</Typography>}
        />
        <CardContent>
          <PriceChart data={prices} />
        </CardContent>
      </Card>

      <Box mt={3}>
        <PriceTable data={prices} />
      </Box>
    </Box>
  );
}
