import React from "react";
import { Box, Card, CardContent, CardHeader, Chip, Grid, Typography } from "@mui/material";
import { useResource } from "@/api";

const SERIES_DISPLAY = [
  { id: "DGS10", label: "10Y Treasury", unit: "%", warn: null },
  { id: "FEDFUNDS", label: "Fed Funds", unit: "%", warn: null },
  { id: "T10Y2Y", label: "2s10s Spread", unit: "%", warn: (v) => v < 0 },
  { id: "BAMLH0A0HYM2", label: "HY Spread", unit: "%", warn: (v) => v > 5 },
  { id: "UNRATE", label: "Unemployment", unit: "%", warn: null },
  { id: "CPIAUCSL", label: "CPI", unit: "", warn: null },
];

const MacroWidget = () => {
  const { data: series } = useResource("macro-series", "/macro-series/");

  if (!series || !Array.isArray(series) || series.length === 0) return null;

  return (
    <Card>
      <CardHeader title={<Typography variant="h6">Macro Environment</Typography>} />
      <CardContent>
        <Grid container spacing={1}>
          {SERIES_DISPLAY.map((s) => (
            <MacroIndicator key={s.id} {...s} />
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

const MacroIndicator = ({ id, label, unit, warn }) => {
  const { data } = useResource(
    ["macro-latest", id],
    `/macro-data/?series_id=${id}&ordering=-date&page_size=1`,
  );

  const points = Array.isArray(data) ? data : data?.results || [];
  if (points.length === 0) return null;

  const latest = points[0];
  const isWarning = warn && warn(latest.value);

  return (
    <Grid item xs={6} sm={4} md={2}>
      <Box textAlign="center">
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body1" fontWeight={600}>
          {latest.value?.toFixed(2)}{unit}
        </Typography>
        {isWarning && <Chip label="⚠️" size="small" color="warning" />}
      </Box>
    </Grid>
  );
};

export default MacroWidget;
