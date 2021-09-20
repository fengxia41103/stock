import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardHeader,
} from "@material-ui/core";
import { map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import ColoredNumber from "src/components/common/ColoredNumber";

export default function DictCard(props) {
  const { data, interests } = props;

  const cards = map(interests, (description, key) => {
    const val = data[key];
    return (
      <Grid item key={key} lg={4} sm={6} xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant="body2">{description}</Typography>}
          />
          <CardContent>
            <ColoredNumber {...{ val }} />
          </CardContent>
        </Card>
      </Grid>
    );
  });

  return (
    <Grid container spacing={1}>
      {cards}
    </Grid>
  );
}

DictCard.propTypes = {
  interests: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};
