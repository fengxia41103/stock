import PropTypes from "prop-types";
import React from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useChartTheme } from "@/hooks/useChartTheme";

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

const PriceChart = ({ data, earnings }) => {
  const theme = useChartTheme();

  const dates = data.map((d) => d.on);
  const closePrices = data.map((d) => d.close_price);
  const openPrices = data.map((d) => d.open_price);

  // Earnings markLines
  const markLineData = (earnings || [])
    .filter((e) => dates.includes(e.report_date))
    .map((e) => ({
      xAxis: e.report_date,
      lineStyle: {
        color: e.surprise_pct > 0 ? "#4caf50" : e.surprise_pct < 0 ? "#f44336" : "#9e9e9e",
        type: "dashed",
        width: 1.5,
      },
      label: {
        formatter: e.surprise_pct != null
          ? `${e.surprise_pct > 0 ? "+" : ""}${e.surprise_pct.toFixed(1)}%`
          : "📅",
        fontSize: 10,
        position: "start",
      },
    }));

  const option = {
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        const date = params[0]?.axisValue || "";
        const lines = params.map(
          (p) => `${p.marker} ${p.seriesName}: $${p.value?.toFixed(2) || "-"}`,
        );
        return `${date}<br/>${lines.join("<br/>")}`;
      },
    },
    legend: { data: ["Close", "Open"] },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: { type: "value", scale: true },
    dataZoom: [{ type: "inside" }, { type: "slider", height: 20 }],
    series: [
      {
        name: "Close",
        type: "line",
        data: closePrices,
        lineStyle: { width: 2 },
        showSymbol: false,
        markLine: markLineData.length > 0 ? {
          symbol: "none",
          data: markLineData,
        } : undefined,
      },
      {
        name: "Open",
        type: "line",
        data: openPrices,
        lineStyle: { width: 1, type: "dotted" },
        showSymbol: false,
      },
    ],
  };

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      theme={theme}
      style={{ height: 400 }}
      notMerge
    />
  );
};

PriceChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      on: PropTypes.string,
      open_price: PropTypes.number,
      close_price: PropTypes.number,
    }),
  ).isRequired,
  earnings: PropTypes.array,
};

export default PriceChart;
