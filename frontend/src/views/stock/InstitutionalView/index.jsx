import React, { useContext, useMemo } from "react";
import {
  Box,
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

import { useHoldings } from "@/api";
import StockDetailContext from "../StockDetailView/context";

const InstitutionalView = () => {
  const stock = useContext(StockDetailContext);
  const { data: holdings, isLoading } = useHoldings(stock?.id);

  const pieOption = useMemo(() => {
    if (!holdings || !Array.isArray(holdings) || holdings.length === 0)
      return null;

    const data = holdings.slice(0, 10).map((h) => ({
      name: h.institution_name,
      y: h.shares,
    }));

    return {
      chart: {
        type: "pie",
        backgroundColor: "transparent",
        height: 350,
      },
      title: { text: undefined },
      tooltip: {
        pointFormat: "{point.y:,.0f} shares ({point.percentage:.1f}%)",
        style: { color: "#94a3b8" },
        backgroundColor: "#1e293b",
        borderColor: "#334155",
      },
      plotOptions: {
        pie: {
          innerSize: "40%",
          dataLabels: {
            enabled: true,
            format: "{point.name}<br/>{point.percentage:.1f}%",
            style: { color: "#94a3b8", textOutline: "none" },
          },
        },
      },
      series: [
        {
          name: "Shares",
          data,
        },
      ],
      credits: { enabled: false },
    };
  }, [holdings]);

  if (isLoading) return <ScaleLoader loading />;
  if (!holdings || holdings.length === 0) {
    return (
      <Box>
        <Typography color="text.secondary">
          No institutional holding data yet. Run `holdings_quarterly` task or
          wait for next scheduled fetch.
        </Typography>
        {stock && (
          <Box mt={2}>
            <Typography variant="body2">
              From Yahoo: {stock.institution_count} institutions, top 10 own{" "}
              {((stock.top_ten_institution_ownership || 0) * 100).toFixed(1)}%
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Pie Chart */}
      {pieOption && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Top Holders
          </Typography>
          <HighchartsReact highcharts={Highcharts} options={pieOption} />
        </Paper>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Institution</TableCell>
              <TableCell>Report Date</TableCell>
              <TableCell align="right">Shares</TableCell>
              <TableCell align="right">Value ($K)</TableCell>
              <TableCell>Change</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holdings.map((h) => (
              <TableRow key={h.id}>
                <TableCell>{h.institution_name}</TableCell>
                <TableCell>{h.report_date}</TableCell>
                <TableCell align="right">
                  {h.shares?.toLocaleString()}
                </TableCell>
                <TableCell align="right">{h.value?.toLocaleString()}</TableCell>
                <TableCell>{h.change_type || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InstitutionalView;
