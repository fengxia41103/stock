import React, { useContext } from "react";
import { map, filter } from "lodash";
import Fetch from "src/components/common/Fetch";
import StockRankingRow from "src/components/stock/StockRankingRow";
import GlobalContext from "src/context";
import PropTypes from "prop-types";

export default function StockRanking(props) {
  const { api } = useContext(GlobalContext);
  const { resource, top, thresholds } = props;

  const render_data = data => {
    const rows = map(data.objects, d => {
      let stats = d.stats;
      let threshold = null;

      if (thresholds.hasOwnProperty(d.name)) {
        threshold = thresholds[d.name];
        const tmp = threshold.split("=");

        // if malformat, do nothing!
        if (tmp.length !== 2) return;

        const sign = tmp[0];
        const threshold_value = parseFloat(tmp[1]);

        stats = filter(stats, s => {
          if (sign === ">") {
            return s.val >= threshold_value;
          } else {
            return s.val <= threshold_value;
          }
        });
      }

      // FILTER: showing the top N items.
      const ranks = stats.slice(0, top);
      return (
        <StockRankingRow
          key={d.name}
          category={d.name}
          {...{ ranks, threshold }}
          {...props}
        />
      );
    });

    return rows;
  };
  return <Fetch {...{ api, resource, render_data }} />;
}

StockRanking.propTypes = {
  resource: PropTypes.string.isRequired,
  top: PropTypes.number.isRequired,
  thresholds: PropTypes.object,
  handle_ratio_change: PropTypes.func,
  highlights: PropTypes.array,
};
