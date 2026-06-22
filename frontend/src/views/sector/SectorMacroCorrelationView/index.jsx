import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { data: correlations } = useResource(
    "macro-correlations",
    "/macro-correlations/",
  );

  // Map symbol → stock id for navigation
  const stockMap = useMemo(() => {
    const map = {};
    (sector?.stocks_detail || []).forEach((s) => {
      map[s.symbol] = s.id;
    });
    return map;
  }, [sector]);

  const { option, visibleSymbols } = useMemo(() => {
    if (
      !correlations ||
      !Array.isArray(correlations) ||
      correlations.length === 0
    )
      return { option: null, visibleSymbols: [] };

    const filtered = correlations.filter((c) => c.window_days === 365);
    if (filtered.length === 0) return { option: null, visibleSymbols: [] };

    const seriesIds = [...new Set(filtered.map((c) => c.series_id))];

    // Only show stocks in this sector
    const sectorSymbols = (sector?.stocks_detail || []).map((s) => s.symbol);
    const symbols = sectorSymbols.filter((sym) =>
      filtered.some((c) => c.symbol === sym),
    );

    if (symbols.length === 0) return { option: null, visibleSymbols: [] };

    // Build heatmap data: [seriesIdx, symbolIdx, correlation]
    const data = [];
    filtered.forEach((c) => {
      const xi = seriesIds.indexOf(c.series_id);
      const yi = symbols.indexOf(c.symbol);
      if (xi >= 0 && yi >= 0) {
        data.push([xi, yi, parseFloat(c.correlation.toFixed(3))]);
      }
    });

    return {
      visibleSymbols: symbols,
      option: {
        tooltip: {
          formatter: (p) =>
            `<b>${symbols[p.value[1]]}</b> vs ${
              seriesIds[p.value[0]]
            }<br/>r = ${p.value[2]}`,
        },
        grid: { left: 80, right: 40, top: 10, bottom: 60 },
        xAxis: {
          type: "category",
          data: seriesIds,
          axisLabel: { rotate: 30, fontSize: 11 },
          position: "top",
        },
        yAxis: {
          type: "category",
          data: symbols,
          axisLabel: { fontSize: 12, fontWeight: "bold" },
        },
        visualMap: {
          min: -0.3,
          max: 0.3,
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: 0,
          inRange: {
            color: ["#c62828", "#ef9a9a", "#f5f5f5", "#a5d6a7", "#2e7d32"],
          },
        },
        series: [
          {
            type: "heatmap",
            data,
            label: {
              show: true,
              fontSize: 11,
              formatter: (p) => p.value[2].toFixed(2),
            },
            itemStyle: { borderWidth: 2, borderColor: "#fff" },
            emphasis: { itemStyle: { borderColor: "#333", borderWidth: 3 } },
          },
        ],
      },
    };
  }, [correlations, sector]);

  if (!option) {
    return (
      <Typography color="text.secondary">
        No macro correlation data for this sector. Run: python manage.py
        compute_macro_correlations
      </Typography>
    );
  }

  const height = Math.max(350, visibleSymbols.length * 40 + 100);

  const onEvents = {
    click: (params) => {
      if (params.value && params.value[1] != null) {
        const symbol = visibleSymbols[params.value[1]];
        const id = stockMap[symbol];
        if (id) navigate(`/stocks/${id}/historical/price`);
      }
    },
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Stock–Macro Correlation (365-day window)
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={1}>
        Pearson r: green = moves with macro, red = moves against. Click a stock
        to view details.
      </Typography>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        theme={theme}
        style={{ height }}
        onEvents={onEvents}
      />
    </Box>
  );
};

export default SectorMacroCorrelationView;
