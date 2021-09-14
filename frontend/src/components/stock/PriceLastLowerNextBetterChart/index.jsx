import React from "react";

import { map } from "lodash";
import PropTypes from "prop-types";

import HighchartGraphBox from "src/components/common/Highchart";
import { randomId } from "src/utils/helper.jsx";

export default function PriceLastLowerNextBetterChart(props) {
  const containerId = randomId();
  const { data } = props;
  const categories = map(data, (d) => d.on);
  const chart_data = [
    {
      name: "Last Time Saw a Price < Today (days)",
      data: map(data, (d) => -1 * d.last_lower),
      lineWidth: 1,
    },
    {
      name: "Next Time See a Price > Today (days)",
      data: map(data, (d) => d.next_better),
      lineWidth: 1,
    },
  ];

  return (
    <HighchartGraphBox
      containerId={containerId}
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
