import React from "react";
import { map, last, filter, minBy, range, reverse, findIndex } from "lodash";
import PropTypes from "prop-types";
import { Box, Grid, List, ListItem, Chip, Tooltip } from "@material-ui/core";
import ColoredNumber from "src/components/common/ColoredNumber";
import moment from "moment";
import GaugeChart from "react-gauge-chart";

export default function GainPriceRanges(props) {
  const STEP = 10;
  const { data } = props;
  const last_one = last(data);
  const total_data_count = data.length;

  const ranges = map(reverse(range(100 / STEP)), range_index => {
    const lower = range_index * STEP;
    const upper = (range_index + 1) * STEP;
    return { ...{ lower, upper } };
  });

  const range_data = map(ranges, threshold => {
    // get data within thresholds
    const gain = filter(
      data,
      d =>
        d.gain_probability > threshold.lower &&
        d.gain_probability <= threshold.upper
    );

    // map this range into price ranges
    let age = 0,
      min_price = null;
    const buy_at = minBy(gain, d => d.open_price);
    if (!!buy_at) {
      // this is the price to buy
      min_price = buy_at.open_price;

      // how many days is this strategy valid?
      const me = moment(buy_at.on);
      const last = moment(last_one.on);
      age = last.diff(me, "days");
      age = data.length - findIndex(data, buy_at);
    }
    // result
    return { ...{ min_price, age }, ...threshold };
  });

  const content = map(range_data, d => {
    const range = `${d.upper} -- ${d.lower}%`;

    return (
      <ListItem key={range} divider={true}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs>
            <Chip label={range} variant="default" color="primary" />
          </Grid>
          <Grid item xs>
            <ColoredNumber val={d.min_price} />
          </Grid>
          <Grid item xs>
            {!!d.age ? (
              <Tooltip title="Risk Guage">
                <Box>
                  <GaugeChart
                    id={range}
                    nrOfLevels={total_data_count}
                    style={{ width: "100px" }}
                    arcsLength={[0.33, 0.34, 0.33]}
                    colors={["#5BE12C", "#F5CD19", "#EA4228"]}
                    percent={d.age / total_data_count}
                    hideText={true}
                  />
                </Box>
              </Tooltip>
            ) : null}
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
      gain_probability: PropTypes.number,
    })
  ).isRequired,
};
