import React, { useContext, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { dispose, init } from "klinecharts";

import { Box, Card, CardContent, useTheme } from "@mui/material";

import StockHistoricalContext from "@Views/stock/StockHistoricalView/context";

// Map our route :type to a klinecharts built-in indicator. Each entry says
// which indicator to create and whether it goes on the main candle pane
// (overlay) or its own sub-pane.
const INDICATOR_BY_TYPE = {
  bollinger: { name: "BOLL", overlay: true },
  macd: { name: "MACD", overlay: false },
  rsi: { name: "RSI", overlay: false },
  sar: { name: "SAR", overlay: true },
  stochastics: { name: "KDJ", overlay: false },
  elder: { name: "MA", overlay: true },
  heikin: { name: "MA", overlay: true }, // v9 has no native Heikin-Ashi candle
};

// Convert our historical rows to klinecharts kline data.
const toKLineData = (rows) =>
  rows
    .map((d) => ({
      timestamp: new Date(d.on).getTime(),
      open: d.open_price,
      high: d.high_price,
      low: d.low_price,
      close: d.close_price,
      volume: d.vol,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

const TechIndicatorView = () => {
  const { type } = useParams();
  const theme = useTheme();
  const data = useContext(StockHistoricalContext);
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    if (!Array.isArray(data) || data.length === 0) return undefined;

    const grid = theme.palette.divider;
    const axisText = theme.palette.text.secondary;
    const up = theme.palette.success.main;
    const down = theme.palette.error.main;

    const chart = init(el, {
      styles: {
        grid: {
          horizontal: { color: grid },
          vertical: { color: grid },
        },
        candle: {
          type: "candle_solid",
          bar: {
            upColor: up,
            downColor: down,
            noChangeColor: axisText,
          },
          priceMark: {
            high: { color: axisText },
            low: { color: axisText },
          },
          tooltip: { text: { color: theme.palette.text.primary } },
        },
        indicator: {
          tooltip: { text: { color: theme.palette.text.primary } },
        },
        xAxis: { axisLine: { color: grid }, tickText: { color: axisText } },
        yAxis: { axisLine: { color: grid }, tickText: { color: axisText } },
        crosshair: {
          horizontal: { text: { backgroundColor: theme.palette.primary.main } },
          vertical: { text: { backgroundColor: theme.palette.primary.main } },
        },
      },
    });
    chartRef.current = chart;

    chart.applyNewData(toKLineData(data));

    // Always show volume in its own pane.
    chart.createIndicator("VOL", false, { id: "pane_vol" });

    // Add the indicator for the current route type.
    const spec = INDICATOR_BY_TYPE[type] || INDICATOR_BY_TYPE.elder;
    if (spec.overlay) {
      // Overlay on the main candle pane.
      chart.createIndicator(spec.name, true, { id: "candle_pane" });
    } else {
      // Own sub-pane below price/volume.
      chart.createIndicator(spec.name, false, { id: `pane_${spec.name}` });
    }

    return () => {
      dispose(el);
      chartRef.current = null;
    };
  }, [data, type, theme]);

  return (
    <Card>
      <CardContent>
        <Box
          ref={containerRef}
          sx={{ width: "100%", height: 600 }}
          data-testid="kline-chart"
        />
      </CardContent>
    </Card>
  );
};

export default TechIndicatorView;
