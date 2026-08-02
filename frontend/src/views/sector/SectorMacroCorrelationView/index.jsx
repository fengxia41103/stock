import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import heatmapModule from "highcharts/modules/heatmap";

import { useResource } from "@/api";
import SectorDetailContext from "../SectorDetailView/context";

heatmapModule(Highcharts);

const SectorMacroCorrelationView = () => {
  const sector = useContext(SectorDetailContext);
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

    // Build heatmap data: [x, y, value]
    const data = [];
    filtered.forEach((c) => {
      const xi = seriesIds.indexOf(c.series_id);
      const yi = symbols.indexOf(c.symbol);
      if (xi >= 0 && yi >= 0) {
        data.push([xi, yi, parseFloat(c.correlation.toFixed(3))]);
      }
    });

    const height = Math.max(350, symbols.length * 40 + 100);

    return {
      visibleSymbols: symbols,
      option: {
        chart: {
          type: "heatmap",
          backgroundColor: "transparent",
          height,
        },
        title: { text: undefined },
        xAxis: {
          categories: seriesIds,
          labels: {
            rotation: -30,
            style: { color: "#94a3b8", fontSize: "11px" },
          },
          opposite: true,
          lineColor: "#334155",
        },
        yAxis: {
          categories: symbols,
          title: { text: null },
          labels: {
            style: {
              color: "#94a3b8",
              fontSize: "12px",
              fontWeight: "bold",
            },
          },
          gridLineColor: "#334155",
        },
        colorAxis: {
          min: -0.3,
          max: 0.3,
          stops: [
            [0, "#c62828"],
            [0.25, "#ef9a9a"],
            [0.5, "#f5f5f5"],
            [0.75, "#a5d6a7"],
            [1, "#2e7d32"],
          ],
        },
        tooltip: {
          formatter: function () {
            return (
              `<b>${symbols[this.point.y]}</b> vs ${seriesIds[this.point.x]}` +
              `<br/>r = ${this.point.value}`
            );
          },
          style: { color: "#94a3b8" },
          backgroundColor: "#1e293b",
          borderColor: "#334155",
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { color: "#94a3b8" },
        },
        plotOptions: {
          heatmap: {
            borderWidth: 2,
            borderColor: "#334155",
            dataLabels: {
              enabled: true,
              format: "{point.value:.2f}",
              style: {
                color: "#1e293b",
                textOutline: "none",
                fontSize: "11px",
              },
            },
            cursor: "pointer",
            point: {
              events: {
                click: function () {
                  const symbol = symbols[this.y];
                  const id = stockMap[symbol];
                  if (id) navigate(`/stocks/${id}/historical/price`);
                },
              },
            },
          },
        },
        series: [
          {
            name: "Correlation",
            data,
          },
        ],
        credits: { enabled: false },
      },
    };
  }, [correlations, sector, stockMap, navigate]);

  if (!option) {
    return (
      <Typography color="text.secondary">
        No macro correlation data for this sector. Run: python manage.py
        compute_macro_correlations
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Stock–Macro Correlation (365-day window)
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={1}>
        Pearson r: green = moves with macro, red = moves against. Click a stock
        to view details.
      </Typography>
      <HighchartsReact highcharts={Highcharts} options={option} />
    </Box>
  );
};

export default SectorMacroCorrelationView;
