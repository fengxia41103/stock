import React, { useContext } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  Alert,
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { useResource } from "@/api";
import StockDetailContext from "@Views/stock/StockDetailView/context";

const PHASE_CONFIG = {
  peak: { emoji: "🔴", label: "Peak", color: "#ef4444", severity: "error" },
  falling: {
    emoji: "🟡",
    label: "Falling",
    color: "#f59e0b",
    severity: "warning",
  },
  trough: {
    emoji: "🟢",
    label: "Trough",
    color: "#10b981",
    severity: "success",
  },
  rising: { emoji: "🔵", label: "Rising", color: "#3b82f6", severity: "info" },
};

const CapitalCycleView = () => {
  const stock = useContext(StockDetailContext);
  const { data, isLoading } = useResource(
    ["capital-cycle", String(stock.id)],
    `/stocks/${stock.id}/capital-cycle/`,
  );

  if (isLoading) return <ScaleLoader loading />;

  if (!data || data.error) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Capital Cycle — {stock.symbol}
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {data?.error || "Unable to compute capital cycle."}
        </Alert>
        {data?.tracked_symbols && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            Tracked peers in DB:{" "}
            {data.tracked_symbols.length > 0
              ? data.tracked_symbols.join(", ")
              : "none"}
          </Typography>
        )}
        {data?.all_symbols && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            All peers (including untracked): {data.all_symbols.join(", ")}
          </Typography>
        )}
        {data?.hint && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            💡 {data.hint}
          </Typography>
        )}
        <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
          <strong>To use this analysis:</strong>
          <br />
          1. Go to the <strong>Peer Benchmark</strong> tab and click "Load
          Defaults" to add industry peers.
          <br />
          2. Peers must also be tracked in your portfolio (with financial data
          loaded) to compute their capex/ROIC.
          <br />
          3. If no peers are available, the analysis runs on {stock.symbol}{" "}
          alone — but needs at least 4 quarterly income statements.
        </Alert>
      </Box>
    );
  }

  const phase = PHASE_CONFIG[data.cycle_phase] || PHASE_CONFIG.rising;
  const trend = data.capex_trend || [];

  // Highcharts dual-axis chart: Capex/Revenue % + ROIC %
  const chartOptions = {
    chart: {
      backgroundColor: "transparent",
      height: 360,
    },
    title: { text: null },
    xAxis: {
      categories: trend.map((t) => t.on),
      labels: {
        rotation: -45,
        style: { color: "#94a3b8", fontSize: "10px" },
        step: Math.max(1, Math.floor(trend.length / 12)),
      },
    },
    yAxis: [
      {
        title: { text: "Capex / Revenue %", style: { color: "#f59e0b" } },
        labels: { style: { color: "#f59e0b" }, format: "{value}%" },
      },
      {
        title: { text: "Aggregate ROIC %", style: { color: "#3b82f6" } },
        labels: { style: { color: "#3b82f6" }, format: "{value}%" },
        opposite: true,
      },
    ],
    legend: {
      enabled: true,
      itemStyle: { color: "#94a3b8" },
    },
    plotOptions: {
      line: { marker: { enabled: false } },
    },
    series: [
      {
        name: "Capex / Revenue %",
        data: trend.map((t) => t.capex_to_revenue_pct),
        color: "#f59e0b",
        yAxis: 0,
        lineWidth: 2,
      },
      {
        name: "Aggregate ROIC %",
        data: trend.map((t) => t.aggregate_roic_pct),
        color: "#3b82f6",
        yAxis: 1,
        lineWidth: 2,
      },
      {
        name: "Avg ROIC (historical)",
        data: trend.map(() => data.historical_avg_roic_pct),
        color: "#3b82f6",
        yAxis: 1,
        lineWidth: 1,
        dashStyle: "Dash",
        enableMouseTracking: false,
      },
    ],
    tooltip: {
      shared: true,
      valueSuffix: "%",
      valueDecimals: 1,
    },
    credits: { enabled: false },
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5">Capital Cycle — {stock.symbol}</Typography>
        <Chip
          label={`${phase.emoji} ${phase.label}`}
          sx={{
            bgcolor: phase.color,
            color: "white",
            fontWeight: 700,
            fontSize: "1rem",
            px: 1,
          }}
        />
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Step 9 (Supply Side & Capital Cycle): Aggregate capex intensity and
        returns on capital across {stock.symbol}'s competitive peers to
        determine where the industry sits in the capital cycle.
      </Typography>

      {/* Signal interpretation */}
      <Alert severity={phase.severity} sx={{ mb: 3 }}>
        <Typography variant="body1">{data.signal}</Typography>
      </Alert>

      {/* Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </Paper>

      {/* Summary metrics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Current Capex/Revenue
            </Typography>
            <Typography variant="h5" color="warning.main">
              {data.current_capex_pct?.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Trend: {data.capex_trend_direction}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Current ROIC
            </Typography>
            <Typography variant="h5" color="info.main">
              {data.current_roic_pct?.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Historical Avg ROIC
            </Typography>
            <Typography variant="h5">
              {data.historical_avg_roic_pct?.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Cycle Phase
            </Typography>
            <Typography variant="h5" sx={{ color: phase.color }}>
              {phase.emoji} {phase.label}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Peer group info */}
      <Paper sx={{ p: 2, bgcolor: "action.hover" }}>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Peer Group Coverage
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={1}>
          {data.tracked_symbols?.map((s) => (
            <Chip
              key={s}
              label={s}
              size="small"
              color={s === stock.symbol ? "primary" : "default"}
              variant={s === stock.symbol ? "filled" : "outlined"}
            />
          ))}
        </Stack>
        {data.untracked_symbols?.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Not tracked (no data): {data.untracked_symbols.join(", ")}
          </Typography>
        )}
        <Alert severity="info" variant="outlined" sx={{ mt: 1.5 }}>
          <strong>Capital Cycle Framework:</strong> 🔴 Peak (sell) → 🟡 Falling
          (caution) → 🟢 Trough (buy) → 🔵 Rising (hold/add)
        </Alert>
      </Paper>
    </Box>
  );
};

export default CapitalCycleView;
