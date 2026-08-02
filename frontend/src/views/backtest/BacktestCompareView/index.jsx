import React, { useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import ScaleLoader from "react-spinners/ScaleLoader";

import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
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

const BacktestCompareView = () => {
  const { data: history, isLoading } = useResource("backtest-history", "/backtest/history/");
  const [selectedIds, setSelectedIds] = useState([]);

  const results = useMemo(() => (Array.isArray(history) ? history : []), [history]);

  // Only show completed backtests with results
  const completedResults = useMemo(
    () => results.filter((r) => r.state === "SUCCESS" && r.total_return != null),
    [results],
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev,
    );
  };

  const selectedResults = useMemo(
    () => completedResults.filter((r) => selectedIds.includes(r.id)),
    [completedResults, selectedIds],
  );

  // For overlay chart, we'd need the full result with equity_curve.
  // The history endpoint only returns summary. We'll show metrics comparison.
  const chartOptions = useMemo(() => {
    if (selectedResults.length < 2) return null;

    return {
      chart: { backgroundColor: "transparent", height: 300 },
      title: { text: null },
      xAxis: { categories: selectedResults.map((r) => `${r.strategy}\n(${r.start_date.slice(0, 4)}-${r.end_date.slice(0, 4)})`) },
      yAxis: { title: { text: "Total Return %" } },
      series: [
        {
          name: "Total Return %",
          type: "column",
          data: selectedResults.map((r) => r.total_return || 0),
          colorByPoint: true,
        },
      ],
      legend: { enabled: false },
      credits: { enabled: false },
      plotOptions: {
        column: {
          dataLabels: { enabled: true, format: "{y:.1f}%", style: { color: "#f8fafc", textOutline: "none" } },
        },
      },
    };
  }, [selectedResults]);

  if (isLoading) return <ScaleLoader loading />;

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Backtest Comparison
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Select 2+ completed backtests to compare side-by-side.
      </Typography>

      <Grid container spacing={2}>
        {/* Selection list */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, borderRadius: 2, maxHeight: 400, overflow: "auto" }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>
              Backtest History ({completedResults.length} completed)
            </Typography>
            {completedResults.map((r) => (
              <FormControlLabel
                key={r.id}
                control={
                  <Checkbox
                    checked={selectedIds.includes(r.id)}
                    onChange={() => toggleSelect(r.id)}
                    size="small"
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={600}>{r.strategy}</Typography>
                    <Chip
                      label={`${r.total_return >= 0 ? "+" : ""}${r.total_return?.toFixed(1)}%`}
                      size="small"
                      sx={{ bgcolor: r.total_return >= 0 ? GREEN : RED, color: "#fff", fontWeight: 600 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {r.symbols_count} stocks · {r.start_date}→{r.end_date}
                    </Typography>
                  </Stack>
                }
                sx={{ display: "flex", mb: 0.5 }}
              />
            ))}
            {completedResults.length === 0 && (
              <Typography color="text.secondary" mt={2}>No completed backtests yet. Run some from the Backtest page first.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Comparison */}
        <Grid item xs={12} md={7}>
          {selectedResults.length >= 2 ? (
            <Stack spacing={2}>
              {/* Bar chart */}
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
              </Paper>

              {/* Metrics table */}
              <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      {selectedResults.map((r) => (
                        <TableCell key={r.id} align="center"><strong>{r.strategy}</strong></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Return</TableCell>
                      {selectedResults.map((r) => (
                        <TableCell key={r.id} align="center" sx={{ color: r.total_return >= 0 ? GREEN : RED, fontWeight: 700 }}>
                          {r.total_return?.toFixed(1)}%
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      {selectedResults.map((r) => (
                        <TableCell key={r.id} align="center">{r.start_date} → {r.end_date}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Stocks</TableCell>
                      {selectedResults.map((r) => (
                        <TableCell key={r.id} align="center">{r.symbols_count}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Mode</TableCell>
                      {selectedResults.map((r) => (
                        <TableCell key={r.id} align="center">{r.mode}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          ) : (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
              <Typography color="text.secondary">
                Select at least 2 backtests from the left to compare.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default BacktestCompareView;
