import React, { useContext } from "react";
import { map, filter } from "lodash";
import Fetch from "src/components/common/Fetch";
import StockRankingRow from "src/components/stock/StockRankingRow";
import GlobalContext from "src/context";
import PropTypes from "prop-types";
import { List, ListItem } from "@material-ui/core";

export default function StockRanking(props) {
  const { api } = useContext(GlobalContext);
  const { resource, top, thresholds } = props;

  const render_data = data => {
    const rows = map(data.objects, d => {
      let stats = d.stats;
      let threshold = null;

      // if this value has a threshold
      if (thresholds.hasOwnProperty(d.name)) {
        threshold = thresholds[d.name];
        const tmp = threshold.split("=");

        // if malformat, do nothing!
        if (tmp.length !== 2) return;

        const sign = tmp[0];
        const threshold_value = parseFloat(tmp[1]);

        // filter stats based on threhold value
        stats = filter(stats, s => {
          if (sign === ">") {
            return s.val >= threshold_value;
          } else {
            return s.val <= threshold_value;
          }
        });
      }

      // FILTER: showing the top N items.
      const ranks = stats.slice(0, parseInt(top));

      // render
      return (
        <ListItem key={d.name} divider={true}>
          <StockRankingRow
            category={d.name}
            {...{ ranks, threshold }}
            {...props}
          />
        </ListItem>
      );
    });

    return <List>{rows}</List>;
  };
  return <Fetch {...{ api, resource, render_data }} />;
}

StockRanking.propTypes = {
  resource: PropTypes.string.isRequired,
  top: PropTypes.number.isRequired,
  thresholds: PropTypes.object,
  handle_ratio_change: PropTypes.func,
  highlights: PropTypes.object,
};
