import React from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  CardHeader,
} from "@material-ui/core";
import PropTypes from "prop-types";

import ABDonutChart from "src/components/common/ABDonutChart";
import DictCard from "src/components/common/DictCard";
import TimeSeriesColumnChart from "src/components/common/TimeSeriesColumnChart";

export default function PriceReturnStat(props) {
  const { data } = props;

  const interests = {
    mean: `Average ${data.name} (%)`,
    median: `Median ${data.name} (%)`,
    max: `Max ${data.name} (%)`,
    min: `Min ${data.name} (%)`,
    range: `Range of ${data.name} (%)`,
    stdev: `Standard Deviation of ${data.name} (%)`,
    var: `Variance of ${data.name} (%)`,
    skewness: `Skewness of ${data.name} (%)`,
    kurtosis: `Kurtosis of ${data.name}`,
    product: `Compounded Overall ${data.name} (%)`,
    positive_mean: `Average Positive ${data.name} (%)`,
    negative_mean: `Average Negative ${data.name} (%)`,
  };

  const positive_negative_chart_data = {
    name: data.name,
    A: {
      label: "positive",
      val: data.stats.positive_count,
    },
    B: {
      label: "negative",
      val: data.stats.negative_count,
    },
  };

  return (
    <>
      <Card>
        <CardHeader title={<Typography variant="h3">{data.name}</Typography>} />
        <CardContent>
          <TimeSeriesColumnChart data={data.returns} name={data.name} />
        </CardContent>
      </Card>

      <Box mt={1}>
        <ABDonutChart data={positive_negative_chart_data} />
      </Box>
      <Box mt={1}>
        <Card>
          <CardHeader
            title={
              <Typography variant="h3">Statistic of {data.name}</Typography>
            }
          />
          <CardContent>
            <DictCard data={data.stats} interests={interests} />
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

PriceReturnStat.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    returns: PropTypes.array,
    stats: PropTypes.object,
  }).isRequired,
};
