import { filter, has, map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  Typography,
} from "@mui/material";

import ShowResource from "@Components/common/ShowResource";
import StockRankingRow from "@Components/stock/StockRankingRow";

const StockRanking = (props) => {
  const { title, resource, top, thresholds } = props;

  const render_data = (data) => {
    const rows = map(data.objects, (d) => {
      let { stats } = d;
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
          }
          return s.val <= threshold_value;
        });
      }

      // FILTER: showing the top N items.
      let ranks = stats;
      if (top) {
        ranks = ranks.slice(0, parseInt(top, 10));
      }

      // render
      return (
        <ListItem key={d.name} divider>
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
};

StockRanking.propTypes = {
  title: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
  highlights: PropTypes.node.isRequired,
  top: PropTypes.number,
  thresholds: PropTypes.node,
  handle_ratio_change: PropTypes.func,
};

export default StockRanking;
