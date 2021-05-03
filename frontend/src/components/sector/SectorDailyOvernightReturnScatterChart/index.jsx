import React, { useState, useContext } from "react";
import GlobalContext from "src/context";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import { map, groupBy } from "lodash";
import HighchartGraphBox from "src/components/Highchart";
import { randomId } from "src/utils/helper.jsx";
import {
  daily_returns,
  daily_return_stats,
  overnight_returns,
  overnight_return_stats,
} from "src/utils/stock/returns";
import PropTypes from "prop-types";

export default function SectorDailyOvernightReturnScatterChart(props) {
  const { data: stocks } = props;

  // scatter graphy doesn't need categories
  const categories = [];

  const group_by_symbol = groupBy(stocks, s => s.symbol);

  const chart_data = map(group_by_symbol, (prices, symbol) => {
    const daily = daily_returns(prices);
    const overnight = overnight_returns(prices);

    // pair daily & overnight data points
    const my_data = map(daily, (s, index) => {
      return [s.val, overnight[index].val];
    });

    return {
      name: symbol,
      data: my_data,
    };
  });

  const containerId = randomId();
  return (
    <HighchartGraphBox
      containerId={containerId}
      type="scatter"
      categories={categories}
      xLabel="Daily Return (%)"
      yLabel="Overnight Return (%)"
      title=""
      legendEnabled={true}
      data={chart_data}
    />
  );
}

SectorDailyOvernightReturnScatterChart.propTypes = {
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
    })
  ).isRequired,
};
