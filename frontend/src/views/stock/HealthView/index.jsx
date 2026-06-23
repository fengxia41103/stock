import React, { useContext } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
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
  Typography,
} from "@mui/material";
import ScaleLoader from "react-spinners/ScaleLoader";

import { useStockHealth } from "@/api";
import StockDetailContext from "../StockDetailView/context";

const fmt = (val, suffix = "") => {
  if (val == null) return "—";
  if (typeof val === "number") {
    if (Math.abs(val) > 1e9) return `$${(val / 1e9).toFixed(1)}B${suffix}`;
    if (Math.abs(val) > 1e6) return `$${(val / 1e6).toFixed(0)}M${suffix}`;
    return `${val}${suffix}`;
  }
  return String(val);
};

const RatioCard = ({ label, value, suffix, good, bad }) => {
  const num = typeof value === "number" ? value : null;
  let color = "default";
  if (num != null && good != null && num >= good) color = "success";
  if (num != null && bad != null && num <= bad) color = "error";

  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6" color={`${color}.main`}>
          {fmt(value, suffix)}
        </Typography>
      </CardContent>
    </Card>
  );
};

const HealthView = () => {
  const stock = useContext(StockDetailContext);
  const { data, isLoading } = useStockHealth(stock?.id);

  if (isLoading) return <ScaleLoader loading />;
  if (!data || data.error) {
    return (
      <Typography color="text.secondary">
        {data?.error || "No health data available."}
      </Typography>
    );
  }

  const { ratios, health } = data;
  const flags = health?.flags || [];

  return (
    <Box>
      {/* Health Status */}
      <Box mb={2}>
        {health.healthy ? (
          <Alert severity="success">
            ✅ No red flags detected — passes SEC health screen
          </Alert>
        ) : (
          <Alert severity="warning">⚠️ Flags: {flags.join(", ")}</Alert>
        )}
      </Box>

      {/* Altman Z-Score */}
      {health.altman_z && (
        <Box mb={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1">Altman Z-Score:</Typography>
            <Chip
              label={`${health.altman_z} (${health.altman_zone})`}
              color={
                health.altman_zone === "SAFE"
                  ? "success"
                  : health.altman_zone === "GRAY"
                  ? "warning"
                  : "error"
              }
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {">"} 2.99 = Safe | 1.8–2.99 = Gray | {"<"} 1.8 = Distress
          </Typography>
        </Box>
      )}

      {/* Ratio Cards */}
      <Grid container spacing={1} mb={2}>
        <Grid item xs={6} sm={4} md={3}>
          <RatioCard
            label="Current Ratio"
            value={ratios.current_ratio}
            good={1.5}
            bad={1.0}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <RatioCard
            label="Debt / Equity"
            value={ratios.debt_to_equity}
            good={0}
            bad={2.0}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <RatioCard
            label="Interest Coverage"
            value={ratios.interest_coverage}
            suffix="x"
            good={5}
            bad={3}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <RatioCard
            label="ROCE"
            value={ratios.roce_pct}
            suffix="%"
            good={15}
            bad={5}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <RatioCard
            label="Net Margin"
            value={ratios.net_margin_pct}
            suffix="%"
            good={15}
            bad={5}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <RatioCard
            label="OCF / Net Income"
            value={ratios.ocf_to_net_income}
            suffix="x"
            good={1.0}
            bad={0.8}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <RatioCard label="Free Cash Flow" value={ratios.fcf} />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <RatioCard
            label="Accrual Ratio"
            value={health.accrual_ratio_pct}
            suffix="%"
            good={-5}
            bad={5}
          />
        </Grid>
      </Grid>

      {/* Explanation */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Flag</TableCell>
              <TableCell>Meaning</TableCell>
              <TableCell>Darwin Kill List</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>HIGH_LEVERAGE</TableCell>
              <TableCell>Debt/Equity {">"} 2.0</TableCell>
              <TableCell>#2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>LOW_LIQUIDITY</TableCell>
              <TableCell>Current ratio {"<"} 1.0</TableCell>
              <TableCell>#2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>WEAK_COVERAGE</TableCell>
              <TableCell>Interest coverage {"<"} 3x</TableCell>
              <TableCell>#2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>POOR_CASH_CONVERSION</TableCell>
              <TableCell>
                OCF/NI {"<"} 0.8 (earnings not backed by cash)
              </TableCell>
              <TableCell>#1/#10</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>HIGH_ACCRUALS</TableCell>
              <TableCell>
                |Accruals/Assets| {">"} 5% (possible manipulation)
              </TableCell>
              <TableCell>#1/#10</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>DISTRESS_RISK</TableCell>
              <TableCell>Altman Z {"<"} 1.8</TableCell>
              <TableCell>#2/#5</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HealthView;
