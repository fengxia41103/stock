import { timeParse } from "d3-time-format";
import { map } from "lodash";
import React, { useContext } from "react";
import { useParams } from "react-router-dom";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";

import StockHistoricalContext from "src/views/stock/StockHistoricalView/context";

import CandleStickChartWithBollingerBandOverlay from "./bollinger";
import OHLCChartWithElderRayIndicator from "./elder";
import HeikinAshi from "./heikin";
import CandleStickChartWithMACDIndicator from "./macd";
import CandleStickChartWithRSIIndicator from "./rsi";
import CandleStickChartWithSAR from "./sar";
import CandleStickChartWithFullStochasticsIndicator from "./stochastics";

const TechIndicatorView = () => {
  const { type } = useParams();
  const data = useContext(StockHistoricalContext);

  const parseDate = timeParse("%Y-%m-%d");

  // TODO: backend data point naming is different from what these
  // charts want. So need to do a mapping here.
  const chart_data = map(data, (d) => {
    return {
      date: parseDate(d.on),
      open: d.open_price,
      close: d.close_price,
      high: d.high_price,
      low: d.low_price,
      volume: d.vol,
    };
  });

  let title = null;
  let chart = null;
  switch (type) {
    case "bollinger":
      title = "Bollinger Bands Indicator";
      chart = <CandleStickChartWithBollingerBandOverlay data={chart_data} />;
      break;

    case "stochastics":
      title = "Full Stochastics Indicator";
      chart = (
        <CandleStickChartWithFullStochasticsIndicator data={chart_data} />
      );
      break;

    case "macd":
      title = "MACD Indicator";
      chart = <CandleStickChartWithMACDIndicator data={chart_data} />;
      break;

    case "sar":
      title = "Parabolic SAR Indicator";
      chart = <CandleStickChartWithSAR data={chart_data} />;
      break;

    case "rsi":
      title = "Relative Strength Index (RSI) Indicator";
      chart = <CandleStickChartWithRSIIndicator data={chart_data} />;
      break;

    case "elder":
      title = "Elder Ray Indicator";
      chart = <OHLCChartWithElderRayIndicator data={chart_data} />;
      break;

    case "heikin":
      title = "Heikin-Ashi Indicator";
      chart = <HeikinAshi data={chart_data} />;
      break;

    default:
      title = "Parabolic SAR Indicator";
      chart = <CandleStickChartWithSAR data={chart_data} />;
      break;
  }
  return (
    <Card>
      <CardHeader title={<Typography variant="h3">{title}</Typography>} />
      <CardContent>
        <Box mt={2}>{chart}</Box>
      </CardContent>
    </Card>
  );
};

export default TechIndicatorView;
