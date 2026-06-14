import { map } from "lodash";
import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import ReactEChartsCore from "echarts-for-react";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";

import StockHistoricalContext from "@Views/stock/StockHistoricalView/context";

// Simple moving average
const sma = (data, period) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    const slice = data.slice(i - period + 1, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  return result;
};

// Exponential moving average
const ema = (data, period) => {
  const k = 2 / (period + 1);
  const result = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
};

// Bollinger Bands
const bollinger = (closes, period = 20, mult = 2) => {
  const mid = sma(closes, period);
  const upper = [];
  const lower = [];
  for (let i = 0; i < closes.length; i++) {
    if (mid[i] === null) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    const slice = closes.slice(Math.max(0, i - period + 1), i + 1);
    const std = Math.sqrt(
      slice.reduce((s, v) => s + (v - mid[i]) ** 2, 0) / slice.length,
    );
    upper.push(mid[i] + mult * std);
    lower.push(mid[i] - mult * std);
  }
  return { upper, mid, lower };
};

// MACD
const computeMACD = (closes) => {
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signal = ema(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signal[i]);
  return { macdLine, signal, histogram };
};

// RSI
const computeRSI = (closes, period = 14) => {
  const result = [null];
  for (let i = 1; i < closes.length; i++) {
    const slice = closes.slice(Math.max(0, i - period), i + 1);
    let gains = 0,
      losses = 0;
    for (let j = 1; j < slice.length; j++) {
      const diff = slice[j] - slice[j - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const rs = losses === 0 ? 100 : gains / losses;
    result.push(100 - 100 / (1 + rs));
  }
  return result;
};

const TechIndicatorView = () => {
  const { type } = useParams();
  const data = useContext(StockHistoricalContext);
  if (!Array.isArray(data) || data.length === 0) return null;

  const dates = map(data, (d) => d.on);
  const ohlc = map(data, (d) => [
    d.open_price,
    d.close_price,
    d.low_price,
    d.high_price,
  ]);
  const closes = map(data, (d) => d.close_price);
  const volumes = map(data, (d) => d.vol);

  const titles = {
    bollinger: "Bollinger Bands",
    stochastics: "Stochastics",
    macd: "MACD",
    sar: "Parabolic SAR",
    rsi: "RSI",
    elder: "Elder Ray",
    heikin: "Heikin-Ashi",
  };

  // Base candlestick + volume option
  const baseOption = {
    tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
    legend: { top: 0 },
    grid: [
      { left: "10%", right: "8%", top: "8%", height: "50%" },
      { left: "10%", right: "8%", top: "68%", height: "18%" },
    ],
    xAxis: [
      { type: "category", data: dates, gridIndex: 0, boundaryGap: true },
      { type: "category", data: dates, gridIndex: 1, boundaryGap: true },
    ],
    yAxis: [
      { scale: true, gridIndex: 0 },
      { scale: true, gridIndex: 1, splitNumber: 2 },
    ],
    dataZoom: [
      { type: "inside", xAxisIndex: [0, 1], start: 60, end: 100 },
      { type: "slider", xAxisIndex: [0, 1], start: 60, end: 100, top: "92%" },
    ],
    series: [
      {
        name: "Price",
        type: "candlestick",
        data: ohlc,
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
      {
        name: "Volume",
        type: "bar",
        data: volumes,
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: { color: "#7fbe9e" },
      },
    ],
  };

  // Add indicator-specific overlays
  let option = { ...baseOption };

  if (type === "bollinger") {
    const bb = bollinger(closes);
    option.series = [
      ...option.series,
      {
        name: "Upper",
        type: "line",
        data: bb.upper,
        xAxisIndex: 0,
        yAxisIndex: 0,
        lineStyle: { opacity: 0.5 },
        showSymbol: false,
      },
      {
        name: "Middle",
        type: "line",
        data: bb.mid,
        xAxisIndex: 0,
        yAxisIndex: 0,
        lineStyle: { type: "dashed" },
        showSymbol: false,
      },
      {
        name: "Lower",
        type: "line",
        data: bb.lower,
        xAxisIndex: 0,
        yAxisIndex: 0,
        lineStyle: { opacity: 0.5 },
        showSymbol: false,
      },
    ];
  } else if (type === "macd") {
    const m = computeMACD(closes);
    option.grid = [
      { left: "10%", right: "8%", top: "8%", height: "40%" },
      { left: "10%", right: "8%", top: "55%", height: "18%" },
      { left: "10%", right: "8%", top: "78%", height: "12%" },
    ];
    option.xAxis = [
      ...option.xAxis,
      { type: "category", data: dates, gridIndex: 2, boundaryGap: true },
    ];
    option.yAxis = [
      ...option.yAxis,
      { scale: true, gridIndex: 2, splitNumber: 2 },
    ];
    option.dataZoom[0].xAxisIndex = [0, 1, 2];
    option.dataZoom[1].xAxisIndex = [0, 1, 2];
    option.series = [
      ...option.series,
      {
        name: "MACD",
        type: "line",
        data: m.macdLine,
        xAxisIndex: 2,
        yAxisIndex: 2,
        showSymbol: false,
      },
      {
        name: "Signal",
        type: "line",
        data: m.signal,
        xAxisIndex: 2,
        yAxisIndex: 2,
        showSymbol: false,
      },
      {
        name: "Histogram",
        type: "bar",
        data: m.histogram,
        xAxisIndex: 2,
        yAxisIndex: 2,
      },
    ];
  } else if (type === "rsi") {
    const rsi = computeRSI(closes);
    option.grid = [
      { left: "10%", right: "8%", top: "8%", height: "40%" },
      { left: "10%", right: "8%", top: "55%", height: "18%" },
      { left: "10%", right: "8%", top: "78%", height: "12%" },
    ];
    option.xAxis = [
      ...option.xAxis,
      { type: "category", data: dates, gridIndex: 2, boundaryGap: true },
    ];
    option.yAxis = [
      ...option.yAxis,
      { scale: true, gridIndex: 2, min: 0, max: 100 },
    ];
    option.dataZoom[0].xAxisIndex = [0, 1, 2];
    option.dataZoom[1].xAxisIndex = [0, 1, 2];
    option.series = [
      ...option.series,
      {
        name: "RSI",
        type: "line",
        data: rsi,
        xAxisIndex: 2,
        yAxisIndex: 2,
        showSymbol: false,
      },
      {
        name: "Overbought",
        type: "line",
        data: dates.map(() => 70),
        xAxisIndex: 2,
        yAxisIndex: 2,
        lineStyle: { type: "dashed", color: "red" },
        showSymbol: false,
      },
      {
        name: "Oversold",
        type: "line",
        data: dates.map(() => 30),
        xAxisIndex: 2,
        yAxisIndex: 2,
        lineStyle: { type: "dashed", color: "green" },
        showSymbol: false,
      },
    ];
  } else {
    // For sar, elder, stochastics, heikin — show candlestick + SMA overlays as default
    const sma20 = sma(closes, 20);
    const sma50 = sma(closes, 50);
    option.series = [
      ...option.series,
      {
        name: "SMA20",
        type: "line",
        data: sma20,
        xAxisIndex: 0,
        yAxisIndex: 0,
        showSymbol: false,
        lineStyle: { width: 1 },
      },
      {
        name: "SMA50",
        type: "line",
        data: sma50,
        xAxisIndex: 0,
        yAxisIndex: 0,
        showSymbol: false,
        lineStyle: { width: 1 },
      },
    ];
  }

  const title = titles[type] || "Technical Indicator";

  return (
    <Card>
      <CardHeader title={<Typography variant="h3">{title}</Typography>} />
      <CardContent>
        <Box mt={2}>
          <ReactEChartsCore theme={localStorage.getItem("themeMode") === "dark" ? "dark" : undefined} option={option} style={{ height: 600 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TechIndicatorView;
