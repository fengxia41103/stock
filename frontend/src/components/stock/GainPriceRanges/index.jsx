import React from "react";
import { map, filter, minBy, range, reverse } from "lodash";
import PropTypes from "prop-types";
import { Grid, List, ListItem, Chip } from "@material-ui/core";
import ColoredNumber from "src/components/common/ColoredNumber";

export default function GainPriceRanges(props) {
  const STEP = 10;
  const { data } = props;

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
    let min_price = minBy(gain, d => d.open_price);
    if (!!min_price) min_price = min_price.open_price;

    // result
    return { ...{ min_price }, ...threshold };
  });

  const content = map(range_data, d => {
    const range = `${d.upper} -- ${d.lower}%`;

    return (
      <ListItem key={d.upper} divider={true}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs>
            <Chip label={range} variant="default" color="primary" />
          </Grid>
          <Grid item xs>
            <ColoredNumber val={d.min_price} />
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
      on: PropTypes.string,
      close_price: PropTypes.number,
      gain_probability: PropTypes.number,
    })
  ).isRequired,
};
