import React from "react";
import { map } from "lodash";
import MultilineChart from "src/components/MultilineChart";

export default function StocksPriceChart(props) {
  // One month historical normalized chart.  Used in conjunction w/
  // ranking to see how history correlates with ranks.
  const { ranks } = props;
  const chart_data = map(ranks, r => {
    return {
      symbol: r.symbol,
      data: r.one_month_historicals,
    };
  });

  return (
    <MultilineChart
      {...{
        data: chart_data,
        category_by: "on",
        label_by: "symbol",
        data_by: "close_price",
        normalized: true,
      }}
    />
  );
}
