import React, { useContext } from "react";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";
import PriceReturnStat from "src/components/stock/PriceReturnStat";
import {
  twenty_four_hour_returns,
  twenty_four_hour_stats,
} from "src/utils/stock/returns";

export default function TwentyFourHourReturnView() {
  const data = useContext(StockHistoricalContext);
  const returns = twenty_four_hour_returns(data);
  const stats = twenty_four_hour_stats(data);
  const p = { ...{ name: "Return of 24-hour", returns, stats } };
  return <PriceReturnStat data={p} />;
}
