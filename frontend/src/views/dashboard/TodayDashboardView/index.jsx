import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import treemapModule from "highcharts/modules/treemap";
import ScaleLoader from "react-spinners/ScaleLoader";

import { useResource, useStocksOverview } from "@/api";
import { Page } from "@/components/shared";
import ShowResource from "@Components/common/ShowResource";

// Initialize Highcharts treemap module
treemapModule(Highcharts);

const BG = "background.default";
const TILE = "background.paper";
const TEXT = "text.primary";
const TEXT2 = "text.secondary";
const GREEN = "#10b981";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";

// Mini sparkline SVG
const Spark = ({ data, color = TEXT2 }) => {
  if (!data || data.length < 2) return null;
  const nums = data.filter((v) => v != null);
  if (nums.length < 2) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const pts = nums
    .map(
      (v, i) => `${(i / (nums.length - 1)) * w},${h - ((v - min) / range) * h}`,
    )
    .join(" ");
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
};

// Single KPI Tile
const Tile = ({
  label,
  value,
  delta,
  deltaColor,
  sparkData,
  sparkColor,
  onClick,
  sx = {},
}) => (
  <Paper
    onClick={onClick}
    sx={{
      bgcolor: TILE,
      p: 2.5,
      borderRadius: 2,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.15s",
      "&:hover": onClick ? { transform: "scale(1.02)" } : {},
      ...sx,
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color: "text.secondary",
        textTransform: "uppercase",
        letterSpacing: 1,
        fontSize: "0.65rem",
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="h4"
      sx={{ color: "text.primary", fontWeight: 700, my: 0.5 }}
    >
      {value}
    </Typography>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      {sparkData && <Spark data={sparkData} color={sparkColor || TEXT2} />}
      {delta && (
        <Chip
          label={delta}
          size="small"
          sx={{
            bgcolor: deltaColor || TEXT2,
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.7rem",
            height: 20,
          }}
        />
      )}
    </Stack>
  </Paper>
);

// Treemap heatmap component
const TreemapChart = ({ stocks, navigate }) => {
  const chartOptions = useMemo(() => {
    if (!stocks || !Array.isArray(stocks)) return null;

    const sectors = {};
    stocks.forEach((s) => {
      const sec = s.sector || "Other";
      if (!sectors[sec]) sectors[sec] = [];
      sectors[sec].push(s);
    });

    const treeData = [];
    Object.entries(sectors).forEach(([sectorName, sectorStocks]) => {
      treeData.push({
        id: sectorName,
        name: sectorName,
        color: "#2d3748",
      });
      sectorStocks.forEach((s) => {
        const ret = s.daily_return_pct || 0;
        const clamped = Math.max(-5, Math.min(5, ret));
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
          stockId: s.id,
          price: s.price,
          daily_return_pct: s.daily_return_pct,
        });
      });
    });

    return {
      chart: { backgroundColor: "transparent", height: 320, reflow: false },
      title: { text: null },
      series: [
        {
          type: "treemap",
          layoutAlgorithm: "squarified",
          allowDrillToNode: false,
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
                style: { fontSize: "11px", fontWeight: "bold", color: "#94a3b8", textOutline: "none" },
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
                  const retStr = ret != null ? `${ret > 0 ? "+" : ""}${ret.toFixed(1)}%` : "";
                  return `<span style="font-size:11px;font-weight:bold">${this.point.name}</span><br/><span style="font-size:9px">${retStr}</span>`;
                },
                useHTML: true,
                style: { color: "#f8fafc", textOutline: "none" },
              },
            },
          ],
          cursor: "pointer",
          point: {
            events: {
              click: function () {
                if (this.stockId) navigate(`/stocks/${this.stockId}/historical/price`);
              },
            },
          },
        },
      ],
      tooltip: {
        useHTML: true,
        outside: false,
        backgroundColor: "#1e293b",
        borderColor: "#475569",
        style: { color: "#f8fafc" },
        formatter: function () {
          const p = this.point;
          if (!p.price) return `<b>${p.name}</b>`;
          const ret = p.daily_return_pct != null ? `${p.daily_return_pct > 0 ? "+" : ""}${p.daily_return_pct.toFixed(2)}%` : "N/A";
          return `<b>${p.name}</b><br/>$${p.price.toFixed(2)}<br/>Return: ${ret}`;
        },
      },
      credits: { enabled: false },
    };
  }, [stocks, navigate]);

  if (!chartOptions) return null;
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
      containerProps={{ style: { height: "320px", overflow: "hidden" } }}
    />
  );
};

