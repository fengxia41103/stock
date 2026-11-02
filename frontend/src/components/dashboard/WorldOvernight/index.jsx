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

import { useWorldOvernight } from "@/api";

// Shows the "overnight wind" for tomorrow's US open: US index futures + Asian
// and European indices + VIX, captured while the US market is closed, with a
// plain-language read. Data comes from captured MarketSnapshot rows.
const WorldOvernight = () => {
  const theme = useTheme();
  const { data, isLoading } = useWorldOvernight();

  if (isLoading || !data) return null;
  const markets = data.markets || [];
  if (markets.length === 0) return null;

  const toneColor = {
    good: theme.palette.success.main,
    bad: theme.palette.error.main,
    neutral: theme.palette.text.secondary,
  }[data.tone || "neutral"];

  const pctColor = (v) =>
    v == null
      ? theme.palette.text.secondary
      : v > 0
        ? theme.palette.success.main
        : v < 0
          ? theme.palette.error.main
          : theme.palette.text.secondary;

  const captured = data.captured_at
    ? new Date(data.captured_at).toLocaleString()
    : null;

  return (
    <Paper sx={{ p: 2, mb: 2, borderLeft: 4, borderColor: toneColor }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={800}>
          🌍 World overnight → tomorrow&apos;s US open
        </Typography>
        {captured && (
          <Typography variant="caption" color="text.secondary">
            captured {captured}
          </Typography>
        )}
      </Stack>

      <Typography
        variant="body2"
        sx={{ color: toneColor, fontWeight: 700, mb: 1.5 }}
      >
        {data.headline}
      </Typography>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {markets.map((m) => (
          <Tooltip key={m.symbol} title={`${m.label} · ${m.market_state}`}>
            <Chip
              size="small"
              variant="outlined"
              label={
                <Box component="span">
                  {m.label.split(" (")[0]}:{" "}
                  <Box
                    component="span"
                    sx={{ color: pctColor(m.change_pct), fontWeight: 700 }}
                  >
                    {m.change_pct == null
                      ? "—"
                      : `${m.change_pct > 0 ? "+" : ""}${m.change_pct.toFixed(2)}%`}
                  </Box>
                </Box>
              }
            />
          </Tooltip>
        ))}
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

export default WorldOvernight;
