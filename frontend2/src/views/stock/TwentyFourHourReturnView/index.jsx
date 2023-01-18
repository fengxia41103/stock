import React, { useContext } from "react";

import PriceReturnStat from "@Components/stock/PriceReturnStat";
import {
  twenty_four_hour_returns,
  twenty_four_hour_stats,
} from "@Utils/stock/returns";
import StockHistoricalContext from "@Views/stock/StockHistoricalView/context";

const TwentyFourHourReturnView = () => {
  const data = useContext(StockHistoricalContext);
  const returns = twenty_four_hour_returns(data);
  const stats = twenty_four_hour_stats(data);
  const p = { ...{ name: "Return of 24-hour", returns, stats } };
  return <PriceReturnStat data={p} />;
};

export default TwentyFourHourReturnView;
