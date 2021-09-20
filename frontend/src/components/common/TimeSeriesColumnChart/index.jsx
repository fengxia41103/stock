import { map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import HighchartGraphBox from "src/components/common/Highchart";
import { randomId } from "src/utils/helper.jsx";

export default function TimeSeriesColumnChart(props) {
  const containerId = randomId();
  const { data, name } = props;
  const categories = map(data, (d) => d.on);
  const chart_data = [
    {
      name,
      data: map(data, (d) => d.val),
    },
  ];

  return (
    <HighchartGraphBox
      containerId={containerId}
      type="column"
      categories={categories}
      yLabel=""
      title=""
      legendEnabled={true}
      data={chart_data}
    />
  );
}

TimeSeriesColumnChart.propTypes = {
  name: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      val: PropTypes.number,
    }),
  ).isRequired,
};
