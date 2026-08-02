import React, { useCallback, useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import ScaleLoader from "react-spinners/ScaleLoader";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { useResource } from "@/api";
import api from "@/api/client";
import { Page } from "@/components/shared";

const StatCard = ({ label, value, color }) => (
  <Paper
    sx={{ p: 2, textAlign: "center", bgcolor: "#ffffff", borderRadius: 2 }}
  >
    <Typography
      variant="caption"
      color="text.secondary"
      textTransform="uppercase"
    >
      {label}
    </Typography>
    <Typography
      variant="h5"
      fontWeight={700}
      sx={{ color: color || "text.primary" }}
    >
      {value}
    </Typography>
  </Paper>
);

const BacktestView = () => {
  const { data: strategies } = useResource(
    "backtest-strategies",
    "/backtest/strategies/",
  );
  const { data: sectors } = useResource("sectors", "/sectors/");
  const [selectedStrategy, setSelectedStrategy] = useState("darwin_rsi");
  const [selectedSector, setSelectedSector] = useState("all");
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState("2026-07-30");
  const [initialCash, setInitialCash] = useState(100000);
  const [params, setParams] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [optimizeResults, setOptimizeResults] = useState(null);
  const [progress, setProgress] = useState(0);

  const currentStrategy = useMemo(
    () => (strategies || []).find((s) => s.id === selectedStrategy),
    [strategies, selectedStrategy],
  );

  const handleStrategyChange = useCallback((e) => {
    setSelectedStrategy(e.target.value);
    setParams({});
  }, []);

  const handleParamChange = useCallback((key, value) => {
    setParams((p) => ({ ...p, [key]: value }));
  }, []);

  const runBacktest = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setOptimizeResults(null);
    try {
      const payload = {
        strategy: selectedStrategy,
        start_date: startDate,
        end_date: endDate,
        initial_cash: initialCash,
        strategy_params: params,
      };
      if (selectedSector !== "all") payload.sector = selectedSector;
      else payload.symbols = "all";

      const resp = await api.post("/backtest/run/", payload);
      const taskId = resp.data.task_id;

      // Poll for results
      const poll = setInterval(async () => {
        try {
          const statusResp = await api.get(`/backtest/status/${taskId}/`);
          const { state, progress, result, error: taskError } = statusResp.data;
          setProgress(progress || 0);

          if (state === "SUCCESS") {
            clearInterval(poll);
            setResults(result);
            setLoading(false);
          } else if (state === "FAILURE") {
            clearInterval(poll);
            setError(taskError || "Backtest failed");
            setLoading(false);
          }
        } catch (e) {
          clearInterval(poll);
          setError("Polling failed");
          setLoading(false);
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit backtest");
      setLoading(false);
    }
  }, [
    selectedStrategy,
    selectedSector,
    startDate,
    endDate,
    initialCash,
    params,
  ]);

  const chartOption = useMemo(() => {
    if (!results?.equity_curve?.length) return null;
    return {
      chart: { backgroundColor: "transparent", height: 350 },
      title: { text: null },
      credits: { enabled: false },
      xAxis: {
        categories: results.equity_curve.map((d) => d.date),
        labels: {
          style: { color: "#94a3b8" },
          step: Math.ceil(results.equity_curve.length / 15),
          rotation: -45,
        },
      },
      yAxis: {
        title: { text: null },
        labels: {
          style: { color: "#94a3b8" },
          formatter: function () {
            return "$" + Highcharts.numberFormat(this.value, 0);
          },
        },
        gridLineColor: "#334155",
      },
      legend: { itemStyle: { color: "#e2e8f0" } },
      tooltip: {
        shared: true,
        backgroundColor: "#1e293b",
        borderColor: "#475569",
        style: { color: "#f8fafc" },
        valuePrefix: "$",
      },
      series: [
        {
          name: "Strategy",
          data: results.equity_curve.map((d) => d.value),
          color: "#10b981",
          lineWidth: 2,
          marker: { enabled: false },
        },
        {
          name: "Benchmark",
          data: results.benchmark_curve.map((d) => d.value),
          color: "#6b7280",
          lineWidth: 1,
          dashStyle: "Dash",
          marker: { enabled: false },
        },
      ],
    };
  }, [results]);

  return (
    <Page title="Backtest">
      <Container maxWidth={false}>
        <Grid container spacing={2}>
          {/* Left: Setup */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, bgcolor: "#ffffff", borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Strategy Setup
              </Typography>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Strategy</InputLabel>
                <Select
                  value={selectedStrategy}
                  onChange={handleStrategyChange}
                  label="Strategy"
                >
                  {(strategies || []).map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {currentStrategy && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={2}
                >
                  {currentStrategy.description}
                </Typography>
              )}

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Portfolio / Sector</InputLabel>
                <Select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  label="Portfolio / Sector"
                >
                  <MenuItem value="all">All Stocks</MenuItem>
                  {(sectors || []).map((s) => (
                    <MenuItem key={s.id} value={String(s.id)}>
                      {s.name} ({s.stocks?.length || 0})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Start Date"
                type="date"
                size="small"
                fullWidth
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                size="small"
                fullWidth
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Initial Cash ($)"
                type="number"
                size="small"
                fullWidth
                value={initialCash}
                onChange={(e) => setInitialCash(Number(e.target.value))}
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              {currentStrategy?.params?.map((p) => (
                <Box key={p.key} mb={2}>
                  <Typography variant="caption" color="text.secondary">
                    {p.label}: {params[p.key] ?? p.default}
                  </Typography>
                  <Slider
                    value={params[p.key] ?? p.default}
                    min={p.min}
                    max={p.max}
                    step={p.type === "float" ? 0.1 : 1}
                    onChange={(_, v) => handleParamChange(p.key, v)}
                    size="small"
                    valueLabelDisplay="auto"
                  />
                </Box>
              ))}

              <Button
                variant="contained"
                fullWidth
                startIcon={<PlayArrowIcon />}
                onClick={runBacktest}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? "Running..." : "Run Backtest"}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  setOptimizeResults(null);
                  setResults(null);
                  try {
                    const payload = {
                      strategy: selectedStrategy,
                      start_date: startDate,
                      end_date: endDate,
                      initial_cash: initialCash,
                    };
                    if (selectedSector !== "all")
                      payload.sector = selectedSector;
                    else payload.symbols = "all";
                    const resp = await api.post("/backtest/optimize/", payload);
                    const taskId = resp.data.task_id;
                    const poll = setInterval(async () => {
                      try {
                        const s = await api.get(`/backtest/status/${taskId}/`);
                        setProgress(s.data.progress || 0);
                        if (s.data.state === "SUCCESS") {
                          clearInterval(poll);
                          setOptimizeResults(s.data.result);
                          setLoading(false);
                        } else if (s.data.state === "FAILURE") {
                          clearInterval(poll);
                          setError(s.data.error || "Optimization failed");
                          setLoading(false);
                        }
                      } catch (e) {
                        clearInterval(poll);
                        setError("Polling failed");
                        setLoading(false);
                      }
                    }, 2000);
                  } catch (err) {
                    setError(err.response?.data?.error || "Failed to submit");
                    setLoading(false);
                  }
                }}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? "Optimizing..." : "🔍 Find Best Params"}
              </Button>

              {error && (
                <Typography color="error" variant="caption" mt={1}>
                  {error}
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Right: Results */}
          <Grid item xs={12} md={9}>
            {loading && (
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "#ffffff",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  ⏳{" "}
                  {progress > 0 ? `Running... ${progress}%` : "Submitting..."}
                </Typography>
                <Box sx={{ width: "100%", mt: 2 }}>
                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#e2e8f0",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${progress}%`,
                        bgcolor: "#10b981",
                        borderRadius: 4,
                        transition: "width 0.3s",
                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" mt={1}>
                  {progress > 0
                    ? `Processing combination ${Math.round(
                        progress * 0.3,
                      )}/30...`
                    : "Queued, waiting for worker..."}
                </Typography>
              </Paper>
            )}

            {results && !loading && (
              <Stack spacing={2}>
                {/* Stats row */}
                <Grid container spacing={1}>
                  <Grid item xs={6} sm={3}>
                    <StatCard
                      label="Total Return"
                      value={`${results.total_return_pct > 0 ? "+" : ""}${
                        results.total_return_pct
                      }%`}
                      color={
                        results.total_return_pct > 0 ? "#10b981" : "#ef4444"
                      }
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard
                      label="Alpha"
                      value={`${results.alpha > 0 ? "+" : ""}${results.alpha}%`}
                      color={results.alpha > 0 ? "#10b981" : "#ef4444"}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard label="Sharpe" value={results.sharpe_ratio} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard
                      label="Max Drawdown"
                      value={`-${results.max_drawdown_pct}%`}
                      color="#ef4444"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard
                      label="Win Rate"
                      value={`${results.win_rate_pct}%`}
                      color={results.win_rate_pct > 50 ? "#10b981" : "#f59e0b"}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard label="Trades" value={results.total_trades} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard
                      label="Avg Hold"
                      value={`${results.avg_hold_days}d`}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard
                      label="Profit Factor"
                      value={results.profit_factor}
                    />
                  </Grid>
                </Grid>

                {/* Equity curve */}
                {chartOption && (
                  <Paper sx={{ p: 2, bgcolor: "#1e293b", borderRadius: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      mb={1}
                    >
                      Equity Curve vs Benchmark
                    </Typography>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={chartOption}
                    />
                  </Paper>
                )}

                {/* Trade log */}
                <Paper sx={{ bgcolor: "#1e293b", borderRadius: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    p={2}
                    pb={0}
                  >
                    Trade Log ({results.trades.length} entries)
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{ bgcolor: "#334155", color: "#f8fafc" }}
                          >
                            Date
                          </TableCell>
                          <TableCell
                            sx={{ bgcolor: "#334155", color: "#f8fafc" }}
                          >
                            Symbol
                          </TableCell>
                          <TableCell
                            sx={{ bgcolor: "#334155", color: "#f8fafc" }}
                          >
                            Action
                          </TableCell>
                          <TableCell
                            sx={{ bgcolor: "#334155", color: "#f8fafc" }}
                            align="right"
                          >
                            Price
                          </TableCell>
                          <TableCell
                            sx={{ bgcolor: "#334155", color: "#f8fafc" }}
                            align="right"
                          >
                            Shares
                          </TableCell>
                          <TableCell
                            sx={{ bgcolor: "#334155", color: "#f8fafc" }}
                            align="right"
                          >
                            P&L
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.trades.slice(0, 100).map((t, i) => (
                          <TableRow
                            key={i}
                            sx={{ "&:hover": { bgcolor: "#334155" } }}
                          >
                            <TableCell sx={{ color: "#e2e8f0" }}>
                              {t.date}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ color: "#f8fafc" }}
                              >
                                {t.sym}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={t.action}
                                size="small"
                                color={t.action === "BUY" ? "success" : "error"}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ color: "#e2e8f0" }}>
                              ${t.price}
                            </TableCell>
                            <TableCell align="right" sx={{ color: "#e2e8f0" }}>
                              {t.shares || ""}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                color:
                                  t.pnl > 0
                                    ? "#10b981"
                                    : t.pnl < 0
                                    ? "#ef4444"
                                    : "#e2e8f0",
                                fontWeight: 600,
                              }}
                            >
                              {t.pnl ? `$${t.pnl.toLocaleString()}` : ""}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Stack>
            )}

            {!results && !loading && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={400}
              >
                <Typography color="text.secondary" variant="h6">
                  Configure strategy and click "Run Backtest"
                </Typography>
              </Box>
            )}

            {/* Optimization Results */}
            {optimizeResults && !loading && (
              <Paper sx={{ p: 2, bgcolor: "#ffffff", borderRadius: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🔍 Optimization Results ({optimizeResults.combinations_tested}{" "}
                  combinations tested)
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="success.main"
                  fontWeight={700}
                  gutterBottom
                >
                  Best Return: +{optimizeResults.best_return}% | Sharpe:{" "}
                  {optimizeResults.best_sharpe}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Best Parameters: {JSON.stringify(optimizeResults.best_params)}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Top 10 Combinations
                </Typography>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Parameters
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Return
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Sharpe
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Win Rate
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          MaxDD
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Trades
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {optimizeResults.top_10.map((r, i) => (
                        <TableRow
                          key={i}
                          sx={i === 0 ? { bgcolor: "#f0fdf4" } : {}}
                        >
                          <TableCell>{i + 1}</TableCell>
                          <TableCell sx={{ fontSize: "0.75rem" }}>
                            {Object.entries(r.params)
                              .map(([k, v]) => `${k}=${v}`)
                              .join(", ")}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                r.total_return_pct > 0 ? "#10b981" : "#ef4444",
                              fontWeight: 700,
                            }}
                          >
                            {r.total_return_pct > 0 ? "+" : ""}
                            {r.total_return_pct}%
                          </TableCell>
                          <TableCell align="right">{r.sharpe_ratio}</TableCell>
                          <TableCell align="right">{r.win_rate_pct}%</TableCell>
                          <TableCell align="right">
                            -{r.max_drawdown_pct}%
                          </TableCell>
                          <TableCell align="right">{r.total_trades}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
};

export default BacktestView;
