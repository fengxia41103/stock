import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScaleLoader from "react-spinners/ScaleLoader";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { useResource } from "@/api";

const GREEN = "#10b981";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";

const verdictColor = (v) => {
  switch (v) {
    case "OVERSOLD":
      return RED;
    case "OVERBOUGHT":
      return AMBER;
    case "BULLISH":
      return GREEN;
    case "BEARISH":
      return RED;
    default:
      return "text.secondary";
  }
};

const rsiColor = (rsi) => {
  if (rsi == null) return "text.primary";
  if (rsi < 30) return RED;
  if (rsi > 70) return AMBER;
  return "text.primary";
};

const StatChip = ({ label, value, color, status, subtitle, onClick, active }) => {
  const icons = {
    success: <CheckCircleIcon color="success" />,
    error: <ErrorIcon color="error" />,
    warning: <WarningIcon color="warning" />,
  };
  const bgColors = {
    success: "#064e3b20",
    error: "#7f1d1d20",
    warning: "#92400e20",
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        bgcolor: bgColors[status] || "background.paper",
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        border: active ? 2 : 1,
        borderColor: active ? "primary.main" : "divider",
        transition: "border-color 0.2s",
        "&:hover": onClick ? { borderColor: "primary.light" } : {},
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
          {icons[status]}
          <Typography variant="caption" color="text.secondary" noWrap>
            {label}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight={700} sx={{ color, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const TechnicalsView = () => {
  const { data, isLoading } = useResource(
    "stock-technicals",
    "/stocks/technicals/",
  );
  const navigate = useNavigate();
  const [filter, setFilter] = useState(null);

  if (isLoading) return <ScaleLoader loading />;

  const stocks = Array.isArray(data) ? data : [];

  // Compute stats
  const oversold = stocks.filter((s) => s.rsi != null && s.rsi < 30).length;
  const weak = stocks.filter((s) => s.rsi != null && s.rsi >= 30 && s.rsi < 40).length;
  const neutral = stocks.filter((s) => s.rsi != null && s.rsi >= 40 && s.rsi <= 60).length;
  const strong = stocks.filter((s) => s.rsi != null && s.rsi > 60 && s.rsi <= 70).length;
  const overbought = stocks.filter((s) => s.rsi != null && s.rsi > 70).length;
  const goldenCross = stocks.filter((s) => s.sma_signal === "golden_cross").length;
  const deathCross = stocks.filter((s) => s.sma_signal === "death_cross").length;
  const avgRsi = stocks.length > 0
    ? (stocks.reduce((sum, s) => sum + (s.rsi || 50), 0) / stocks.length).toFixed(0)
    : 0;

  // Filter table based on active card
  const filteredStocks = filter
    ? stocks.filter((s) => {
        switch (filter) {
          case "oversold": return s.rsi != null && s.rsi < 30;
          case "weak": return s.rsi != null && s.rsi >= 30 && s.rsi < 40;
          case "neutral": return s.rsi != null && s.rsi >= 40 && s.rsi <= 60;
          case "strong": return s.rsi != null && s.rsi > 60 && s.rsi <= 70;
          case "overbought": return s.rsi != null && s.rsi > 70;
          case "golden": return s.sma_signal === "golden_cross";
          case "death": return s.sma_signal === "death_cross";
          default: return true;
        }
      })
    : stocks;

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Technical Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        RSI, Bollinger Band position, SMA crossovers, and trading verdicts for
        all stocks. Sorted by RSI (most oversold first).
      </Typography>

      {/* Stats Cards — click to filter table */}
      <Grid container spacing={1.5} mb={2}>
        <Grid item xs={6} sm={4} md={3} lg={1.5}>
          <StatChip label="Oversold" value={oversold} color={RED} status="error" subtitle="RSI < 30"
            onClick={() => setFilter(filter === "oversold" ? null : "oversold")} active={filter === "oversold"} />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={1.5}>
          <StatChip label="Weak" value={weak} color={AMBER} status="warning" subtitle="RSI 30-40"
            onClick={() => setFilter(filter === "weak" ? null : "weak")} active={filter === "weak"} />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={1.5}>
          <StatChip label="Neutral" value={neutral} color="text.secondary" subtitle="RSI 40-60"
            onClick={() => setFilter(filter === "neutral" ? null : "neutral")} active={filter === "neutral"} />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={1.5}>
          <StatChip label="Strong" value={strong} color={BLUE} subtitle="RSI 60-70"
            onClick={() => setFilter(filter === "strong" ? null : "strong")} active={filter === "strong"} />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={1.5}>
          <StatChip label="Overbought" value={overbought} color="#8b5cf6" status="warning" subtitle="RSI > 70"
            onClick={() => setFilter(filter === "overbought" ? null : "overbought")} active={filter === "overbought"} />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={1.5}>
          <StatChip label="Avg RSI" value={avgRsi} color="text.primary" subtitle="All stocks" />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={1.5}>
          <StatChip label="Golden Cross" value={goldenCross} color={GREEN} status="success" subtitle="SMA50 > 200"
            onClick={() => setFilter(filter === "golden" ? null : "golden")} active={filter === "golden"} />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={1.5}>
          <StatChip label="Death Cross" value={deathCross} color={RED} status="error" subtitle="SMA50 < 200"
            onClick={() => setFilter(filter === "death" ? null : "death")} active={filter === "death"} />
        </Grid>
      </Grid>

      {filter && (
        <Chip label={`Showing: ${filter}`} onDelete={() => setFilter(null)} size="small" sx={{ mb: 1 }} />
      )}

      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">RSI(14)</TableCell>
              <TableCell align="right">BB %</TableCell>
              <TableCell align="right">SMA50</TableCell>
              <TableCell align="right">SMA200</TableCell>
              <TableCell align="center">Cross</TableCell>
              <TableCell align="right">Last Lower</TableCell>
              <TableCell align="center">Verdict</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStocks.map((s) => (
              <TableRow
                key={s.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/stocks/${s.id}/historical/price`)}
              >
                <TableCell>
                  <strong>{s.symbol}</strong>
                </TableCell>
                <TableCell align="right">${s.price}</TableCell>
                <TableCell
                  align="right"
                  sx={{ color: rsiColor(s.rsi), fontWeight: 700 }}
                >
                  {s.rsi != null ? s.rsi : "—"}
                  {s.rsi != null && s.rsi < 30 && " 🔥"}
                </TableCell>
                <TableCell align="right">
                  {s.bb_position != null ? `${s.bb_position}%` : "—"}
                </TableCell>
                <TableCell align="right">
                  {s.sma50 ? `$${s.sma50}` : "—"}
                </TableCell>
                <TableCell align="right">
                  {s.sma200 ? `$${s.sma200}` : "—"}
                </TableCell>
                <TableCell align="center">
                  {s.sma_signal === "golden_cross" && (
                    <Chip
                      label="Golden"
                      size="small"
                      sx={{
                        bgcolor: GREEN,
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                    />
                  )}
                  {s.sma_signal === "death_cross" && (
                    <Chip
                      label="Death"
                      size="small"
                      sx={{
                        bgcolor: RED,
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                    />
                  )}
                  {!s.sma_signal && "—"}
                </TableCell>
                <TableCell align="right">
                  {s.last_lower != null ? `${s.last_lower}d` : "—"}
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ color: verdictColor(s.verdict) }}
                  >
                    {s.verdict}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TechnicalsView;
