import React from "react";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "src/components/Highchart";
import { map, isUndefined } from "lodash";
import PropTypes from "prop-types";

export default function TimeSeriesColumnChart(props) {
  const containerId = randomId();
  const { data, name } = props;
  const categories = map(data, d => d.on);
  const chart_data = [
    {
      name: name,
      data: map(data, d => d.val),
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
    })
  ).isRequired,
};
