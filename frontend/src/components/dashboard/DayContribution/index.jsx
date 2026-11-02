import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { map } from "lodash";
import React from "react";

import {
  Chip,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { useDayContribution } from "@/api";

// Ranks each holding's DOLLAR contribution to today's P&L (shares x price
// move). Makes vivid that dollar P&L = position size x percent move — a huge
// position with a tiny move can contribute less than a small, fast mover.
const DayContribution = () => {
  const theme = useTheme();
  const { data, isLoading } = useDayContribution();

  if (isLoading || !data) return null;
  const rows = data.contributions || [];
  if (rows.length === 0) return null;

  const pos = theme.palette.success.main;
  const neg = theme.palette.error.main;
  const total = data.total_dollar_gain ?? 0;

  const options = {
    chart: { type: "bar", height: Math.max(240, rows.length * 26 + 60) },
    title: { text: null },
    xAxis: { categories: map(rows, (r) => r.symbol), title: { text: null } },
    yAxis: { title: { text: "Today's $ contribution" } },
    legend: { enabled: false },
    credits: { enabled: false },
    tooltip: {
      formatter() {
        const r = rows[this.point.index];
        return `<b>${r.symbol}</b><br/>$${this.y.toLocaleString()} (${
          r.day_pct == null ? "—" : `${r.day_pct > 0 ? "+" : ""}${r.day_pct}%`
        })<br/>value $${r.value.toLocaleString()}`;
      },
    },
    plotOptions: { bar: { borderRadius: 2 } },
    series: [
      {
        name: "$ gain",
        data: map(rows, (r) => ({
          y: r.dollar_gain,
          color: r.dollar_gain >= 0 ? pos : neg,
        })),
      },
    ],
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={800}>
          💰 Today&apos;s P&amp;L contribution (by $, ranked)
        </Typography>
        <Chip
          size="small"
          label={`total ${total >= 0 ? "+" : ""}$${total.toLocaleString()}`}
          sx={{
            bgcolor: total >= 0 ? pos : neg,
            color: theme.palette.getContrastText(total >= 0 ? pos : neg),
            fontWeight: 700,
          }}
        />
      </Stack>

      <HighchartsReact highcharts={Highcharts} options={options} />

      {data.note && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          {data.note}
        </Typography>
      )}
    </Paper>
  );
};

export default DayContribution;
