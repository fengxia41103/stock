import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container } from "@mui/material";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import treemapModule from "highcharts/modules/treemap";
import ScaleLoader from "react-spinners/ScaleLoader";

import { useStocksOverview } from "@/api";
import { Page } from "@/components/shared";

// Initialize treemap module
treemapModule(Highcharts);

const MapView = () => {
  const { data, isLoading } = useStocksOverview();
  const navigate = useNavigate();

  const chartOptions = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;

    // Group by sector
    const sectors = {};
    data.forEach((s) => {
      const sec = s.sector || "Other";
      if (!sectors[sec]) sectors[sec] = [];
      sectors[sec].push(s);
    });

    // Build treemap data: parent nodes (sectors) + leaf nodes (stocks)
    const treeData = [];
    Object.entries(sectors).forEach(([sectorName, stocks]) => {
      // Parent node
      treeData.push({
        id: sectorName,
        name: sectorName,
        color: "#2d3748",
      });
      // Leaf nodes
      stocks.forEach((s) => {
        const ret = s.daily_return_pct || 0;
        const clamped = Math.max(-5, Math.min(5, ret));
        // Color: red (-5%) → gray (0) → green (+5%)
        let color;
        if (clamped < -2) color = "#c62828";
        else if (clamped < -0.5) color = "#ef5350";
        else if (clamped < 0.5) color = "#616161";
        else if (clamped < 2) color = "#66bb6a";
        else color = "#2e7d32";

        treeData.push({
          name: s.symbol,
          parent: sectorName,
          value: s.market_cap || 1,
          color,
          // Custom data for tooltip and click
          stockId: s.id,
          price: s.price,
          daily_return_pct: s.daily_return_pct,
        });
      });
    });

    return {
      chart: {
        backgroundColor: "#0f172a",
        height: null, // will use container height
      },
      title: { text: null },
      series: [
        {
          type: "treemap",
          layoutAlgorithm: "squarified",
          allowDrillToNode: false,
          animationLimit: 1000,
          data: treeData,
          levels: [
            {
              level: 1,
              borderWidth: 3,
              borderColor: "#1e293b",
              dataLabels: {
                enabled: true,
                align: "left",
                verticalAlign: "top",
                style: {
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "#94a3b8",
                  textOutline: "none",
                },
              },
            },
            {
              level: 2,
              borderWidth: 1,
              borderColor: "#334155",
              dataLabels: {
                enabled: true,
                formatter: function () {
                  const ret = this.point.daily_return_pct;
                  const retStr =
                    ret != null
                      ? `${ret > 0 ? "+" : ""}${ret.toFixed(1)}%`
                      : "";
                  return `<span style="font-size:12px;font-weight:bold">${this.point.name}</span><br/><span style="font-size:10px">${retStr}</span>`;
                },
                useHTML: true,
                style: {
                  color: "#f8fafc",
                  textOutline: "none",
                },
              },
            },
          ],
          cursor: "pointer",
          point: {
            events: {
              click: function () {
                if (this.stockId) {
                  navigate(`/stocks/${this.stockId}/historical/price`);
                }
              },
            },
          },
        },
      ],
      tooltip: {
        useHTML: true,
        backgroundColor: "#1e293b",
        borderColor: "#475569",
        style: { color: "#f8fafc" },
        formatter: function () {
          const p = this.point;
          if (!p.price) return `<b>${p.name}</b>`;
          const ret =
            p.daily_return_pct != null
              ? `${p.daily_return_pct > 0 ? "+" : ""}${p.daily_return_pct.toFixed(2)}%`
              : "N/A";
          return `<b>${p.name}</b><br/>$${p.price.toFixed(2)}<br/>Return: ${ret}`;
        },
      },
      credits: { enabled: false },
    };
  }, [data, navigate]);

  if (isLoading) return <ScaleLoader loading />;
  if (!chartOptions) return null;

  return (
    <Page title="Market Map">
      <Container maxWidth={false}>
        <Box sx={{ height: "calc(100vh - 150px)", minHeight: 500 }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            containerProps={{ style: { height: "100%" } }}
          />
        </Box>
      </Container>
    </Page>
  );
};

export default MapView;
