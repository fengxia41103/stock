import React, { useContext } from "react";
import { Card, CardContent, Box } from "@material-ui/core";

import StockHistoricalContext from "src/views/stock/StockHistoricalView/context.jsx";

import PriceChart from "./chart.jsx";
import DailyReturnView from "src/views/stock/DailyReturnView";
import OvernightReturnFlip from "src/components/stock/OvernightReturnFlip";
import { stock_stats } from "src/utils/stock/returns";
import ABDonutChart from "src/components/ABDonutChart";
import { map } from "lodash";

export default function PriceView() {
  const data = useContext(StockHistoricalContext);
  const { olds: prices, stats } = data;

  const return_stats = stock_stats(prices);

  const positive_negative_charts = map(return_stats, s => {
    const stat = s.stats;
    const chart_data = {
      name: s.name,
      positive: stat.positive_count,
      negative: stat.negative_count,
    };
    return <ABDonutChart key={s.name} data={chart_data} />;
  });

  return (
    <Box>
      <Card>
        <CardContent>
          <PriceChart data={prices} />
        </CardContent>
      </Card>

      <Box mt={3}>
        <DailyReturnView />
      </Box>
    </Box>
  );
}
