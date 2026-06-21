import React, { useContext, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { HeatmapChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

import { useResource } from "@/api";
import { useChartTheme } from "@/hooks/useChartTheme";
import SectorDetailContext from "../SectorDetailView/context";

echarts.use([
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

const SectorMacroCorrelationView = () => {
  const sector = useContext(SectorDetailContext);
  const theme = useChartTheme();
  const { data: correlations } = useResource(
    "macro-correlations",
    "/macro-correlations/",
  );

  const option = useMemo(() => {
    if (
      !correlations ||
      !Array.isArray(correlations) ||
      correlations.length === 0
    )
      return null;

    // Filter to 365-day window only for clarity
    const filtered = correlations.filter((c) => c.window_days === 365);
    if (filtered.length === 0) return null;

    // Build axes
    const symbols = [...new Set(filtered.map((c) => c.symbol))].sort();
    const seriesIds = [...new Set(filtered.map((c) => c.series_id))];

    // Filter to sector stocks
    const sectorSymbols = sector?.stocks_detail?.map((s) => s.symbol) || [];
    const visibleSymbols = symbols.filter(
      (s) => sectorSymbols.length === 0 || sectorSymbols.includes(s),
    );

    if (visibleSymbols.length === 0) return null;

    // Build heatmap data: [seriesIdx, symbolIdx, correlation]
    const data = [];
    filtered.forEach((c) => {
      const xi = seriesIds.indexOf(c.series_id);
      const yi = visibleSymbols.indexOf(c.symbol);
      if (xi >= 0 && yi >= 0) {
        data.push([xi, yi, parseFloat(c.correlation.toFixed(3))]);
      }
    });

    return {
      tooltip: {
        formatter: (p) =>
          `${visibleSymbols[p.value[1]]} vs ${seriesIds[p.value[0]]}<br/>r = ${
            p.value[2]
          }`,
      },
      xAxis: {
        type: "category",
        data: seriesIds,
        axisLabel: { rotate: 45 },
      },
      yAxis: {
        type: "category",
        data: visibleSymbols,
      },
      visualMap: {
        min: -1,
        max: 1,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        inRange: {
          color: ["#c62828", "#ffcdd2", "#ffffff", "#c8e6c9", "#2e7d32"],
        },
      },
      series: [
        {
          type: "heatmap",
          data,
          label: { show: true, fontSize: 10 },
          itemStyle: { borderWidth: 1, borderColor: "#fff" },
        },
      ],
    };
  }, [correlations, sector]);

  if (!option) {
    return (
      <Typography color="text.secondary">
        No macro correlation data. Run: python manage.py
        compute_macro_correlations
      </Typography>
    );
  }

  const height = Math.max(300, (option.yAxis.data.length || 5) * 35 + 80);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Stock–Macro Correlation (365-day window)
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Pearson r: green = moves with macro, red = moves against
      </Typography>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        theme={theme}
        style={{ height }}
      />
    </Box>
  );
};

export default SectorMacroCorrelationView;
