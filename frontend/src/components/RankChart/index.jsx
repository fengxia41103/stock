import React from "react";
import { map } from "lodash";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "src/components/Highchart";
import PropTypes from "prop-types";
import { isUndefined } from "lodash";

export default function RankChart(props) {
  const { category, ranks, rank_val_name } = props;

  // charting the vals. I found using chart is easier to gauge
  // relative strength. However, it takes a lot of screen
  // space. Thus I'm making it toggle.
  const containerId = randomId();
  const categories = map(ranks, r => r.symbol);
  const chart_data = [
    {
      name: category,
      data: map(ranks, r =>
        isUndefined(rank_val_name) ? r.val : r[rank_val_name]
      ),
    },
  ];

  return (
    <HighchartGraphBox
      containerId={containerId}
      type="bar"
      categories={categories}
      yLabel=""
      title=""
      legendEnabled={true}
      data={chart_data}
    />
  );
}

RankChart.propTypes = {
  category: PropTypes.string.isRequired,
  ranks: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string,
      val: PropTypes.number,
    })
  ).isRequired,

  // optional, which is my rank value?
  // default to ".val" if not given
  rank_val_name: PropTypes.string,
};
