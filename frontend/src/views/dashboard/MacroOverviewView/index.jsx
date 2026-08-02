import React from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import ScaleLoader from "react-spinners/ScaleLoader";

import { useResource } from "@/api";
import { Page } from "@/components/shared";

const CATEGORIES = {
  rates: "Interest Rates",
  employment: "Employment",
  inflation: "Inflation",
  gdp: "Economic Activity",
  recession: "Recession Indicators",
  housing: "Housing",
};

const MacroOverviewView = () => {
  const { data: series, isLoading } = useResource(
    "macro-series",
    "/macro-series/",
  );

  if (isLoading) return <ScaleLoader loading />;
  if (!series || !Array.isArray(series) || series.length === 0) {
    return (
      <Typography color="text.secondary">
        No macro data. Run: make fetch-fred
      </Typography>
    );
  }

  // Group by category
  const grouped = {};
  series.forEach((s) => {
    const cat = s.category || "misc";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  return (
    <Page title="Macro Indicators">
      <Container maxWidth={false}>
        {Object.entries(CATEGORIES).map(([cat, title]) => {
          const items = grouped[cat];
          if (!items || items.length === 0) return null;
          return (
            <Box key={cat} mb={3}>
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
              <Grid container spacing={1} alignItems="stretch">
                {items.map((s) => (
                  <Grid key={s.id} item lg={4} md={6} sm={12} xs={12}>
                    <MacroCard series={s} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}
      </Container>
    </Page>
  );
};

const MacroCard = ({ series }) => {
  const { data } = useResource(
    ["macro-card", series.series_id],
    `/macro-data/?series_id=${series.series_id}&ordering=date`,
  );

  const points = Array.isArray(data) ? data : data?.results || [];
  const recent = points.slice(-90); // Last 90 points
  const latest = recent.length > 0 ? recent[recent.length - 1] : null;
  const prev = recent.length > 7 ? recent[recent.length - 8] : null;
  const delta = latest && prev ? latest.value - prev.value : null;

    // Compute Y-axis range from actual data with padding
    const chartValues = recent.map((p) => p.value);
    const dataMin = chartValues.length > 0 ? Math.min(...chartValues) : 0;
    const dataMax = chartValues.length > 0 ? Math.max(...chartValues) : 1;
    const dataRange = dataMax - dataMin || 1;
    const step = Math.pow(10, Math.floor(Math.log10(dataRange)));
    const yMin = Math.floor((dataMin - dataRange * 0.05) / step) * step;
    const yMax = Math.ceil((dataMax + dataRange * 0.05) / step) * step;

    let option =
    recent.length > 1
      ? {
          chart: {
            type: "area",
            backgroundColor: "transparent",
            height: 80,
            margin: [5, 10, 20, 50],
            spacing: [0, 0, 0, 0],
          },
          title: { text: undefined },
          xAxis: {
            categories: recent.map((p) => p.date),
            visible: false,
          },
          yAxis: {
            title: { text: null },
            min: yMin,
            max: yMax,
            labels: {
              style: { color: "#94a3b8", fontSize: "9px" },
              formatter: function () {
                const v = this.value;
                if (Math.abs(v) >= 1000000) return (v / 1000000).toFixed(1) + "M";
                if (Math.abs(v) >= 1000) return (v / 1000).toFixed(0) + "k";
                if (Math.abs(v) < 10) return v.toFixed(1);
                return v.toFixed(0);
              },
            },
            gridLineColor: "#334155",
          },
          tooltip: {
            style: { color: "#94a3b8" },
            backgroundColor: "#1e293b",
            borderColor: "#334155",
            headerFormat: "{point.x}<br/>",
            pointFormat: "<b>{point.y:,.2f}</b>",
          },
          legend: { enabled: false },
          plotOptions: {
            area: {
              marker: { enabled: false },
              lineWidth: 2,
              fillOpacity: 0.1,
            },
          },
          series: [
            {
              name: series.title,
              data: recent.map((p) => p.value),
            },
          ],
          credits: { enabled: false },
        }
      : null;

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent
        sx={{
          py: 1,
          "&:last-child": { pb: 1 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" fontWeight="bold">
            {series.title}
          </Typography>
          {latest && (
            <Box textAlign="right">
              <Typography variant="body1" fontWeight={600}>
                {latest.value.toFixed(2)}
                {series.units ? ` ${series.units}` : ""}
              </Typography>
              {delta != null && (
                <Typography
                  variant="caption"
                  color={
                    delta > 0
                      ? "success.main"
                      : delta < 0
                      ? "error.main"
                      : "text.secondary"
                  }
                >
                  {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}{" "}
                  {Math.abs(delta).toFixed(2)} vs 7d ago
                </Typography>
              )}
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minHeight: 80 }}>
          {option && (
            <HighchartsReact highcharts={Highcharts} options={option} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MacroOverviewView;
