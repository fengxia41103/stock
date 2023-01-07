import { HighchartGraph } from "@fengxia41103/storybook";
import { map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

export default function PriceLastLowerNextBetterChart(props) {
  const { data } = props;
  const categories = map(data, (d) => d.on);
  const chart_data = [
    {
      name: "Drop scale (days)",
      data: map(data, (d) => (d.last_lower === 1 ? 0 : -1 * d.last_lower)),
      lineWidth: 1,
    },
    {
      name: "Rebound scale (days)",
      data: map(data, (d) => (d.last_better === 1 ? 0 : d.last_better)),
      lineWidth: 1,
    },
  ];

  return (
    <HighchartGraph
      type="areaspline"
      categories={categories}
      yLabel=""
      title=""
      legendEnabled={true}
      data={chart_data}
    />
  );
}

PriceLastLowerNextBetterChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      on: PropTypes.string,
      last_lower: PropTypes.number,
      next_better: PropTypes.number,
      open_price: PropTypes.number,
      close_price: PropTypes.number,
    }),
  ).isRequired,
};
