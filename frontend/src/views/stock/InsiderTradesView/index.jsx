import React, { useContext, useMemo } from "react";
import {
  Alert,
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
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import ScaleLoader from "react-spinners/ScaleLoader";

import { useInsiderTrades } from "@/api";
import StockDetailContext from "../StockDetailView/context";

const InsiderTradesView = () => {
  const stock = useContext(StockDetailContext);
  const { data: trades, isLoading } = useInsiderTrades(stock?.id);

  const { sentiment, chartOption, purchases, sales } = useMemo(() => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return { sentiment: 0, chartOption: null, purchases: [], sales: [] };
    }

    const buys = trades.filter((t) => t.transaction_type === "P");
    const sells = trades.filter((t) => t.transaction_type === "S");

    const buyValue = buys.reduce((s, t) => s + (t.total_value || 0), 0);
    const sellValue = sells.reduce((s, t) => s + (t.total_value || 0), 0);
    const total = buyValue + sellValue;
    const sent = total > 0 ? (buyValue - sellValue) / total : 0;

    // Group by month for chart
    const monthly = {};
    trades.forEach((t) => {
      if (t.transaction_type !== "P" && t.transaction_type !== "S") return;
      const month = t.trade_date.slice(0, 7);
      if (!monthly[month]) monthly[month] = { buy: 0, sell: 0 };
      const val = t.total_value || 0;
      if (t.transaction_type === "P") monthly[month].buy += val;
      else monthly[month].sell += val;
    });

    const months = Object.keys(monthly).sort();
    const option = {
      chart: {
        type: "bar",
        backgroundColor: "transparent",
        height: 300,
      },
      title: { text: undefined },
      xAxis: {
        categories: months,
        labels: { style: { color: "#94a3b8" } },
        lineColor: "#334155",
      },
      yAxis: {
        title: { text: null },
        labels: {
          style: { color: "#94a3b8" },
          formatter: function () {
            const v = Math.abs(this.value);
            return v >= 1e6
              ? `$${(v / 1e6).toFixed(1)}M`
              : `$${(v / 1e3).toFixed(0)}K`;
          },
        },
        gridLineColor: "#334155",
      },
      tooltip: {
        shared: true,
        style: { color: "#94a3b8" },
        backgroundColor: "#1e293b",
        borderColor: "#334155",
      },
      legend: {
        itemStyle: { color: "#94a3b8" },
      },
      plotOptions: {
        bar: {
          stacking: "normal",
        },
      },
      series: [
        {
          name: "Purchases",
          data: months.map((m) => monthly[m].buy),
          color: "#4caf50",
        },
        {
          name: "Sales",
          data: months.map((m) => -monthly[m].sell),
          color: "#f44336",
        },
      ],
      credits: { enabled: false },
    };

    return {
      sentiment: sent,
      chartOption: option,
      purchases: buys,
      sales: sells,
    };
  }, [trades]);

  if (isLoading) return <ScaleLoader loading />;
  if (!trades || trades.length === 0) {
    return (
      <Typography color="text.secondary">No insider trades found.</Typography>
    );
  }

  // Cluster buy detection: 3+ unique insiders bought within 14 days
  const recentBuyers = new Set();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  purchases.forEach((t) => {
    if (new Date(t.trade_date) >= cutoff) recentBuyers.add(t.insider_cik);
  });
  const clusterBuy = recentBuyers.size >= 3;

  return (
    <Box>
      {clusterBuy && (
        <Alert severity="success" sx={{ mb: 2 }}>
          🚨 Cluster Buy Alert: {recentBuyers.size} unique insiders purchased in
          the last 14 days
        </Alert>
      )}

      {/* Sentiment */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <Typography variant="h6">Insider Sentiment (3M):</Typography>
        <Chip
          label={
            sentiment > 0
              ? `+${(sentiment * 100).toFixed(0)}%`
              : `${(sentiment * 100).toFixed(0)}%`
          }
          color={
            sentiment > 0 ? "success" : sentiment < 0 ? "error" : "default"
          }
        />
        <Typography variant="body2" color="text.secondary">
          {purchases.length} buys, {sales.length} sales
        </Typography>
      </Box>

      {/* Chart */}
      {chartOption && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <HighchartsReact highcharts={Highcharts} options={chartOption} />
        </Paper>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Insider</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Shares</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trades.slice(0, 50).map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.trade_date}</TableCell>
                <TableCell>{t.insider_name}</TableCell>
                <TableCell>{t.insider_title}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      t.transaction_type === "P"
                        ? "Buy"
                        : t.transaction_type === "S"
                        ? "Sell"
                        : t.transaction_type
                    }
                    size="small"
                    color={
                      t.transaction_type === "P"
                        ? "success"
                        : t.transaction_type === "S"
                        ? "error"
                        : "default"
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  {t.shares?.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {t.price_per_share ? `$${t.price_per_share.toFixed(2)}` : "—"}
                </TableCell>
                <TableCell align="right">
                  {t.total_value
                    ? `$${(t.total_value / 1000).toFixed(1)}K`
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InsiderTradesView;
