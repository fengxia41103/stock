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

import { useEarnings } from "@/api";
import StockDetailContext from "../StockDetailView/context";

const EarningsView = () => {
  const stock = useContext(StockDetailContext);
  const { data: earnings, isLoading } = useEarnings(stock?.id);

  const { chartOption, beatRate, upcoming } = useMemo(() => {
    if (!earnings || !Array.isArray(earnings) || earnings.length === 0) {
      return { chartOption: null, beatRate: null, upcoming: [] };
    }

    const reported = earnings.filter((e) => e.reported_eps != null);
    const upcomingEvents = earnings.filter((e) => e.is_upcoming);
    const beats = reported.filter((e) => e.surprise_pct > 0).length;
    const rate = reported.length > 0 ? (beats / reported.length) * 100 : null;

    // Chart: surprise % per quarter
    const sorted = [...reported].reverse().slice(-16);
    const option =
      sorted.length > 0
        ? {
            chart: {
              type: "column",
              backgroundColor: "transparent",
              height: 280,
            },
            title: { text: undefined },
            xAxis: {
              categories: sorted.map((e) => e.report_date),
              labels: {
                rotation: -45,
                style: { color: "#94a3b8" },
              },
              lineColor: "#334155",
            },
            yAxis: {
              title: { text: "Surprise %", style: { color: "#94a3b8" } },
              labels: { style: { color: "#94a3b8" } },
              gridLineColor: "#334155",
            },
            tooltip: {
              style: { color: "#94a3b8" },
              backgroundColor: "#1e293b",
              borderColor: "#334155",
              pointFormat: "Surprise: <b>{point.y:.1f}%</b>",
            },
            legend: { enabled: false },
            plotOptions: {
              column: {
                colorByPoint: true,
              },
            },
            colors: sorted.map((e) =>
              (e.surprise_pct || 0) > 0 ? "#4caf50" : "#f44336",
            ),
            series: [
              {
                name: "Surprise %",
                data: sorted.map((e) => e.surprise_pct || 0),
              },
            ],
            credits: { enabled: false },
          }
        : null;

    return { chartOption: option, beatRate: rate, upcoming: upcomingEvents };
  }, [earnings]);

  if (isLoading) return <ScaleLoader loading />;
  if (!earnings || earnings.length === 0) {
    return (
      <Typography color="text.secondary">
        No earnings data. Set ALPHA_VANTAGE_API_KEY and run
        earnings_calendar_daily.
      </Typography>
    );
  }

  return (
    <Box>
      {/* Upcoming earnings alert */}
      {upcoming.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⏰ Next earnings: {upcoming[0].report_date}
          {upcoming[0].estimated_eps &&
            ` (est EPS: $${upcoming[0].estimated_eps.toFixed(2)})`}
        </Alert>
      )}

      {/* Beat rate */}
      {beatRate !== null && (
        <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
          <Typography variant="h6">Beat Rate:</Typography>
          <Chip
            label={`${beatRate.toFixed(0)}%`}
            color={
              beatRate >= 75 ? "success" : beatRate >= 50 ? "warning" : "error"
            }
          />
          <Typography variant="body2" color="text.secondary">
            ({earnings.filter((e) => e.reported_eps != null).length} quarters)
          </Typography>
        </Box>
      )}

      {/* Surprise chart */}
      {chartOption && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            EPS Surprise % by Quarter
          </Typography>
          <HighchartsReact highcharts={Highcharts} options={chartOption} />
        </Paper>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Est EPS</TableCell>
              <TableCell align="right">Actual EPS</TableCell>
              <TableCell align="right">Surprise %</TableCell>
              <TableCell>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {earnings.slice(0, 20).map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.report_date}</TableCell>
                <TableCell align="right">
                  {e.estimated_eps != null
                    ? `$${e.estimated_eps.toFixed(2)}`
                    : "—"}
                </TableCell>
                <TableCell align="right">
                  {e.reported_eps != null
                    ? `$${e.reported_eps.toFixed(2)}`
                    : "—"}
                </TableCell>
                <TableCell align="right">
                  {e.surprise_pct != null
                    ? `${e.surprise_pct > 0 ? "+" : ""}${e.surprise_pct.toFixed(
                        1,
                      )}%`
                    : "—"}
                </TableCell>
                <TableCell>
                  {e.is_upcoming ? (
                    <Chip label="Upcoming" size="small" color="info" />
                  ) : e.is_beat === true ? (
                    <Chip label="Beat" size="small" color="success" />
                  ) : e.is_beat === false ? (
                    <Chip label="Miss" size="small" color="error" />
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EarningsView;
