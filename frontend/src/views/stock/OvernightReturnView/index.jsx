import React, { useContext } from "react";

import PriceReturnStat from "src/components/stock/PriceReturnStat";
import {
  overnight_returns,
  overnight_return_stats,
} from "src/utils/stock/returns";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";

export default function OvernightReturnView() {
  const data = useContext(StockHistoricalContext);
  const returns = overnight_returns(data);
  const stats = overnight_return_stats(data);
  const p = { ...{ name: "Overnight Return", returns, stats } };
  return <PriceReturnStat data={p} />;
}
