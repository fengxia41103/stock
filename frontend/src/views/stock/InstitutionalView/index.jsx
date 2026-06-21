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
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import ScaleLoader from "react-spinners/ScaleLoader";

import { useHoldings } from "@/api";
import StockDetailContext from "../StockDetailView/context";

echarts.use([
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

const InstitutionalView = () => {
  const stock = useContext(StockDetailContext);
  const { data: holdings, isLoading } = useHoldings(stock?.id);

  const pieOption = useMemo(() => {
    if (!holdings || !Array.isArray(holdings) || holdings.length === 0)
      return null;

    const data = holdings.slice(0, 10).map((h) => ({
      name: h.institution_name,
      value: h.shares,
    }));

    return {
      tooltip: { trigger: "item", formatter: "{b}: {c} shares ({d}%)" },
      series: [
        {
          type: "pie",
          radius: ["30%", "70%"],
          data,
          label: { formatter: "{b}\n{d}%" },
        },
      ],
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
          <ReactEChartsCore
            echarts={echarts}
            option={pieOption}
            style={{ height: 350 }}
          />
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
