import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

const StatTile = ({ label, value, sub, color }) => (
  <Box textAlign="center">
    <Typography variant="caption" sx={{ color: "#ffffffcc", textTransform: "uppercase", letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="h4" fontWeight={700} sx={{ color: color || "#ffffff" }}>
      {value}
    </Typography>
    {sub && (
      <Typography variant="caption" sx={{ color: "#ffffffcc" }}>
        {sub}
      </Typography>
    )}
  </Box>
);

const DiaryScorecard = ({ stats }) => {
  if (!stats || !stats.total) return null;

  const accuracyColor = stats.accuracy_pct >= 80 ? "#10b981" : stats.accuracy_pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <Paper sx={{ p: 2.5, mb: 2, bgcolor: "primary.main", borderRadius: 2 }}>
      <Stack direction="row" spacing={4} justifyContent="space-around" flexWrap="wrap">
        <StatTile label="Total Predictions" value={stats.total} />
        <StatTile
          label="Accuracy"
          value={`${stats.accuracy_pct}%`}
          sub={`${stats.correct}/${stats.total}`}
          color={accuracyColor}
        />
        <StatTile
          label="🐂 Bull"
          value={`${stats.bull_accuracy_pct}%`}
          sub={`${stats.bull_correct}/${stats.bull_total}`}
          color="#10b981"
        />
        <StatTile
          label="🐻 Bear"
          value={`${stats.bear_accuracy_pct}%`}
          sub={`${stats.bear_correct}/${stats.bear_total}`}
          color="#ef4444"
        />
      </Stack>
    </Paper>
  );
};

export default DiaryScorecard;
