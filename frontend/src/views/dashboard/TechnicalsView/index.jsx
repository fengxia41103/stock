import React from "react";
import { useNavigate } from "react-router-dom";
import ScaleLoader from "react-spinners/ScaleLoader";

import {
  Box,
  Chip,
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
    case "OVERSOLD": return RED;
    case "OVERBOUGHT": return AMBER;
    case "BULLISH": return GREEN;
    case "BEARISH": return RED;
    default: return "text.secondary";
  }
};

const rsiColor = (rsi) => {
  if (rsi == null) return "text.primary";
  if (rsi < 30) return RED;
  if (rsi > 70) return AMBER;
  return "text.primary";
};

const TechnicalsView = () => {
  const { data, isLoading } = useResource("stock-technicals", "/stocks/technicals/");
  const navigate = useNavigate();

  if (isLoading) return <ScaleLoader loading />;

  const stocks = Array.isArray(data) ? data : [];

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Technical Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        RSI, Bollinger Band position, SMA crossovers, and trading verdicts for all stocks. Sorted by RSI (most oversold first).
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
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
            {stocks.map((s) => (
              <TableRow
                key={s.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/stocks/${s.id}/historical/price`)}
              >
                <TableCell><strong>{s.symbol}</strong></TableCell>
                <TableCell align="right">${s.price}</TableCell>
                <TableCell align="right" sx={{ color: rsiColor(s.rsi), fontWeight: 700 }}>
                  {s.rsi != null ? s.rsi : "—"}
                  {s.rsi != null && s.rsi < 30 && " 🔥"}
                </TableCell>
                <TableCell align="right">
                  {s.bb_position != null ? `${s.bb_position}%` : "—"}
                </TableCell>
                <TableCell align="right">{s.sma50 ? `$${s.sma50}` : "—"}</TableCell>
                <TableCell align="right">{s.sma200 ? `$${s.sma200}` : "—"}</TableCell>
                <TableCell align="center">
                  {s.sma_signal === "golden_cross" && (
                    <Chip label="Golden" size="small" sx={{ bgcolor: GREEN, color: "#fff", fontWeight: 600, fontSize: "0.7rem" }} />
                  )}
                  {s.sma_signal === "death_cross" && (
                    <Chip label="Death" size="small" sx={{ bgcolor: RED, color: "#fff", fontWeight: 600, fontSize: "0.7rem" }} />
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
