import HighchartGraph from "@fengxia41103/storybook";
import { forEach, groupBy, map, merge } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import { daily_returns, overnight_returns } from "src/utils/stock/returns";

export default function SectorReturnComparisonChart(props) {
  const { data: stocks, kind } = props;

  let categories = [];

  const group_by_symbol = groupBy(stocks, (s) => s.symbol);

  const chart_data = map(group_by_symbol, (prices, symbol) => {
    let returns = null;

    switch (kind) {
      case "daily":
        returns = daily_returns(prices);
        break;

      case "overnight":
        returns = overnight_returns(prices);
        break;

      default:
        returns = daily_returns(prices);
        break;
    }

    // update categories
    categories = merge(
      categories,
      map(returns, (d) => d.on),
    );

    const aligned_returns = [];
    forEach(returns, (d) => {
      if (categories.includes(d.on)) {
        aligned_returns.push(d.val);
      } else {
        aligned_returns.push(0);
      }
    });

    return {
      name: symbol,
      data: aligned_returns,
    };
  });

  return (
    <HighchartGraph
      type="column"
      categories={categories}
      xLabel=""
      yLabel="Return (%)"
      title=""
      legendEnabled={true}
      data={chart_data}
      keepNegative={true}
    />
  );
}

SectorReturnComparisonChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      on: PropTypes.string,
      symbol: PropTypes.string,
      open_price: PropTypes.number,
      close_price: PropTypes.number,
      high_price: PropTypes.number,
      low_price: PropTypes.number,
      adj_close: PropTypes.number,
      vol: PropTypes.number,
    }),
  ).isRequired,
  kind: PropTypes.string.isRequired,
};
