import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { map } from "lodash";
import React from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import { useSectorCompare } from "@/api";

const fmtPct = (v) =>
  v === null || v === undefined ? "—" : `${v > 0 ? "+" : ""}${v}%`;
const fmtNum = (v) => (v === null || v === undefined ? "—" : v);

const SectorComparison = () => {
  const { data, isLoading } = useSectorCompare();

  if (isLoading) return <ScaleLoader loading />;

  const sectors = data?.sectors || [];
  if (!sectors.length) return null;

  const names = map(sectors, (s) => s.name);
  const chartOptions = {
    chart: { type: "column", height: 320 },
    title: { text: null },
    xAxis: { categories: names, title: { text: null } },
    yAxis: { title: { text: "Equal-weight return (%)" } },
    tooltip: { valueSuffix: "%", shared: true },
    credits: { enabled: false },
    plotOptions: { column: { borderRadius: 2 } },
    series: [
      { name: "1M", data: map(sectors, (s) => s.return_1m) },
      { name: "3M", data: map(sectors, (s) => s.return_3m) },
      { name: "1Y", data: map(sectors, (s) => s.return_1y) },
    ],
  };

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Typography variant="h6">Portfolio comparison</Typography>
          <Tooltip
            title="Each portfolio is treated as an EQUAL-WEIGHT basket of its stocks (the app does not store share counts), so these are not dollar-weighted returns."
            arrow
          >
            <Chip label="equal-weight" size="small" color="info" />
          </Tooltip>
        </Box>

        <HighchartsReact highcharts={Highcharts} options={chartOptions} />

        <Box mt={2} sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Portfolio</TableCell>
                <TableCell align="right">Stocks</TableCell>
                <TableCell align="right">1M</TableCell>
                <TableCell align="right">3M</TableCell>
                <TableCell align="right">1Y</TableCell>
                <TableCell align="right">Vol (ann.)</TableCell>
                <TableCell align="right">Avg P/E</TableCell>
                <TableCell align="right">Avg ROE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {map(sectors, (s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.name}</TableCell>
                  <TableCell align="right">{s.num_stocks}</TableCell>
                  <TableCell align="right">{fmtPct(s.return_1m)}</TableCell>
                  <TableCell align="right">{fmtPct(s.return_3m)}</TableCell>
                  <TableCell align="right">{fmtPct(s.return_1y)}</TableCell>
                  <TableCell align="right">
                    {s.volatility_annual === null
                      ? "—"
                      : `${s.volatility_annual}%`}
                  </TableCell>
                  <TableCell align="right">{fmtNum(s.avg_pe)}</TableCell>
                  <TableCell align="right">{fmtNum(s.avg_roe)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SectorComparison;
