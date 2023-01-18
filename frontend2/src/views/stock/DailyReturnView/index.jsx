import React, { useContext } from "react";

import PriceReturnStat from "@Components/stock/PriceReturnStat";
import { daily_return_stats, daily_returns } from "@Utils/stock/returns";
import StockHistoricalContext from "@Views/stock/StockHistoricalView/context";

const DailyReturnView = () => {
  const data = useContext(StockHistoricalContext);
  const returns = daily_returns(data);
  const stats = daily_return_stats(data);
  const p = { ...{ name: "Daytime Return", returns, stats } };
  return <PriceReturnStat data={p} />;
};

export default DailyReturnView;
