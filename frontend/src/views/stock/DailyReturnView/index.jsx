import React, { useContext } from "react";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";
import PriceReturnStat from "src/components/stock/PriceReturnStat";
import { daily_returns, daily_return_stats } from "src/utils/stock/returns";

export default function DailyReturnView() {
  const { olds: prices } = useContext(StockHistoricalContext);
  const returns = daily_returns(prices);
  const stats = daily_return_stats(prices);
  const data = { ...{ name: "Daytime Return", returns, stats } };
  return <PriceReturnStat data={data} />;
}
