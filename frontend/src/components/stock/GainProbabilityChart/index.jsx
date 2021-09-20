import { map, last } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import HighchartGraphBox from "src/components/common/Highchart";
import { randomId } from "src/utils/helper.jsx";

export default function GainProbabilityChart(props) {
  const containerId = randomId();
  const { data } = props;
  const last_close = last(data).close_price;
  const categories = map(data, (d) => d.on);
  const chart_data = [
    {
      name: "Gain Bought Today & Hold (%)",
      data: map(
        data,
        (d) => ((last_close - d.close_price) / d.close_price) * 100,
      ),
    },
    {
      name: "Gain Probability (%)",
      data: map(data, (d) => d.gain_probability),
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

GainProbabilityChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      on: PropTypes.string,
      close_price: PropTypes.number,
      gain_probability: PropTypes.number,
    }),
  ).isRequired,
};
