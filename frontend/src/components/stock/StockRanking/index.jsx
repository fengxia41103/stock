import React from "react";
import { map, filter } from "lodash";
import ShowResource from "src/components/common/ShowResource";
import StockRankingRow from "src/components/stock/StockRankingRow";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";

export default function StockRanking(props) {
  const { title, resource, top, thresholds } = props;

  const render_data = (data) => {
    const rows = map(data.objects, (d) => {
      let stats = d.stats;
      let threshold = null;

      // if this value has a threshold
      if (!!thresholds && thresholds.hasOwnProperty(d.name)) {
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
      if (!!top) {
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
