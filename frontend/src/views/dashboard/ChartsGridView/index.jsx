import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import ScaleLoader from "react-spinners/ScaleLoader";

import {
  Autocomplete,
  Box,
  Chip,
  Grid,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";

import { useResource, useStocksOverview } from "@/api";

const GREEN = "#10b981";
const RED = "#ef4444";
const AMBER = "#f59e0b";

// --- Section 1: Multi-stock normalized performance chart ---
const PerformanceChart = ({ stocks }) => {
  const [selected, setSelected] = useState(() => {
    // Default: top 5 by absolute daily return
    const sorted = [...(stocks || [])].sort(
      (a, b) =>
        Math.abs(b.daily_return_pct || 0) - Math.abs(a.daily_return_pct || 0),
    );
    return sorted.slice(0, 5).map((s) => s.symbol);
  });

  const allSymbols = useMemo(
    () => (stocks || []).map((s) => s.symbol).sort(),
    [stocks],
  );
  const stockIds = useMemo(
    () =>
      (stocks || [])
        .filter((s) => selected.includes(s.symbol))
        .map((s) => s.id),
    [stocks, selected],
  );

  const histQuery =
    stockIds.length > 0
      ? `/historicals/?stock__in=${stockIds.join(
          ",",
        )}&ordering=on&page_size=2000&on__range=${(() => {
          const end = new Date().toISOString().slice(0, 10);
          const start = new Date(Date.now() - 90 * 86400000)
            .toISOString()
            .slice(0, 10);
          return `${start},${end}`;
        })()}`
      : null;
  const { data: rawHist } = useResource(
    ["perf-chart", ...selected],
    histQuery || "/__disabled__",
    { enabled: stockIds.length > 0 },
  );

  // Handle paginated response
  const historicals = useMemo(() => {
    if (!rawHist) return [];
    if (Array.isArray(rawHist)) return rawHist;
    return rawHist.results || [];
  }, [rawHist]);

  const chartOptions = useMemo(() => {
    if (!historicals || !Array.isArray(historicals) || historicals.length === 0)
      return null;

    const byStock = {};
    historicals.forEach((h) => {
      const sym = (stocks || []).find((s) => s.id === h.stock)?.symbol || "";
      if (!byStock[sym]) byStock[sym] = [];
      byStock[sym].push({ date: h.on, price: h.close_price });
    });

    const series = Object.entries(byStock).map(([sym, data]) => {
      const base = data[0]?.price || 1;
      return {
        name: sym,
        data: data.map((d) => [
          new Date(d.date).getTime(),
          ((d.price - base) / base) * 100,
        ]),
      };
    });

    return {
      chart: { backgroundColor: "transparent", height: 300, reflow: true },
      title: { text: null },
      xAxis: { type: "datetime" },
      yAxis: { title: { text: "% Change" }, labels: { format: "{value}%" } },
      series,
      legend: { enabled: true, itemStyle: { color: "#94a3b8" } },
      credits: { enabled: false },
      tooltip: { shared: true, valueSuffix: "%", valueDecimals: 1 },
    };
  }, [historicals, stocks]);

  return (
    <Paper sx={{ p: 2, borderRadius: 2, height: "100%" }}>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing={1}
        mb={1}
      >
        Performance Comparison (Normalized)
      </Typography>
      <Autocomplete
        multiple
        size="small"
        options={allSymbols}
        value={selected}
        onChange={(_, v) => setSelected(v.slice(0, 8))}
        renderInput={(params) => (
          <TextField {...params} placeholder="Add stocks (max 8)" />
        )}
        renderTags={(value, getTagProps) =>
          value.map((sym, i) => (
            <Chip
              label={sym}
              size="small"
              {...getTagProps({ index: i })}
              key={sym}
            />
          ))
        }
        sx={{ mb: 2, maxWidth: 600 }}
      />
      {chartOptions ? (
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      ) : (
        <Typography color="text.secondary" py={4} textAlign="center">
          Select stocks above to compare performance
        </Typography>
      )}
    </Paper>
  );
};

// --- Section 2: Sector performance bars ---
const SectorBars = ({ stocks }) => {
  const [period, setPeriod] = useState("daily");

  // Group by sector
  const sectors = useMemo(() => {
    const groups = {};
    (stocks || []).forEach((s) => {
      const sec = s.sector || "Other";
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push(s);
    });

    return Object.entries(groups)
      .map(([name, stks]) => {
        const returns = stks.map((s) => s.daily_return_pct || 0);
        const avg =
          returns.length > 0
            ? returns.reduce((a, b) => a + b, 0) / returns.length
            : 0;
        return { name, avg, count: stks.length };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [stocks]);

  const chartOptions = {
    chart: {
      type: "bar",
      backgroundColor: "transparent",
      height: Math.max(200, sectors.length * 40),
    },
    title: { text: null },
    xAxis: {
      categories: sectors.map((s) => `${s.name} (${s.count})`),
      labels: { style: { color: "#94a3b8" } },
    },
    yAxis: {
      title: { text: "Avg Daily Return %" },
      labels: { format: "{value}%" },
    },
    series: [
      {
        name: "Return",
        data: sectors.map((s) => ({
          y: parseFloat(s.avg.toFixed(2)),
          color: s.avg >= 0 ? GREEN : RED,
        })),
      },
    ],
    legend: { enabled: false },
    credits: { enabled: false },
    plotOptions: {
      bar: {
        borderRadius: 3,
        dataLabels: {
          enabled: true,
          format: "{y}%",
          style: { color: "#f8fafc", textOutline: "none" },
        },
      },
    },
    tooltip: { valueSuffix: "%" },
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2, height: "100%" }}>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing={1}
        mb={1}
      >
        Sector Performance
      </Typography>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </Paper>
  );
};

// --- Section 3: RSI Heatmap ---
const RsiHeatmap = ({ stocks }) => {
  const navigate = useNavigate();

  const rsiColor = (rsi) => {
    if (rsi == null) return "#374151";
    if (rsi < 20) return "#991b1b";
    if (rsi < 30) return "#dc2626";
    if (rsi < 40) return "#f87171";
    if (rsi < 50) return "#6b7280";
    if (rsi < 60) return "#6b7280";
    if (rsi < 70) return "#4ade80";
    if (rsi < 80) return "#16a34a";
    return "#166534";
  };

  // Sort by RSI for visual pattern
  const sorted = useMemo(
    () =>
      [...(stocks || [])]
        .filter((s) => s.rsi != null)
        .sort((a, b) => (a.rsi || 50) - (b.rsi || 50)),
    [stocks],
  );

  return (
    <Paper sx={{ p: 2, borderRadius: 2, height: "100%" }}>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing={1}
        mb={1}
      >
        RSI Heatmap
      </Typography>
      <Box display="flex" gap={0.5} mb={1}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box
            sx={{
              width: 12,
              height: 12,
              bgcolor: "#dc2626",
              borderRadius: 0.5,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Oversold
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5} ml={2}>
          <Box
            sx={{
              width: 12,
              height: 12,
              bgcolor: "#6b7280",
              borderRadius: 0.5,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Neutral
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5} ml={2}>
          <Box
            sx={{
              width: 12,
              height: 12,
              bgcolor: "#16a34a",
              borderRadius: 0.5,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Overbought
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexWrap="wrap" gap={0.5}>
        {sorted.map((s) => (
          <Tooltip
            key={s.id}
            title={`${s.symbol}: RSI ${s.rsi?.toFixed(0)} | $${s.price?.toFixed(
              0,
            )} | ${s.daily_return_pct?.toFixed(1)}%`}
          >
            <Box
              onClick={() => navigate(`/stocks/${s.id}/historical/price`)}
              sx={{
                width: 48,
                height: 48,
                bgcolor: rsiColor(s.rsi),
                borderRadius: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                "&:hover": { opacity: 0.8, transform: "scale(1.1)" },
                transition: "transform 0.1s",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  lineHeight: 1,
                }}
              >
                {s.symbol}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#ffffffcc", fontSize: "0.6rem" }}
              >
                {s.rsi?.toFixed(0)}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Paper>
  );
};

// --- Main View ---
const ChartsGridView = () => {
  const { data: stocks, isLoading } = useStocksOverview();
  const { data: techData } = useResource(
    "stock-technicals",
    "/stocks/technicals/",
  );

  if (isLoading) return <ScaleLoader loading />;
  if (!stocks || !Array.isArray(stocks)) return null;

  // Merge RSI data from technicals endpoint into stocks
  const stocksWithRsi = useMemo(() => {
    const rsiMap = {};
    if (Array.isArray(techData)) {
      techData.forEach((t) => {
        rsiMap[t.id] = t.rsi;
      });
    }
    return stocks.map((s) => ({ ...s, rsi: rsiMap[s.id] || null }));
  }, [stocks, techData]);

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Charts & Analysis
      </Typography>

      <Grid container spacing={2} alignItems="stretch">
        {/* RSI Heatmap */}
        <Grid item xs={12} md={5}>
          <RsiHeatmap stocks={stocksWithRsi} />
        </Grid>

        {/* Sector Performance */}
        <Grid item xs={12} md={7}>
          <SectorBars stocks={stocks} />
        </Grid>

        {/* Performance Comparison */}
        <Grid item xs={12}>
          <PerformanceChart stocks={stocks} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChartsGridView;
