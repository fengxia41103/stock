import React from "react";
import { map, isEmpty, isUndefined } from "lodash";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "src/components/Highchart";
import PropTypes from "prop-types";

export default function MultilineChart(props) {
  const { data, category_by, label_by, data_by, normalized } = props;
  if (isEmpty(data)) return null;

  const containerId = randomId();

  let categories;
  if (isUndefined(category_by)) {
    categories = [];
  } else {
    categories = map(data[0].data, d => d[category_by]);
  }

  const chart_data = map(data, d => {
    return {
      name: d[label_by],
      data: map(d.data, n => n[data_by]),
    };
  });

  return (
    <HighchartGraphBox
      containerId={containerId}
      type="line"
      categories={categories}
      yLabel=""
      title=""
      legendEnabled={true}
      data={chart_data}
      normalize={!isUndefined(normalized)}
    />
  );
}

MultilineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.arrayOf(PropTypes.object).isRequired,
    })
  ).isRequired,
  category_by: PropTypes.string,
  label_by: PropTypes.string.isRequired,
  data_by: PropTypes.string.isRequired,
  normalize: PropTypes.any,
};