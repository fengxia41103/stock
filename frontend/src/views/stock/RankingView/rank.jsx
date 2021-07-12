import React, { useContext } from "react";
import { map, filter } from "lodash";
import Fetch from "src/components/Fetch";
import Row from "./row.jsx";
import GlobalContext from "src/context";

function Rank(props) {
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
        <Row
          key={d.name}
          category={d.name}
          {...{ ranks, threshold }}
          {...props}
        />
      );
    });

    return <>{rows}</>;
  };
  return <Fetch {...{ api, resource, render_data }} />;
}

export default Rank;
