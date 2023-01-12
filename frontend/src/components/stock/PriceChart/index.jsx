import { map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import { HighchartGraph } from "@fengxia41103/storybook";

const PriceChart = (props) => {
  const { data } = props;
  const categories = map(data, (d) => d.on);
  const chart_data = [
    {
      name: "Open Price",
      data: map(data, (d) => d.open_price),
      lineWidth: 5,
    },
    {
      name: "Close Price",
      data: map(data, (d) => d.close_price),
      lineWidth: 5,
    },
    {
      name: "High Price",
      data: map(data, (d) => d.high_price),
      visible: false,
    },
    {
      name: "Low Price",
      data: map(data, (d) => d.low_price),
      visible: false,
    },
  ];

  return (
    <HighchartGraph
      type="line"
      categories={categories}
      yLabel=""
      title=""
      data={chart_data}
      legendEnabled
    />
  );
};

PriceChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      on: PropTypes.string,
      open_price: PropTypes.number,
      close_price: PropTypes.number,
      high_price: PropTypes.number,
      low_price: PropTypes.number,
    }),
  ),
};

export default PriceChart;
