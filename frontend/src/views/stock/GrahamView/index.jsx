import React, { useContext } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import {
  Box,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { useResource } from "@/api";
import StockDetailContext from "@Views/stock/StockDetailView/context";

const GrahamView = () => {
  const stock = useContext(StockDetailContext);
  const { data, isLoading } = useResource(
    ["graham", String(stock.id)],
    `/stocks/${stock.id}/graham/`,
  );

  if (isLoading) return <ScaleLoader loading />;
  if (!data) return <Typography>No data available</Typography>;

  const fmt = (v, decimals = 2) =>
    v != null ? Number(v).toFixed(decimals) : "—";

  const CriteriaRow = ({ label, passed, description }) => (
    <TableRow>
      <TableCell sx={{ width: 40 }}>
        {passed ? (
          <CheckCircleIcon color="success" />
        ) : (
          <CancelIcon color="error" />
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="bold">
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </TableCell>
    </TableRow>
  );

  const marginColor =
    data.graham_margin_of_safety > 20
      ? "success"
      : data.graham_margin_of_safety > 0
      ? "warning"
      : "error";

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Benjamin Graham Valuation — {stock.symbol}
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {/* Score */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h2" color="primary">
              {data.graham_score}/7
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Graham Score
            </Typography>
          </Paper>
        </Grid>

        {/* Intrinsic Value */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h4">
              ${fmt(data.graham_intrinsic_value)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Graham Intrinsic Value
            </Typography>
            <Typography variant="caption">
              Current: ${fmt(data.price)}
            </Typography>
          </Paper>
        </Grid>

        {/* Margin of Safety */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Chip
              label={`${fmt(data.graham_margin_of_safety, 1)}%`}
              color={marginColor}
              sx={{ fontSize: "1.2rem", height: 40, px: 2 }}
            />
            <Typography variant="body2" color="text.secondary" mt={1}>
              Margin of Safety
            </Typography>
            <Typography variant="caption">
              {data.graham_margin_of_safety > 0 ? "Undervalued" : "Overvalued"}
            </Typography>
          </Paper>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Valuation Metrics
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>PE Ratio</TableCell>
                  <TableCell align="right">{fmt(data.pe)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>P/B Ratio</TableCell>
                  <TableCell align="right">{fmt(data.pb)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    PE × P/B{" "}
                    <Typography variant="caption" color="text.secondary">
                      (should be &lt; 22.5)
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        data.pe_pb_product && data.pe_pb_product < 22.5
                          ? "success.main"
                          : "error.main",
                      fontWeight: "bold",
                    }}
                  >
                    {fmt(data.pe_pb_product)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Graham Number</TableCell>
                  <TableCell align="right">
                    ${fmt(data.graham_number)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Net-Net Ratio{" "}
                    <Typography variant="caption" color="text.secondary">
                      (&lt; 0.67 = buy)
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        data.net_net_ratio && data.net_net_ratio < 0.67
                          ? "success.main"
                          : undefined,
                    }}
                  >
                    {fmt(data.net_net_ratio)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Criteria Checklist */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Screening Criteria
            </Typography>
            <Table size="small">
              <TableBody>
                <CriteriaRow
                  label="Adequate Size"
                  passed={data.criteria?.size}
                  description="Revenue > $100M"
                />
                <CriteriaRow
                  label="Strong Liquidity"
                  passed={data.criteria?.current_ratio_gt_2}
                  description="Current ratio > 2x"
                />
                <CriteriaRow
                  label="Moderate PE"
                  passed={data.criteria?.pe_lt_15}
                  description="PE < 15x"
                />
                <CriteriaRow
                  label="PE × P/B < 22.5"
                  passed={data.criteria?.pe_pb_lt_22_5}
                  description="Combined valuation screen"
                />
                <CriteriaRow
                  label="Low Debt"
                  passed={data.criteria?.low_debt}
                  description="Total debt < working capital"
                />
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GrahamView;
