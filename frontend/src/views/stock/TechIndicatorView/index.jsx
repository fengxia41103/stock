import { map } from "lodash";
import React, { useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import indicatorsModule from "highcharts/indicators/indicators";
import bollingerModule from "highcharts/indicators/bollinger-bands";
import macdModule from "highcharts/indicators/macd";
import rsiModule from "highcharts/indicators/rsi";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";

import StockHistoricalContext from "@Views/stock/StockHistoricalView/context";

// Initialize Highcharts modules
indicatorsModule(Highcharts);
bollingerModule(Highcharts);
macdModule(Highcharts);
rsiModule(Highcharts);

// Simple moving average (for fallback indicators)
const sma = (data, period) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue; }
    const slice = data.slice(i - period + 1, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  return result;
};

const TechIndicatorView = () => {
  const { type } = useParams();
  const data = useContext(StockHistoricalContext);

  const options = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null;

    const dates = data.map((d) => new Date(d.on).getTime());
    const ohlc = data.map((d) => [new Date(d.on).getTime(), d.open_price, d.high_price, d.low_price, d.close_price]);
    const volumes = data.map((d) => [new Date(d.on).getTime(), d.vol]);
    const closes = data.map((d) => d.close_price);

    const titles = {
      bollinger: "Bollinger Bands",
      stochastics: "Stochastics",
      macd: "MACD",
      sar: "Parabolic SAR",
      rsi: "RSI",
      elder: "Elder Ray",
      heikin: "Heikin-Ashi",
    };

    const baseOptions = {
      chart: { backgroundColor: "transparent", height: 600 },
      title: { text: titles[type] || "Technical Indicator", style: { color: "#e2e8f0" } },
      credits: { enabled: false },
      rangeSelector: {
        selected: 2,
        buttons: [
          { type: "month", count: 1, text: "1M" },
          { type: "month", count: 3, text: "3M" },
          { type: "month", count: 6, text: "6M" },
          { type: "year", count: 1, text: "1Y" },
          { type: "all", text: "All" },
        ],
        buttonTheme: { fill: "#334155", stroke: "#475569", style: { color: "#e2e8f0" } },
        inputStyle: { color: "#e2e8f0" },
        labelStyle: { color: "#94a3b8" },
      },
      navigator: { enabled: true },
      scrollbar: { enabled: false },
      tooltip: { backgroundColor: "#1e293b", borderColor: "#475569", style: { color: "#f8fafc" } },
      xAxis: { gridLineColor: "#334155" },
      yAxis: [
        { labels: { style: { color: "#94a3b8" } }, gridLineColor: "#334155", height: "60%", resize: { enabled: true } },
        { labels: { style: { color: "#94a3b8" } }, gridLineColor: "#334155", top: "65%", height: "15%", offset: 0 },
      ],
      legend: { enabled: true, itemStyle: { color: "#e2e8f0" } },
      series: [
        { type: "candlestick", id: "price", name: "Price", data: ohlc, color: "#ef4444", upColor: "#10b981", lineColor: "#ef4444", upLineColor: "#10b981" },
        { type: "column", name: "Volume", data: volumes, yAxis: 1, color: "#3b82f680" },
      ],
    };

    // Add indicator-specific series
    if (type === "bollinger") {
      baseOptions.series.push({
        type: "bb",
        linkedTo: "price",
        params: { period: 20, standardDeviation: 2 },
        color: "#f59e0b",
        lineWidth: 1,
      });
    } else if (type === "macd") {
      baseOptions.yAxis.push({
        labels: { style: { color: "#94a3b8" } },
        gridLineColor: "#334155",
        top: "82%",
        height: "18%",
        offset: 0,
      });
      baseOptions.yAxis[0].height = "50%";
      baseOptions.yAxis[1].top = "55%";
      baseOptions.yAxis[1].height = "12%";
      baseOptions.series.push({
        type: "macd",
        linkedTo: "price",
        yAxis: 2,
        params: { shortPeriod: 12, longPeriod: 26, signalPeriod: 9 },
      });
    } else if (type === "rsi") {
      baseOptions.yAxis.push({
        labels: { style: { color: "#94a3b8" } },
        gridLineColor: "#334155",
        top: "82%",
        height: "18%",
        offset: 0,
        min: 0,
        max: 100,
        plotLines: [
          { value: 70, color: "#ef4444", dashStyle: "Dash", width: 1, label: { text: "70", style: { color: "#ef4444" } } },
          { value: 30, color: "#10b981", dashStyle: "Dash", width: 1, label: { text: "30", style: { color: "#10b981" } } },
        ],
      });
      baseOptions.yAxis[0].height = "50%";
      baseOptions.yAxis[1].top = "55%";
      baseOptions.yAxis[1].height = "12%";
      baseOptions.series.push({
        type: "rsi",
        linkedTo: "price",
        yAxis: 2,
        params: { period: 14 },
        color: "#8b5cf6",
      });
    } else {
      // Default: SMA overlays
      const sma20 = sma(closes, 20);
      const sma50 = sma(closes, 50);
      baseOptions.series.push(
        { type: "line", name: "SMA20", data: dates.map((d, i) => [d, sma20[i]]), color: "#f59e0b", lineWidth: 1, marker: { enabled: false } },
        { type: "line", name: "SMA50", data: dates.map((d, i) => [d, sma50[i]]), color: "#ec4899", lineWidth: 1, marker: { enabled: false } },
      );
    }

    return baseOptions;
  }, [data, type]);

  if (!options) return null;

  return (
    <Card>
      <CardContent>
        <Box>
          <HighchartsReact
            highcharts={Highcharts}
            constructorType="stockChart"
            options={options}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TechIndicatorView;
