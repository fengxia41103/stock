import { groupBy, map } from "lodash";
import PropTypes from "prop-types";
import React, { useState } from "react";

import { MultilineChart, ShowResource } from "@fengxia41103/storybook";

export default function StocksPriceChart(props) {
  const { stocks: stock_ids, start, end } = props;
  const [resource] = useState(
    `/historicals?stock__in=${stock_ids.join(",")}&on__range=${start},${end}`,
  );

  const render_data = (resp) => {
    const data = resp.objects;
    const group_by_symbol = groupBy(data, (d) => d.symbol);

    const chart_data = map(group_by_symbol, (prices, symbol) => {
      return {
        symbol,
        data: prices,
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
  };
  return <ShowResource {...{ resource, on_success: render_data }} />;
}

StocksPriceChart.propTypes = {
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  stocks: PropTypes.arrayOf(PropTypes.number).isRequired,
};
