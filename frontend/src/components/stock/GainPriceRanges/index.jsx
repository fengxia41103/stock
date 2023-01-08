import { filter, findIndex, last, map, minBy, range, reverse } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import GaugeChart from "react-gauge-chart";

import FlagIcon from "@mui/icons-material/Flag";
import { Box, Chip, Grid, List, ListItem, Tooltip } from "@mui/material";

import { ColoredNumber } from "@fengxia41103/storybook";

export default function GainPriceRanges(props) {
  const STEP = 10;
  const { data } = props;
  const total_data_count = data.length;
  const last_price = last(data).close_price;

  const ranges = map(reverse(range(100 / STEP)), (range_index) => {
    const lower = range_index * STEP;
    const upper = (range_index + 1) * STEP;
    return { ...{ lower, upper } };
  });

  const range_data = map(ranges, (threshold) => {
    // get data within thresholds
    const gain = filter(
      data,
      (d) =>
        d.gain_probability > threshold.lower &&
        d.gain_probability <= threshold.upper,
    );

    // map this range into price ranges
    let gain_window = null;
    let min_price = null;
    const buy_at = minBy(gain, (d) => d.open_price);
    if (buy_at) {
      // this is the price to buy
      min_price = buy_at.open_price;

      // By counting how many trading days left in this period, we measure a
      // gain_window value, 0-100, 0 meaning this is the last date of the
      // period, 100meaning this is the first date of the period.
      gain_window = Math.floor(
        ((data.length - findIndex(data, buy_at)) / total_data_count) * 100,
      );
    }
    // result
    return { ...{ min_price, gain_window }, ...threshold };
  });

  const content = map(range_data, (d) => {
    const range = `${d.upper} -- ${d.lower}%`;

    return (
      <ListItem key={range} divider={true}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs>
            <Tooltip title="Chance to make a gain">
              <Chip label={range} variant="default" color="primary" />
            </Tooltip>
          </Grid>
          <Grid item xs>
            <ColoredNumber val={d.min_price} />
          </Grid>
          <Grid item xs>
            {d.gain_window ? (
              <Tooltip
                title={`Likelyhood to get out (0-100): ${d.gain_window}`}
              >
                <Box>
                  <GaugeChart
                    id={range}
                    nrOfLevels={total_data_count}
                    style={{ width: "100px" }}
                    arcsLength={[0.33, 0.34, 0.33]}
                    colors={["#5BE12C", "#F5CD19", "#EA4228"]}
                    percent={d.gain_window / 100}
                    hideText={true}
                  />
                </Box>
              </Tooltip>
            ) : null}
          </Grid>
          <Grid item xs>
            {last_price <= d.min_price ? <FlagIcon /> : null}
          </Grid>
        </Grid>
      </ListItem>
    );
  });
  return <List>{content}</List>;
}

GainPriceRanges.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      open_price: PropTypes.number,
      close_price: PropTypes.number,
      gain_probability: PropTypes.number,
    }),
  ).isRequired,
};
