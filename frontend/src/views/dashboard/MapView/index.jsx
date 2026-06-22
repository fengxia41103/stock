import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container } from "@mui/material";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { TreemapChart } from "echarts/charts";
import { TooltipComponent, VisualMapComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import ScaleLoader from "react-spinners/ScaleLoader";

import { useStocksOverview } from "@/api";
import { useChartTheme } from "@/hooks/useChartTheme";
import { Page } from "@fengxia41103/storybook";

echarts.use([
  TreemapChart,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

const MapView = () => {
  const { data, isLoading } = useStocksOverview();
  const theme = useChartTheme();
  const navigate = useNavigate();

  if (isLoading) return <ScaleLoader loading />;
  if (!data || !Array.isArray(data)) return null;

  // Group by sector
  const sectors = {};
  data.forEach((s) => {
    const sec = s.sector || "Other";
    if (!sectors[sec]) sectors[sec] = [];
    sectors[sec].push(s);
  });

  const treeData = Object.entries(sectors).map(([name, stocks]) => ({
    name,
    children: stocks.map((s) => ({
      name: s.symbol,
      value: s.market_cap || 1,
      daily_return_pct: s.daily_return_pct,
      price: s.price,
      id: s.id,
    })),
  }));

  const option = {
    tooltip: {
      formatter: (p) => {
        const d = p.data;
        if (!d.price) return p.name;
        const ret =
          d.daily_return_pct != null
            ? `${d.daily_return_pct > 0 ? "+" : ""}${d.daily_return_pct.toFixed(
                2,
              )}%`
            : "N/A";
        return `<b>${d.name}</b><br/>$${d.price.toFixed(2)}<br/>Return: ${ret}`;
      },
    },
    series: [
      {
        type: "treemap",
        data: treeData,
        roam: false,
        nodeClick: false,
        breadcrumb: { show: true },
        leafDepth: 2,
        levels: [
          {
            itemStyle: { borderColor: "#333", borderWidth: 3, gapWidth: 3 },
            upperLabel: { show: true, height: 24, fontSize: 13, fontWeight: "bold" },
          },
          {
            itemStyle: { borderColor: "#999", borderWidth: 1, gapWidth: 1 },
            colorMappingBy: "value",
          },
        ],
        label: {
          show: true,
          formatter: (p) => {
            const d = p.data;
            if (d.children) return d.name;
            const ret =
              d.daily_return_pct != null
                ? `${d.daily_return_pct > 0 ? "+" : ""}${d.daily_return_pct.toFixed(1)}%`
                : "";
            return `${d.name}\n${ret}`;
          },
          fontSize: 12,
          fontWeight: "bold",
        },
        visualMin: -3,
        visualMax: 3,
        visualDimension: "daily_return_pct",
        colorMappingBy: "value",
        leafDepth: 1,
      },
    ],
    visualMap: {
      type: "continuous",
      min: -3,
      max: 3,
      inRange: {
        color: ["#c62828", "#ef9a9a", "#e0e0e0", "#a5d6a7", "#2e7d32"],
      },
      text: ["+3%", "-3%"],
      orient: "horizontal",
      left: "center",
      bottom: 10,
    },
  };

  const onEvents = {
    click: (params) => {
      if (params.data?.id)
        navigate(`/stocks/${params.data.id}/historical/price`);
    },
  };

  return (
    <Page title="Market Map">
      <Container maxWidth={false}>
        <Box sx={{ height: "calc(100vh - 150px)", minHeight: 500 }}>
          <ReactEChartsCore
            echarts={echarts}
            option={option}
            theme={theme}
            style={{ height: "100%" }}
            onEvents={onEvents}
          />
        </Box>
      </Container>
    </Page>
  );
};

export default MapView;
