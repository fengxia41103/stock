import React from "react";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "src/components/common/Highchart";
import { map, last } from "lodash";
import PropTypes from "prop-types";

export default function PriceLastLowerNextBetterChart(props) {
  const containerId = randomId();
  const { data } = props;
  const last_close = last(data).close_price;
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
    {
      name: "Gain Bought Today & Hold (%)",
      data: map(
        data,
        (d) => ((last_close - d.close_price) / d.close_price) * 100
      ),
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
    })
  ).isRequired,
};
