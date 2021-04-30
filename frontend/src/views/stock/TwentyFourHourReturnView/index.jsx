import React, { useContext } from "react";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";
import PriceReturnStat from "src/components/stock/PriceReturnStat";
import {
  twenty_four_hour_returns,
  twenty_four_hour_stats,
} from "src/utils/stock/returns";

export default function TwentyFourHourReturnView() {
  const { olds: prices } = useContext(StockHistoricalContext);
  const returns = twenty_four_hour_returns(prices);
  const stats = twenty_four_hour_stats(prices);
  const data = { ...{ name: "Return of 24-hour", returns, stats } };
  return <PriceReturnStat data={data} />;
}
