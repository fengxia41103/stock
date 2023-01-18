import React, { useContext } from "react";

import PriceReturnStat from "@Components/stock/PriceReturnStat";
import {
  overnight_return_stats,
  overnight_returns,
} from "@Utils/stock/returns";
import StockHistoricalContext from "@Views/stock/StockHistoricalView/context";

const OvernightReturnView = () => {
  const data = useContext(StockHistoricalContext);
  const returns = overnight_returns(data);
  const stats = overnight_return_stats(data);
  const p = { ...{ name: "Overnight Return", returns, stats } };
  return <PriceReturnStat data={p} />;
};

export default OvernightReturnView;
