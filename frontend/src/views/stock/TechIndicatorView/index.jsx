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
  heikin: { name: "MA", overlay: true }, // candles are converted to Heikin-Ashi
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

// Transform OHLC into Heikin-Ashi candles (smoothed trend candles).
//   HA close = (O+H+L+C)/4
//   HA open  = (prev HA open + prev HA close)/2  (seeded with (O+C)/2)
//   HA high  = max(H, HA open, HA close);  HA low = min(L, HA open, HA close)
const toHeikinAshi = (bars) => {
  const out = [];
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const haClose = (b.open + b.high + b.low + b.close) / 4;
    const haOpen =
      i === 0
        ? (b.open + b.close) / 2
        : (out[i - 1].open + out[i - 1].close) / 2;
    out.push({
      timestamp: b.timestamp,
      open: haOpen,
      close: haClose,
      high: Math.max(b.high, haOpen, haClose),
      low: Math.min(b.low, haOpen, haClose),
      volume: b.volume,
    });
  }
  return out;
};

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

    const bars = toKLineData(data);
    const klineData = type === "heikin" ? toHeikinAshi(bars) : bars;
    chart.applyNewData(klineData);

    // Fit the data to the full chart width: size each bar so the whole series
    // spans the container (klinecharts otherwise shows the most-recent bars at
    // a fixed bar width, squeezing short series to the right). Keep a small
    // floor/ceiling so very short or very long series stay usable.
    const fitToWidth = () => {
      const { width } = chart.getSize("candle_pane", "main") || { width: 0 };
      if (width > 0 && klineData.length > 0) {
        const space = Math.min(
          30,
          Math.max(2, (width - 8) / klineData.length),
        );
        chart.setBarSpace(space);
      }
    };
    chart.setOffsetRightDistance(0);
    fitToWidth();

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

    // Re-fit after indicator panes change the layout, and on container resize.
    fitToWidth();
    const ro = new ResizeObserver(() => {
      chart.resize();
      fitToWidth();
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
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
