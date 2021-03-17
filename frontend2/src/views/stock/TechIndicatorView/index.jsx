import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context.jsx";
import { map } from "lodash";
import { timeParse } from "d3-time-format";
import CandleStickChartWithBollingerBandOverlay from "./bollinger.jsx";
import CandleStickChartWithFullStochasticsIndicator from "./stochastics.jsx";
import CandleStickChartWithMACDIndicator from "./macd.jsx";
import CandleStickChartWithSAR from "./sar.jsx";
import CandleStickChartWithRSIIndicator from "./rsi.jsx";
import OHLCChartWithElderRayIndicator from "./elder.jsx";
import HeikinAshi from "./heikin.jsx";

export default function TechIndicatorView() {
  const { type } = useParams();
  const { olds: data } = useContext(StockHistoricalContext);

  const parseDate = timeParse("%Y-%m-%d");

  // TODO: backend data point naming is different from what these
  // charts want. So need to do a mapping here.
  const chart_data = map(data, d => {
    return {
      date: parseDate(d.on),
      open: d.open_price,
      close: d.close_price,
      high: d.high_price,
      low: d.low_price,
      volume: d.vol,
    };
  });

  let chart = null;
  switch (type) {
    case "bollinger":
      chart = <CandleStickChartWithBollingerBandOverlay data={chart_data} />;
      break;

    case "stochastics":
      chart = (
        <CandleStickChartWithFullStochasticsIndicator data={chart_data} />
      );
      break;

    case "macd":
      chart = <CandleStickChartWithMACDIndicator data={chart_data} />;
      break;

    case "sar":
      chart = <CandleStickChartWithSAR data={chart_data} />;
      break;

    case "rsi":
      chart = <CandleStickChartWithRSIIndicator data={chart_data} />;
      break;

    case "elder":
      chart = <OHLCChartWithElderRayIndicator data={chart_data} />;
      break;

    case "heikin":
      chart = <HeikinAshi data={chart_data} />;
      break;

    default:
      chart = null;
      break;
  }
  return chart;
}
