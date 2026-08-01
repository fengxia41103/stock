import React from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import ScaleLoader from "react-spinners/ScaleLoader";

import { useResource } from "@/api";
import { useChartTheme } from "@/hooks/useChartTheme";
import { Page } from "@/components/shared";

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

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
  const theme = useChartTheme();

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
              <Grid container spacing={1}>
                {items.map((s) => (
                  <Grid key={s.id} item lg={4} md={6} sm={12} xs={12}>
                    <MacroCard series={s} theme={theme} />
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

const MacroCard = ({ series, theme }) => {
  const { data } = useResource(
    ["macro-card", series.series_id],
    `/macro-data/?series_id=${series.series_id}&ordering=date`,
  );

  const points = Array.isArray(data) ? data : data?.results || [];
  const recent = points.slice(-90); // Last 90 points
  const latest = recent.length > 0 ? recent[recent.length - 1] : null;
  const prev = recent.length > 7 ? recent[recent.length - 8] : null;
  const delta = latest && prev ? latest.value - prev.value : null;

  const option =
    recent.length > 1
      ? {
          grid: { top: 5, bottom: 20, left: 40, right: 10 },
          xAxis: {
            type: "category",
            data: recent.map((p) => p.date),
            show: false,
          },
          yAxis: { type: "value", scale: true, axisLabel: { fontSize: 10 } },
          series: [
            {
              type: "line",
              data: recent.map((p) => p.value),
              showSymbol: false,
              lineStyle: { width: 2 },
              areaStyle: { opacity: 0.1 },
            },
          ],
          tooltip: { trigger: "axis" },
        }
      : null;

  return (
    <Card>
      <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
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
        {option && (
          <ReactEChartsCore
            echarts={echarts}
            option={option}
            theme={theme}
            style={{ height: 80 }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MacroOverviewView;
