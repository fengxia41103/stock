import React, { useMemo, useState } from "react";
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Paper,
  Typography,
} from "@mui/material";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { useMacroData } from "@/api";

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
            label={
              <Chip
                label={s.label}
                size="small"
                sx={{ bgcolor: s.color, color: "#fff" }}
              />
            }
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
  const queries = selected.map((id) => ({
    id,
    ...MACRO_SERIES.find((s) => s.id === id),
  }));

  return (
    <Box mt={1}>
      {queries.map((q) => (
        <MacroSeriesChart
          key={q.id}
          seriesId={q.id}
          label={q.label}
          color={q.color}
          startDate={startDate}
          priceData={priceData}
        />
      ))}
    </Box>
  );
};

const MacroSeriesChart = ({ seriesId, label, color, startDate, priceData }) => {
  const { data: macroPoints } = useMacroData(seriesId, startDate);

  const options = useMemo(() => {
    if (!macroPoints || !Array.isArray(macroPoints) || macroPoints.length === 0)
      return null;

    const priceDates = priceData.map((d) => d.on);
    const macroMap = {};
    macroPoints.forEach((p) => {
      macroMap[p.date] = p.value;
    });
    const macroDates = [...macroPoints].reverse().map((p) => p.date);
    const allDates = [...new Set([...priceDates, ...macroDates])].sort();

    return {
      chart: { backgroundColor: "transparent", height: 250 },
      title: { text: null },
      xAxis: {
        categories: allDates,
        labels: {
          style: { color: "#94a3b8" },
          rotation: -45,
          step: Math.ceil(allDates.length / 15),
        },
      },
      yAxis: [
        {
          title: { text: "Price ($)", style: { color: "#94a3b8" } },
          labels: { style: { color: "#94a3b8" } },
          gridLineColor: "#334155",
        },
        {
          title: { text: label, style: { color } },
          labels: { style: { color } },
          opposite: true,
          gridLineWidth: 0,
        },
      ],
      legend: { itemStyle: { color: "#e2e8f0" } },
      credits: { enabled: false },
      tooltip: {
        shared: true,
        backgroundColor: "#1e293b",
        borderColor: "#475569",
        style: { color: "#f8fafc" },
      },
      series: [
        {
          name: "Close Price",
          yAxis: 0,
          data: allDates.map((d) => {
            const p = priceData.find((x) => x.on === d);
            return p ? p.close_price : null;
          }),
          color: "#3b82f6",
          lineWidth: 2,
          connectNulls: true,
          marker: { enabled: false },
        },
        {
          name: label,
          yAxis: 1,
          data: allDates.map((d) => macroMap[d] ?? null),
          color,
          lineWidth: 2,
          dashStyle: "Dash",
          connectNulls: true,
          marker: { enabled: false },
        },
      ],
    };
  }, [macroPoints, priceData, label, color]);

  if (!options) {
    return (
      <Typography variant="caption" color="text.secondary">
        No data for {label}. Set FRED_API_KEY and run fred_weekly.
      </Typography>
    );
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default MacroOverlay;
