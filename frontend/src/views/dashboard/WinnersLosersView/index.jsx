import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ScaleLoader from "react-spinners/ScaleLoader";

import { useStocksOverview } from "@/api";

const WinnersLosersView = () => {
  const { data, isLoading } = useStocksOverview();
  const navigate = useNavigate();

  if (isLoading) return <ScaleLoader loading />;
  if (!data || !Array.isArray(data)) return null;

  const withReturn = data.filter((s) => s.daily_return_pct != null);
  const up = withReturn.filter((s) => s.daily_return_pct > 0);
  const down = withReturn.filter((s) => s.daily_return_pct < 0);
  const sorted = [...withReturn].sort(
    (a, b) => b.daily_return_pct - a.daily_return_pct,
  );
  const winners = sorted.slice(0, 5);
  const losers = sorted.slice(-5).reverse();
  const byDrop = [...data]
    .filter((s) => s.last_lower > 3)
    .sort((a, b) => b.last_lower - a.last_lower)
    .slice(0, 5);
  const insiderBullish = [...data]
    .filter((s) => s.insider_sentiment > 0)
    .sort((a, b) => b.insider_sentiment - a.insider_sentiment)
    .slice(0, 5);

  const StockChip = ({ s, showReturn = true }) => (
    <Chip
      label={`${s.symbol} ${
        showReturn && s.daily_return_pct != null
          ? (s.daily_return_pct > 0 ? "+" : "") +
            s.daily_return_pct.toFixed(1) +
            "%"
          : ""
      }`}
      size="small"
      color={
        s.daily_return_pct > 0
          ? "success"
          : s.daily_return_pct < 0
          ? "error"
          : "default"
      }
      onClick={() => navigate(`/stocks/${s.id}/historical/price`)}
      sx={{ cursor: "pointer", fontWeight: 600 }}
    />
  );

  return (
    <Box>
      {/* Hero Stats */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              background: "linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)",
              color: "#fff",
            }}
          >
            <Typography variant="h3" fontWeight={700}>
              {up.length}
            </Typography>
            <Typography variant="caption">Stocks Up</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              background: "linear-gradient(135deg, #b71c1c 0%, #e53935 100%)",
              color: "#fff",
            }}
          >
            <Typography variant="h3" fontWeight={700}>
              {down.length}
            </Typography>
            <Typography variant="caption">Stocks Down</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
              color: "#fff",
            }}
          >
            <Typography variant="h3" fontWeight={700}>
              {insiderBullish.length}
            </Typography>
            <Typography variant="caption">Insider Buying</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              background: "linear-gradient(135deg, #e65100 0%, #ff9800 100%)",
              color: "#fff",
            }}
          >
            <Typography variant="h3" fontWeight={700}>
              {byDrop.length}
            </Typography>
            <Typography variant="caption">Oversold</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Market Breadth Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption" color="success.main" fontWeight={600}>
            {up.length} Up ({((up.length / withReturn.length) * 100).toFixed(0)}
            %)
          </Typography>
          <Typography variant="caption" color="error.main" fontWeight={600}>
            {down.length} Down (
            {((down.length / withReturn.length) * 100).toFixed(0)}%)
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={(up.length / withReturn.length) * 100}
          sx={{
            height: 12,
            borderRadius: 6,
            bgcolor: "#ffcdd2",
            "& .MuiLinearProgress-bar": { bgcolor: "#4caf50", borderRadius: 6 },
          }}
        />
      </Paper>

      <Grid container spacing={2}>
        {/* Winners */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: "#4caf50", width: 28, height: 28 }}>
                <TrendingUpIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700}>
                Top Gainers
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              {winners.map((s) => (
                <Stack
                  key={s.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    cursor: "pointer",
                    p: 0.5,
                    borderRadius: 1,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  onClick={() => navigate(`/stocks/${s.id}/historical/price`)}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {s.symbol}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    fontWeight={700}
                  >
                    +{s.daily_return_pct.toFixed(2)}%
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Losers */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: "#f44336", width: 28, height: 28 }}>
                <TrendingDownIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700}>
                Top Losers
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              {losers.map((s) => (
                <Stack
                  key={s.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    cursor: "pointer",
                    p: 0.5,
                    borderRadius: 1,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  onClick={() => navigate(`/stocks/${s.id}/historical/price`)}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {s.symbol}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="error.main"
                    fontWeight={700}
                  >
                    {s.daily_return_pct.toFixed(2)}%
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Oversold / Biggest Drops */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: "#ff9800", width: 28, height: 28 }}>
                📉
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700}>
                Oversold
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              {byDrop.map((s) => (
                <Stack
                  key={s.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    cursor: "pointer",
                    p: 0.5,
                    borderRadius: 1,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  onClick={() => navigate(`/stocks/${s.id}/historical/price`)}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {s.symbol}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="warning.main"
                    fontWeight={700}
                  >
                    {s.last_lower}d
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Insider Buying */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 28, height: 28 }}>
                👔
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700}>
                Insider Buying
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              {insiderBullish.length > 0 ? (
                insiderBullish.map((s) => (
                  <Stack
                    key={s.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      cursor: "pointer",
                      p: 0.5,
                      borderRadius: 1,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    onClick={() => navigate(`/stocks/${s.id}/historical/price`)}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {s.symbol}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary"
                      fontWeight={700}
                    >
                      +{(s.insider_sentiment * 100).toFixed(0)}%
                    </Typography>
                  </Stack>
                ))
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No insider buying detected
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WinnersLosersView;
