import React, { useState, useContext } from "react";
import GlobalContext from "src/context";
import { map, groupBy } from "lodash";
import Fetch from "src/components/Fetch";
import MultilineChart from "src/components/MultilineChart";
import PropTypes from "prop-types";

export default function StocksPriceChart(props) {
  const { api } = useContext(GlobalContext);
  const { stocks: stock_ids, start, end } = props;
  const [resource] = useState(
    `/historicals?stock__in=${stock_ids.join(",")}&on__range=${start},${end}`
  );

  const render_data = resp => {
    const data = resp.objects;
    const group_by_symbol = groupBy(data, d => d.symbol);

    const chart_data = map(group_by_symbol, (prices, symbol) => {
      return {
        symbol: symbol,
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

  return <Fetch {...{ api, resource, render_data }} />;
}

StocksPriceChart.propTypes = {
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  stocks: PropTypes.arrayOf(PropTypes.number).isRequired,
};
