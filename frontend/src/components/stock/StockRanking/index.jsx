import { ShowResource } from "@fengxia41103/storybook";
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { filter, has, map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import StockRankingRow from "src/components/stock/StockRankingRow";

export default function StockRanking(props) {
  const { title, resource, top, thresholds } = props;

  const render_data = (data) => {
    const rows = map(data.objects, (d) => {
      let stats = d.stats;
      let threshold = null;

      // if this value has a threshold
      if (!!thresholds && has(thresholds, d.name)) {
        threshold = thresholds[d.name];
        const tmp = threshold.split("=");

        // if malformat, do nothing!
        if (tmp.length !== 2) return;

        const sign = tmp[0];
        const threshold_value = parseFloat(tmp[1]);

        // filter stats based on threhold value
        stats = filter(stats, (s) => {
          if (sign === ">") {
            return s.val >= threshold_value;
          } else {
            return s.val <= threshold_value;
          }
        });
      }

      // FILTER: showing the top N items.
      let ranks = stats;
      if (top) {
        ranks = ranks.slice(0, parseInt(top));
      }

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

    return (
      <Card>
        <CardHeader
          title={
            <Typography variant="h3" color="textPrimary">
              {title}
            </Typography>
          }
        />
        <CardContent>
          <List>{rows}</List>
        </CardContent>
      </Card>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
}

StockRanking.propTypes = {
  title: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
  highlights: PropTypes.object.isRequired,
  top: PropTypes.number,
  thresholds: PropTypes.object,
  handle_ratio_change: PropTypes.func,
};
