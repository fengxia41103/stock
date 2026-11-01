import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import ScaleLoader from "react-spinners/ScaleLoader";

import {
  Autocomplete,
  Box,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import { useResource, useStocksOverview } from "@/api";

const GREEN = "#10b981";
const RED = "#ef4444";

// Distinct, colorblind-friendly series palette (shared across all charts so a
// symbol keeps the same color everywhere).
const PALETTE = ["#4aa3ff", "#f59e0b", "#10b981", "#ec4899", "#a855f7"];

const ColorVal = ({ val, suffix = "", decimals = 1 }) => {
  if (val == null) return <span>—</span>;
  const color = val >= 0 ? GREEN : RED;
  return (
    <span style={{ color, fontWeight: 600 }}>
      {val >= 0 ? "+" : ""}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const CompareView = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const symbolsParam = searchParams.get("symbols") || "";
  const [selectedSymbols, setSelectedSymbols] = useState(
    symbolsParam ? symbolsParam.split(",").filter(Boolean) : [],
  );

  const { data: overviewData, isLoading: overviewLoading } =
    useStocksOverview();
  const stocks = useMemo(
    () => (Array.isArray(overviewData) ? overviewData : []),
    [overviewData],
  );
  const allSymbols = useMemo(() => stocks.map((s) => s.symbol).sort(), [stocks]);

  const stockIds = useMemo(
    () =>
      stocks.filter((s) => selectedSymbols.includes(s.symbol)).map((s) => s.id),
    [stocks, selectedSymbols],
  );
  // Fetch a bounded recent window (≈1 year) for all selected stocks, with a
  // large page_size so the multi-stock series aren't truncated by pagination.
  const since = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const histQuery =
    stockIds.length > 0
      ? `/historicals/?stock__in=${stockIds.join(",")}` +
        `&on__range=${since},2100-01-01&ordering=on&page_size=5000&light=1`
      : null;
  const { data: historicals, isLoading: histLoading } = useResource(
    ["compare-hist", ...selectedSymbols],
    histQuery || "/__disabled__",
    { enabled: stockIds.length > 0 },
  );

  const handleSymbolChange = (_, newValue) => {
    const syms = newValue.slice(0, 5);
    setSelectedSymbols(syms);
    setSearchParams(syms.length > 0 ? { symbols: syms.join(",") } : {});
  };

  const metricsData = useMemo(
    () => stocks.filter((s) => selectedSymbols.includes(s.symbol)),
    [stocks, selectedSymbols],
  );

  // Consistent color per selected symbol.
  const colorFor = useMemo(() => {
    const map = {};
    selectedSymbols.forEach((s, i) => {
      map[s] = PALETTE[i % PALETTE.length];
    });
    return map;
  }, [selectedSymbols]);

  // Shared dark-theme chart defaults.
  const axisStyle = useMemo(
    () => ({ color: theme.palette.text.secondary, fontSize: "11px" }),
    [theme],
  );
  const baseChart = useMemo(
    () => ({
      backgroundColor: "transparent",
      style: { fontFamily: theme.typography.fontFamily },
    }),
    [theme],
  );

  // --- Normalized price performance (rebased to 100) ---
  const perfOptions = useMemo(() => {
    if (!historicals || !Array.isArray(historicals) || historicals.length === 0)
      return null;
    const byStock = {};
    historicals.forEach((h) => {
      const sym = stocks.find((s) => s.id === h.stock)?.symbol || h.stock;
      if (!byStock[sym]) byStock[sym] = [];
      byStock[sym].push({ date: h.on, price: h.close_price });
    });
    const series = Object.entries(byStock).map(([sym, data]) => {
      const basePrice = data[0]?.price || 1;
      return {
        name: sym,
        color: colorFor[sym],
        data: data.map((d) => [
          new Date(d.date).getTime(),
          (d.price / basePrice) * 100,
        ]),
      };
    });
    return {
      chart: { ...baseChart, type: "line", height: 360, reflow: true },
      title: { text: null },
      xAxis: {
        type: "datetime",
        labels: { style: axisStyle },
        gridLineColor: theme.palette.divider,
        lineColor: theme.palette.divider,
      },
      yAxis: {
        title: { text: "Rebased (100 = start)", style: axisStyle },
        labels: { style: axisStyle },
        gridLineColor: theme.palette.divider,
        plotLines: [
          { value: 100, color: theme.palette.divider, width: 1, dashStyle: "Dash" },
        ],
      },
      series,
      legend: { enabled: true, itemStyle: { color: theme.palette.text.primary } },
      credits: { enabled: false },
      tooltip: { shared: true, valueDecimals: 1, valueSuffix: "" },
      plotOptions: { line: { lineWidth: 2, marker: { enabled: false } } },
    };
  }, [historicals, stocks, colorFor, theme, axisStyle, baseChart]);

  // --- Period return % (first -> last close) bar ---
  const returnOptions = useMemo(() => {
    if (!historicals || !Array.isArray(historicals) || historicals.length === 0)
      return null;
    const byStock = {};
    historicals.forEach((h) => {
      const sym = stocks.find((s) => s.id === h.stock)?.symbol || h.stock;
      if (!byStock[sym]) byStock[sym] = [];
      byStock[sym].push(h.close_price);
    });
    const cats = [];
    const data = [];
    Object.entries(byStock).forEach(([sym, prices]) => {
      if (prices.length < 2 || !prices[0]) return;
      const ret = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
      cats.push(sym);
      data.push({ y: Number(ret.toFixed(1)), color: ret >= 0 ? GREEN : RED });
    });
    if (!cats.length) return null;
    return {
      chart: { ...baseChart, type: "column", height: 260 },
      title: { text: null },
      xAxis: { categories: cats, labels: { style: axisStyle }, lineColor: theme.palette.divider },
      yAxis: {
        title: { text: "Return over period (%)", style: axisStyle },
        labels: { style: axisStyle },
        gridLineColor: theme.palette.divider,
      },
      legend: { enabled: false },
      credits: { enabled: false },
      tooltip: { valueSuffix: "%", valueDecimals: 1 },
      plotOptions: {
        column: {
          borderRadius: 3,
          dataLabels: {
            enabled: true,
            format: "{y}%",
            style: { color: theme.palette.text.primary, textOutline: "none" },
          },
        },
      },
      series: [{ name: "Return", data }],
    };
  }, [historicals, stocks, theme, axisStyle, baseChart]);

  // --- Valuation & quality grouped bars (one metric per chart, one bar/symbol) ---
  const METRIC_CHARTS = [
    { key: "pe", label: "P/E" },
    { key: "pb", label: "P/B" },
    { key: "roe", label: "ROE %" },
    { key: "beta", label: "Beta" },
  ];

  const metricBar = (metric) => {
    const data = metricsData.map((s) => ({
      y: s[metric.key] != null ? Number(s[metric.key].toFixed(2)) : null,
      color: colorFor[s.symbol],
    }));
    return {
      chart: { ...baseChart, type: "bar", height: 200 },
      title: { text: metric.label, style: { color: theme.palette.text.primary, fontSize: "13px" } },
      xAxis: {
        categories: metricsData.map((s) => s.symbol),
        labels: { style: axisStyle },
        lineColor: theme.palette.divider,
      },
      yAxis: {
        title: { text: null },
        labels: { style: axisStyle },
        gridLineColor: theme.palette.divider,
      },
      legend: { enabled: false },
      credits: { enabled: false },
      tooltip: { valueDecimals: 2 },
      plotOptions: {
        bar: {
          borderRadius: 3,
          dataLabels: {
            enabled: true,
            style: { color: theme.palette.text.primary, textOutline: "none" },
          },
        },
      },
      series: [{ name: metric.label, data }],
    };
  };

  if (overviewLoading) return <ScaleLoader loading />;

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Compare Stocks
      </Typography>

      <Autocomplete
        multiple
        options={allSymbols}
        value={selectedSymbols}
        onChange={handleSymbolChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select stocks to compare (max 5)"
            size="small"
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((sym, index) => (
            <Chip
              label={sym}
              size="small"
              {...getTagProps({ index })}
              key={sym}
              sx={{
                bgcolor: colorFor[sym],
                color: "#0f141a",
                fontWeight: 700,
              }}
            />
          ))
        }
        sx={{ mb: 3, maxWidth: 600 }}
      />

      {selectedSymbols.length === 0 && (
        <Typography color="text.secondary">
          Select 2+ stocks above to compare them side-by-side.
        </Typography>
      )}

      {selectedSymbols.length >= 2 && (
        <Grid container spacing={2}>
          {/* Performance chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing={1}
              >
                Normalized price performance
              </Typography>
              {histLoading ? (
                <ScaleLoader loading />
              ) : perfOptions ? (
                <HighchartsReact highcharts={Highcharts} options={perfOptions} />
              ) : (
                <Typography color="text.secondary" mt={2}>
                  No price history available
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Period return bar */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing={1}
              >
                Return over period
              </Typography>
              {histLoading ? (
                <ScaleLoader loading />
              ) : returnOptions ? (
                <HighchartsReact
                  highcharts={Highcharts}
                  options={returnOptions}
                />
              ) : (
                <Typography color="text.secondary" mt={2}>
                  Need price history for 2+ stocks
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Valuation & quality metric bars */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing={1}
              >
                Valuation &amp; quality
              </Typography>
              <Grid container spacing={1}>
                {METRIC_CHARTS.map((metric) => (
                  <Grid item xs={12} sm={6} md={3} key={metric.key}>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={metricBar(metric)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Exact metrics table */}
          <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    {metricsData.map((s) => (
                      <TableCell key={s.symbol} align="center">
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: colorFor[s.symbol],
                            mr: 0.75,
                          }}
                        />
                        <strong>{s.symbol}</strong>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Price</TableCell>
                    {metricsData.map((s) => (
                      <TableCell key={s.symbol} align="center">
                        ${s.price?.toFixed(2) || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Daily Return</TableCell>
                    {metricsData.map((s) => (
                      <TableCell key={s.symbol} align="center">
                        <ColorVal val={s.daily_return_pct} suffix="%" />
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>P/E</TableCell>
                    {metricsData.map((s) => (
                      <TableCell key={s.symbol} align="center">
                        {s.pe?.toFixed(1) || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>P/B</TableCell>
                    {metricsData.map((s) => (
                      <TableCell key={s.symbol} align="center">
                        {s.pb?.toFixed(1) || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>ROE %</TableCell>
                    {metricsData.map((s) => (
                      <TableCell key={s.symbol} align="center">
                        {s.roe?.toFixed(1) || "—"}%
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Beta</TableCell>
                    {metricsData.map((s) => (
                      <TableCell key={s.symbol} align="center">
                        {s.beta?.toFixed(2) || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Last Lower (days)</TableCell>
                    {metricsData.map((s) => (
                      <TableCell key={s.symbol} align="center">
                        {s.last_lower || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Insider Sentiment</TableCell>
                    {metricsData.map((s) => (
                      <TableCell key={s.symbol} align="center">
                        <ColorVal
                          val={
                            s.insider_sentiment
                              ? s.insider_sentiment * 100
                              : null
                          }
                          suffix="%"
                          decimals={0}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CompareView;
