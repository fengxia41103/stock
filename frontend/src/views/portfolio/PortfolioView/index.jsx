import React, { useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import ScaleLoader from "react-spinners/ScaleLoader";

import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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

import { useResource, useStocks } from "@/api";
import api from "@/api/client";

const GREEN = "#10b981";
const RED = "#ef4444";

const SummaryCard = ({ label, value, color }) => (
  <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
    <Typography variant="caption" color="text.secondary" textTransform="uppercase">
      {label}
    </Typography>
    <Typography variant="h5" fontWeight={700} sx={{ color: color || "text.primary" }}>
      {value}
    </Typography>
  </Paper>
);

const AddTransactionDialog = ({ open, onClose, stocks, onSuccess }) => {
  const [form, setForm] = useState({ stock: "", action: "BUY", shares: "", price: "", date: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/portfolio/add-transaction/", {
        stock: parseInt(form.stock),
        action: form.action,
        shares: parseFloat(form.shares),
        price: parseFloat(form.price),
        date: form.date,
        notes: form.notes,
      });
      onSuccess();
      onClose();
      setForm({ stock: "", action: "BUY", shares: "", price: "", date: "", notes: "" });
    } catch (e) {
      alert("Error: " + (e.response?.data?.detail || e.message));
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Transaction</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <FormControl fullWidth size="small">
            <InputLabel>Stock</InputLabel>
            <Select value={form.stock} label="Stock" onChange={(e) => setForm({ ...form, stock: e.target.value })}>
              {(stocks || []).map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.symbol}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Action</InputLabel>
            <Select value={form.action} label="Action" onChange={(e) => setForm({ ...form, action: e.target.value })}>
              <MenuItem value="BUY">BUY</MenuItem>
              <MenuItem value="SELL">SELL</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Shares" type="number" size="small" value={form.shares} onChange={(e) => setForm({ ...form, shares: e.target.value })} />
          <TextField label="Price per share" type="number" size="small" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <TextField label="Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <TextField label="Notes" size="small" multiline rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || !form.stock || !form.shares || !form.price || !form.date}>
          {submitting ? "Saving..." : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PortfolioView = () => {
  const { data, isLoading, refetch } = useResource("portfolio-holdings", "/portfolio/holdings/");
  const { data: stocks } = useStocks();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) return <ScaleLoader loading />;

  const holdings = data?.positions || [];
  const summary = data?.summary || {};

  // Pie chart data
  const pieData = holdings
    .filter((p) => p.market_value && p.market_value > 0)
    .map((p) => ({ name: p.symbol, y: p.market_value }));

  const pieOptions = {
    chart: { type: "pie", backgroundColor: "transparent", height: 280 },
    title: { text: null },
    series: [{ name: "Value", data: pieData, colorByPoint: true }],
    plotOptions: {
      pie: {
        dataLabels: { enabled: true, format: "<b>{point.name}</b>: ${point.y:,.0f}", style: { color: "#f8fafc", textOutline: "none", fontSize: "11px" } },
        borderWidth: 0,
      },
    },
    credits: { enabled: false },
    tooltip: { pointFormat: "<b>${point.y:,.2f}</b> ({point.percentage:.1f}%)" },
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>Portfolio</Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => setDialogOpen(true)}>
          Add Transaction
        </Button>
      </Stack>

      {/* Summary cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <SummaryCard label="Total Value" value={`$${(summary.total_value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard label="Total Cost" value={`$${(summary.total_cost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Total P&L"
            value={`${summary.total_pnl >= 0 ? "+" : ""}$${(summary.total_pnl || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            color={summary.total_pnl >= 0 ? GREEN : RED}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Return %"
            value={`${summary.total_pnl_pct >= 0 ? "+" : ""}${(summary.total_pnl_pct || 0).toFixed(1)}%`}
            color={summary.total_pnl_pct >= 0 ? GREEN : RED}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Holdings table */}
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Shares</TableCell>
                  <TableCell align="right">Avg Cost</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">P&L</TableCell>
                  <TableCell align="right">%</TableCell>
                  <TableCell align="right">Weight</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holdings.map((p) => {
                  const weight = summary.total_value > 0 ? (p.market_value / summary.total_value * 100) : 0;
                  return (
                    <TableRow key={p.id} hover>
                      <TableCell><strong>{p.symbol}</strong></TableCell>
                      <TableCell align="right">{p.shares.toFixed(1)}</TableCell>
                      <TableCell align="right">${p.avg_cost?.toFixed(2)}</TableCell>
                      <TableCell align="right">${p.current_price?.toFixed(2) || "—"}</TableCell>
                      <TableCell align="right">${p.market_value?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || "—"}</TableCell>
                      <TableCell align="right" sx={{ color: p.pnl >= 0 ? GREEN : RED, fontWeight: 600 }}>
                        {p.pnl != null ? `${p.pnl >= 0 ? "+" : ""}$${p.pnl.toFixed(0)}` : "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ color: p.pnl_pct >= 0 ? GREEN : RED }}>
                        {p.pnl_pct != null ? `${p.pnl_pct >= 0 ? "+" : ""}${p.pnl_pct.toFixed(1)}%` : "—"}
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={`${weight.toFixed(1)}%`} size="small" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {holdings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" py={3}>No positions yet. Add a transaction to start tracking.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Pie chart */}
        <Grid item xs={12} md={4}>
          {pieData.length > 0 && (
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>
                Allocation
              </Typography>
              <HighchartsReact highcharts={Highcharts} options={pieOptions} />
            </Paper>
          )}
        </Grid>
      </Grid>

      <AddTransactionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        stocks={stocks}
        onSuccess={refetch}
      />
    </Box>
  );
};

export default PortfolioView;
