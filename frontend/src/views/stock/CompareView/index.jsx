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

import { useResource, useStocksOverview } from "@/api";
import api from "@/api/client";

const GREEN = "#10b981";
const RED = "#ef4444";

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
  const allSymbols = useMemo(
    () => stocks.map((s) => s.symbol).sort(),
    [stocks],
  );

  // Fetch historicals for selected stocks (last 6 months)
  const stockIds = useMemo(
    () =>
      stocks.filter((s) => selectedSymbols.includes(s.symbol)).map((s) => s.id),
    [stocks, selectedSymbols],
  );
  const histQuery =
    stockIds.length > 0
      ? `/historicals/?stock__in=${stockIds.join(",")}&ordering=on`
      : null;
  const { data: historicals, isLoading: histLoading } = useResource(
    ["compare-hist", ...selectedSymbols],
    histQuery || "/__disabled__",
    { enabled: stockIds.length > 0 },
  );

  const handleSymbolChange = (_, newValue) => {
    const syms = newValue.slice(0, 5); // max 5
    setSelectedSymbols(syms);
    setSearchParams(syms.length > 0 ? { symbols: syms.join(",") } : {});
  };

  // Build normalized price series
  const chartOptions = useMemo(() => {
    if (!historicals || !Array.isArray(historicals) || historicals.length === 0)
      return null;

    // Group by stock
    const byStock = {};
    historicals.forEach((h) => {
      const sym = stocks.find((s) => s.id === h.stock)?.symbol || h.stock;
      if (!byStock[sym]) byStock[sym] = [];
      byStock[sym].push({ date: h.on, price: h.close_price });
    });

    // Normalize: first price = 100
    const series = Object.entries(byStock).map(([sym, data]) => {
      const basePrice = data[0]?.price || 1;
      return {
        name: sym,
        data: data.map((d) => [
          new Date(d.date).getTime(),
          (d.price / basePrice) * 100,
        ]),
      };
    });

    return {
      chart: { backgroundColor: "transparent", height: 350, reflow: true },
      title: { text: null },
      xAxis: { type: "datetime" },
      yAxis: {
        title: { text: "Normalized (100 = start)" },
        labels: { format: "{value}" },
      },
      series,
      legend: { enabled: true, itemStyle: { color: "#94a3b8" } },
      credits: { enabled: false },
      tooltip: { shared: true, valueSuffix: "", valueDecimals: 1 },
    };
  }, [historicals, stocks]);

  // Metrics table
  const metricsData = useMemo(
    () => stocks.filter((s) => selectedSymbols.includes(s.symbol)),
    [stocks, selectedSymbols],
  );

  if (overviewLoading) return <ScaleLoader loading />;

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Compare Stocks
      </Typography>

      {/* Stock picker */}
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
          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing={1}
              >
                Normalized Price Performance
              </Typography>
              {histLoading ? (
                <ScaleLoader loading />
              ) : chartOptions ? (
                <HighchartsReact
                  highcharts={Highcharts}
                  options={chartOptions}
                />
              ) : (
                <Typography color="text.secondary" mt={2}>
                  No data available
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Metrics table */}
          <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    {metricsData.map((s) => (
                      <TableCell key={s.symbol} align="center">
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
