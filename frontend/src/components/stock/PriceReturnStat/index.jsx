import React, { useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardHeader,
} from "@material-ui/core";
import TimeSeriesColumnChart from "src/components/TimeSeriesColumnChart";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";
import DictCard from "src/components/DictCard";
import { daily_returns, daily_return_stats } from "src/utils/stock/returns";

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
    product: `Compounded Overall ${data.name}`,
    positive_mean: `Average Positive ${data.name} (%)`,
    negative_mean: `Average Negative ${data.name} (%)`,
  };

  return (
    <Box>
      <Card>
        <CardHeader title={<Typography variant="h3">{data.name}</Typography>} />
        <CardContent>
          <TimeSeriesColumnChart data={data.returns} name={data.name} />
        </CardContent>
      </Card>

      <Box mt={3}>
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
    </Box>
  );
}
