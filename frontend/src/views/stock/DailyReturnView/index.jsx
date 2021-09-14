import React, { useContext } from "react";

import PriceReturnStat from "src/components/stock/PriceReturnStat";
import { daily_returns, daily_return_stats } from "src/utils/stock/returns";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";

export default function DailyReturnView() {
  const data = useContext(StockHistoricalContext);
  const returns = daily_returns(data);
  const stats = daily_return_stats(data);
  const p = { ...{ name: "Daytime Return", returns, stats } };
  return <PriceReturnStat data={p} />;
}
