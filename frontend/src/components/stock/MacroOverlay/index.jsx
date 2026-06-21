import React, { useState } from "react";
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Paper,
  Typography,
} from "@mui/material";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

import { useMacroData } from "@/api";

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const MACRO_SERIES = [
  { id: "DGS10", label: "10Y Treasury (%)", color: "#ff9800" },
  { id: "T10Y2Y", label: "2s10s Spread (%)", color: "#9c27b0" },
  { id: "BAMLH0A0HYM2", label: "HY Spread (%)", color: "#f44336" },
  { id: "FEDFUNDS", label: "Fed Funds (%)", color: "#2196f3" },
];

const MacroOverlay = ({ priceData }) => {
  const [selected, setSelected] = useState([]);

  const startDate = priceData && priceData.length > 0 ? priceData[0].on : null;

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Macro Overlay
      </Typography>
      <FormGroup row>
        {MACRO_SERIES.map((s) => (
          <FormControlLabel
            key={s.id}
            control={
              <Checkbox
                size="small"
                checked={selected.includes(s.id)}
                onChange={(e) => {
                  setSelected((prev) =>
                    e.target.checked
                      ? [...prev, s.id]
                      : prev.filter((x) => x !== s.id),
                  );
                }}
              />
            }
            label={<Chip label={s.label} size="small" sx={{ bgcolor: s.color, color: "#fff" }} />}
          />
        ))}
      </FormGroup>
      {selected.length > 0 && (
        <MacroChart
          selected={selected}
          priceData={priceData}
          startDate={startDate}
        />
      )}
    </Paper>
  );
};

const MacroChart = ({ selected, priceData, startDate }) => {
  // Fetch all selected series
  const queries = selected.map((id) => ({
    id,
    ...MACRO_SERIES.find((s) => s.id === id),
  }));

  return (
    <Box mt={1}>
      {queries.map((q) => (
        <MacroSeriesChart key={q.id} seriesId={q.id} label={q.label} color={q.color} startDate={startDate} priceData={priceData} />
      ))}
    </Box>
  );
};

const MacroSeriesChart = ({ seriesId, label, color, startDate, priceData }) => {
  const { data: macroPoints } = useMacroData(seriesId, startDate);

  if (!macroPoints || !Array.isArray(macroPoints) || macroPoints.length === 0) {
    return <Typography variant="caption" color="text.secondary">No data for {label}. Set FRED_API_KEY and run fred_weekly.</Typography>;
  }

  // Build dual-axis chart: price on left, macro on right
  const priceDates = priceData.map((d) => d.on);
  const priceValues = priceData.map((d) => d.close_price);

  // Align macro data to date strings
  const macroMap = {};
  macroPoints.forEach((p) => { macroMap[p.date] = p.value; });
  const macroDates = [...macroPoints].reverse().map((p) => p.date);
  const macroValues = [...macroPoints].reverse().map((p) => p.value);

  // Merge into unified dates
  const allDates = [...new Set([...priceDates, ...macroDates])].sort();

  const option = {
    tooltip: { trigger: "axis" },
    legend: { data: ["Close Price", label] },
    xAxis: { type: "category", data: allDates, axisLabel: { rotate: 45 } },
    yAxis: [
      { type: "value", name: "Price ($)", position: "left" },
      { type: "value", name: label, position: "right" },
    ],
    series: [
      {
        name: "Close Price",
        type: "line",
        yAxisIndex: 0,
        data: allDates.map((d) => {
          const p = priceData.find((x) => x.on === d);
          return p ? p.close_price : null;
        }),
        connectNulls: true,
        lineStyle: { width: 2 },
      },
      {
        name: label,
        type: "line",
        yAxisIndex: 1,
        data: allDates.map((d) => macroMap[d] ?? null),
        connectNulls: true,
        lineStyle: { type: "dashed", width: 2, color },
        itemStyle: { color },
      },
    ],
  };

  return (
    <ReactEChartsCore echarts={echarts} option={option} style={{ height: 250 }} />
  );
};

export default MacroOverlay;
