import { useEffect } from "react";
import Highcharts from "highcharts";
import { useTheme } from "@mui/material";

/**
 * Applies a global Highcharts theme derived from the active MUI theme so every
 * chart gets readable, mode-aware colors (axis labels, titles, legend, grid
 * lines, tooltip) without per-chart overrides. Re-applies whenever the MUI
 * color mode changes.
 *
 * Mount once, below the ColorModeProvider. Individual charts may still override
 * specifics, but no longer need to hardcode label colors for dark mode.
 */
export default function useHighchartsTheme() {
  const theme = useTheme();

  useEffect(() => {
    const text = theme.palette.text.primary; // readable in both modes
    const muted = theme.palette.text.secondary;
    const line = theme.palette.divider;
    const paper = theme.palette.background.paper;

    Highcharts.setOptions({
      colors: [
        theme.palette.primary.main,
        "#f59e0b",
        theme.palette.success.main,
        "#ec4899",
        "#a855f7",
        "#06b6d4",
        theme.palette.error.main,
        "#84cc16",
      ],
      chart: {
        backgroundColor: "transparent",
        style: { fontFamily: theme.typography.fontFamily },
      },
      title: { style: { color: text } },
      subtitle: { style: { color: muted } },
      xAxis: {
        labels: { style: { color: muted } },
        title: { style: { color: muted } },
        lineColor: line,
        tickColor: line,
        gridLineColor: line,
      },
      yAxis: {
        labels: { style: { color: muted } },
        title: { style: { color: muted } },
        lineColor: line,
        tickColor: line,
        gridLineColor: line,
      },
      legend: {
        itemStyle: { color: text },
        itemHoverStyle: { color: theme.palette.primary.main },
        itemHiddenStyle: { color: muted },
      },
      tooltip: {
        backgroundColor: paper,
        borderColor: line,
        style: { color: text },
      },
      plotOptions: {
        series: {
          dataLabels: { color: text, style: { textOutline: "none" } },
        },
      },
      credits: { enabled: false },
    });

    // Reflow existing charts so the new theme takes effect immediately.
    Highcharts.charts.forEach((c) => c && c.update({}, false) && c.reflow());
  }, [theme]);
}