const TodayDashboardView = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const { data: stocks, isLoading } = useStocksOverview(
    selectedDate || undefined,
  );
  const { data: macroSeries } = useResource("macro-series", "/macro-series/");
  const { data: earnings } = useResource(
    "earnings-upcoming",
    "/earnings/upcoming/",
  );
  const { data: treasury } = useResource(
    ["macro-latest", "DGS10"],
    "/macro-data/?series_id=DGS10&ordering=-date",
  );
  const navigate = useNavigate();

  if (isLoading) return <ScaleLoader loading />;
  if (!stocks || !Array.isArray(stocks)) return null;

  const withReturn = stocks.filter((s) => s.daily_return_pct != null);
  const up = withReturn.filter((s) => s.daily_return_pct > 0);
  const down = withReturn.filter((s) => s.daily_return_pct < 0);
  const sorted = [...withReturn].sort(
    (a, b) => b.daily_return_pct - a.daily_return_pct,
  );
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const oversold = stocks
    .filter((s) => s.last_lower > 5)
    .sort((a, b) => b.last_lower - a.last_lower);
  const insiderBuy = stocks
    .filter((s) => s.insider_sentiment > 0)
    .sort((a, b) => b.insider_sentiment - a.insider_sentiment);
  const topRoe = [...stocks]
    .filter((s) => s.roe > 0)
    .sort((a, b) => b.roe - a.roe);
  const avgReturn =
    withReturn.length > 0
      ? withReturn.reduce((s, x) => s + x.daily_return_pct, 0) /
        withReturn.length
      : 0;

  // Treasury data
  const treasuryPts = Array.isArray(treasury)
    ? treasury
    : treasury?.results || [];
  const latestTreasury = treasuryPts.length > 0 ? treasuryPts[0] : null;
  const treasurySparkline = treasuryPts
    .slice(0, 30)
    .reverse()
    .map((p) => p.value);

  // Earnings
  const earningsList = Array.isArray(earnings) ? earnings : [];
  const nextEarning = earningsList[0];
  const daysToEarn = nextEarning
    ? Math.ceil((new Date(nextEarning.report_date) - new Date()) / 86400000)
    : null;

  return (
    <Page title="Dashboard">
      <Box
        sx={{
          bgcolor: BG,
          mx: -3,
          mt: -2,
          mb: -3,
          p: 3,
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Box mb={2}>
          <TextField
            type="date"
            size="small"
            label="Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ bgcolor: TILE, borderRadius: 1, width: 200 }}
          />
        </Box>
        <Grid container spacing={2}>
          {/* Row 1 */}
          <Grid item xs={6} sm={3}>
            <Tile
              label="Stocks Up"
              value={up.length}
              delta={`${((up.length / withReturn.length) * 100).toFixed(0)}%`}
              deltaColor={GREEN}
              sx={{ borderLeft: `4px solid ${GREEN}` }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Tile
              label="Stocks Down"
              value={down.length}
              delta={`${((down.length / withReturn.length) * 100).toFixed(0)}%`}
              deltaColor={RED}
              sx={{ borderLeft: `4px solid ${RED}` }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Tile
              label="10Y Treasury"
              value={
                latestTreasury ? `${latestTreasury.value.toFixed(2)}%` : "—"
              }
              sparkData={treasurySparkline}
              sparkColor={BLUE}
              delta={latestTreasury ? latestTreasury.date : ""}
              deltaColor="grey"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Tile
              label="Avg Daily Return"
              value={`${avgReturn > 0 ? "+" : ""}${avgReturn.toFixed(2)}%`}
              deltaColor={avgReturn > 0 ? GREEN : RED}
              delta={`${withReturn.length} stocks`}
              sx={{ borderLeft: `4px solid ${avgReturn > 0 ? GREEN : RED}` }}
            />
          </Grid>

          {/* Row 2: Treemap heatmap */}
          <Grid item xs={12}>
            <Paper sx={{ bgcolor: TILE, p: 1, borderRadius: 2 }}>
              <TreemapChart stocks={stocks} navigate={navigate} />
            </Paper>
          </Grid>

          {/* Row 3 */}
          <Grid item xs={6} sm={3}>
            <Tile
              label="Best Today"
              value={best ? `${best.symbol}` : "—"}
              delta={best ? `+${best.daily_return_pct.toFixed(1)}%` : ""}
              deltaColor={GREEN}
              onClick={
                best
                  ? () => navigate(`/stocks/${best.id}/historical/price`)
                  : undefined
              }
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Tile
              label="Worst Today"
              value={worst ? `${worst.symbol}` : "—"}
              delta={worst ? `${worst.daily_return_pct.toFixed(1)}%` : ""}
              deltaColor={RED}
              onClick={
                worst
                  ? () => navigate(`/stocks/${worst.id}/historical/price`)
                  : undefined
              }
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Tile
              label="Most Oversold"
              value={oversold[0] ? `${oversold[0].symbol}` : "None"}
              delta={oversold[0] ? `${oversold[0].last_lower}d drop` : ""}
              deltaColor={AMBER}
              onClick={
                oversold[0]
                  ? () => navigate(`/stocks/${oversold[0].id}/historical/price`)
                  : undefined
              }
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Tile
              label="Insider Buying"
              value={insiderBuy.length > 0 ? insiderBuy[0].symbol : "None"}
              delta={
                insiderBuy.length > 0
                  ? `${(insiderBuy[0].insider_sentiment * 100).toFixed(
                      0,
                    )}% bullish`
                  : ""
              }
              deltaColor={BLUE}
              onClick={
                insiderBuy[0]
                  ? () => navigate(`/stocks/${insiderBuy[0].id}/insider-trades`)
                  : undefined
              }
            />
          </Grid>

          {/* Row 3 */}
          <Grid item xs={6} sm={3}>
            <Tile
              label="Next Earnings"
              value={nextEarning ? nextEarning.symbol : "None"}
              delta={daysToEarn != null ? `in ${daysToEarn} days` : ""}
              deltaColor={daysToEarn && daysToEarn <= 7 ? AMBER : "grey"}
              onClick={
                nextEarning
                  ? () => navigate(`/stocks/${nextEarning.stock}/earnings`)
                  : undefined
              }
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Tile
              label="Market Breadth"
              value={`${((up.length / withReturn.length) * 100).toFixed(0)}%`}
              delta={up.length > down.length ? "Bullish" : "Bearish"}
              deltaColor={up.length > down.length ? GREEN : RED}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Tile
              label="Top ROE"
              value={topRoe[0] ? `${topRoe[0].symbol}` : "—"}
              delta={topRoe[0] ? `${topRoe[0].roe.toFixed(0)}%` : ""}
              deltaColor="#8b5cf6"
              onClick={
                topRoe[0]
                  ? () => navigate(`/stocks/${topRoe[0].id}/dupont`)
                  : undefined
              }
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Tile
              label="Upcoming Earnings"
              value={earningsList.length}
              delta="next 30 days"
              deltaColor="grey"
            />
          </Grid>

          {/* Row 4: Movers list */}
          <Grid item xs={12} sm={6}>
            <Paper sx={{ bgcolor: TILE, p: 2, borderRadius: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Top 5 Gainers
              </Typography>
              <Stack spacing={0.5} mt={1}>
                {sorted.slice(0, 5).map((s) => (
                  <Stack
                    key={s.id}
                    direction="row"
                    justifyContent="space-between"
                    sx={{
                      cursor: "pointer",
                      p: 0.5,
                      borderRadius: 1,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    onClick={() => navigate(`/stocks/${s.id}/historical/price`)}
                  >
                    <Typography
                      sx={{
                        color: "text.primary",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      {s.symbol}
                    </Typography>
                    <Typography
                      sx={{
                        color: GREEN,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      +{s.daily_return_pct.toFixed(2)}%
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ bgcolor: TILE, p: 2, borderRadius: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Top 5 Losers
              </Typography>
              <Stack spacing={0.5} mt={1}>
                {sorted
                  .slice(-5)
                  .reverse()
                  .map((s) => (
                    <Stack
                      key={s.id}
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        cursor: "pointer",
                        p: 0.5,
                        borderRadius: 1,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                      onClick={() =>
                        navigate(`/stocks/${s.id}/historical/price`)
                      }
                    >
                      <Typography
                        sx={{
                          color: "text.primary",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {s.symbol}
                      </Typography>
                      <Typography
                        sx={{
                          color: RED,
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {s.daily_return_pct.toFixed(2)}%
                      </Typography>
                    </Stack>
                  ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Row 5: Drop/Rebound/Volume/Volatility */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ bgcolor: TILE, p: 2, borderRadius: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Biggest Drops (days)
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ color: "text.secondary", mb: 1 }}
              >
                days since a lower price
              </Typography>
              <Stack spacing={0.5}>
                {oversold.slice(0, 5).map((s) => (
                  <Stack
                    key={s.id}
                    direction="row"
                    justifyContent="space-between"
                    sx={{
                      cursor: "pointer",
                      p: 0.5,
                      borderRadius: 1,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    onClick={() => navigate(`/stocks/${s.id}/historical/price`)}
                  >
                    <Typography
                      sx={{
                        color: "text.primary",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      {s.symbol}
                    </Typography>
                    <Typography
                      sx={{
                        color: AMBER,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {s.last_lower}d
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ bgcolor: TILE, p: 2, borderRadius: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Drop Scale (days)
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ color: "text.secondary", mb: 1 }}
              >
                days of ground lost (higher = bigger drop)
              </Typography>
              <Stack spacing={0.5}>
                {[...stocks]
                  .filter((s) => s.last_lower != null && s.last_lower > 1)
                  .sort((a, b) => b.last_lower - a.last_lower)
                  .slice(0, 5)
                  .map((s) => (
                    <Stack
                      key={s.id}
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        cursor: "pointer",
                        p: 0.5,
                        borderRadius: 1,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                      onClick={() =>
                        navigate(`/stocks/${s.id}/historical/price`)
                      }
                    >
                      <Typography
                        sx={{
                          color: "text.primary",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {s.symbol}
                      </Typography>
                      <Typography
                        sx={{
                          color: RED,
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {s.last_lower}d
                      </Typography>
                    </Stack>
                  ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ bgcolor: TILE, p: 2, borderRadius: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Top Volume (% of outstanding)
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ color: "text.secondary", mb: 1 }}
              >
                highest relative trading activity
              </Typography>
              <Stack spacing={0.5}>
                {[...stocks]
                  .filter((s) => s.vol_pct_outstanding > 0)
                  .sort((a, b) => b.vol_pct_outstanding - a.vol_pct_outstanding)
                  .slice(0, 5)
                  .map((s) => (
                    <Stack
                      key={s.id}
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        cursor: "pointer",
                        p: 0.5,
                        borderRadius: 1,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                      onClick={() =>
                        navigate(`/stocks/${s.id}/historical/price`)
                      }
                    >
                      <Typography
                        sx={{
                          color: "text.primary",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {s.symbol}
                      </Typography>
                      <Typography
                        sx={{
                          color: BLUE,
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {s.vol_pct_outstanding.toFixed(1)}%
                      </Typography>
                    </Stack>
                  ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ bgcolor: TILE, p: 2, borderRadius: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Insider Signals
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ color: "text.secondary", mb: 1 }}
              >
                net buy/sell sentiment (90 days)
              </Typography>
              <Stack spacing={0.5}>
                {[...stocks]
                  .filter((s) => s.insider_sentiment != null)
                  .sort((a, b) => b.insider_sentiment - a.insider_sentiment)
                  .slice(0, 5)
                  .map((s) => (
                    <Stack
                      key={s.id}
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        cursor: "pointer",
                        p: 0.5,
                        borderRadius: 1,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                      onClick={() => navigate(`/stocks/${s.id}/insider-trades`)}
                    >
                      <Typography
                        sx={{
                          color: "text.primary",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {s.symbol}
                      </Typography>
                      <Typography
                        sx={{
                          color: s.insider_sentiment > 0 ? GREEN : RED,
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {(s.insider_sentiment * 100).toFixed(0)}%
                      </Typography>
                    </Stack>
                  ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Page>
  );
};

export default TodayDashboardView;
