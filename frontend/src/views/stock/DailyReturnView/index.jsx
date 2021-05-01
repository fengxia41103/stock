import React, { useContext } from "react";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";
import PriceReturnStat from "src/components/stock/PriceReturnStat";
import { daily_returns, daily_return_stats } from "src/utils/stock/returns";

export default function DailyReturnView() {
  const data = useContext(StockHistoricalContext);
  const returns = daily_returns(data);
  const stats = daily_return_stats(data);
  const p = { ...{ name: "Daytime Return", returns, stats } };
  return <PriceReturnStat data={p} />;
}
