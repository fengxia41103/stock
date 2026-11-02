import React from "react";

import {
  Box,
  Chip,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import { useMarketRisk } from "@/api";

// Home-page "market weather" gauges: VIX, 10Y yield, DXY, high-yield credit.
// Polls every 60s (yahooquery has no websocket; this is streaming-like polling,
// not live ticks). Coloring respects whether a RISE is risk-on or risk-off.
const MarketRiskGauges = () => {
  const theme = useTheme();
  const { data, isLoading } = useMarketRisk(60000);

  if (isLoading || !data) return null;
  const gauges = data.gauges || [];
  if (gauges.length === 0) return null;

  const toneColor = {
    good: theme.palette.success.main,
    bad: theme.palette.error.main,
    neutral: theme.palette.text.secondary,
  }[data.tone || "neutral"];

  // Color a gauge by its move AND what a rise means. For neutral gauges we
  // show direction only (up=green/down=red is NOT implied good/bad).
  const gaugeColor = (chg, riseIs) => {
    if (chg == null) return theme.palette.text.secondary;
    if (riseIs === "bad") {
      return chg > 0 ? theme.palette.error.main : theme.palette.success.main;
    }
    if (riseIs === "good") {
      return chg > 0 ? theme.palette.success.main : theme.palette.error.main;
    }
    // neutral: just direction tint
    return chg > 0
      ? theme.palette.info.main
      : chg < 0
        ? theme.palette.warning.main
        : theme.palette.text.secondary;
  };

  const captured = data.captured_at
    ? new Date(data.captured_at).toLocaleTimeString()
    : null;

  return (
    <Paper sx={{ p: 2, mb: 2, borderLeft: 4, borderColor: toneColor }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={800}>
          📊 Market risk gauges
        </Typography>
        {captured && (
          <Typography variant="caption" color="text.secondary">
            updated {captured} · auto-refresh 60s
          </Typography>
        )}
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {gauges.map((g) => {
          const color = gaugeColor(g.change_pct, g.rise_is);
          return (
            <Tooltip key={g.symbol} title={g.hint || g.label}>
              <Chip
                variant="outlined"
                sx={{ height: "auto", py: 0.5 }}
                label={
                  <Box component="span">
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      {g.label.split(" —")[0].split(" (")[0]}
                    </Box>{" "}
                    <Box component="span">
                      {g.price == null ? "—" : g.price.toFixed(2)}
                    </Box>{" "}
                    <Box component="span" sx={{ color, fontWeight: 700 }}>
                      {g.change_pct == null
                        ? ""
                        : `(${g.change_pct > 0 ? "+" : ""}${g.change_pct.toFixed(2)}%)`}
                    </Box>
                  </Box>
                }
              />
            </Tooltip>
          );
        })}
      </Stack>

      {data.disclaimer && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          {data.disclaimer}
        </Typography>
      )}
    </Paper>
  );
};

export default MarketRiskGauges;
