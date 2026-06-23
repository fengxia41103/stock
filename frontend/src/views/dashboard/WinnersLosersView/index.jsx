import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import ScaleLoader from "react-spinners/ScaleLoader";

import { useStocksOverview } from "@/api";

const WinnersLosersView = () => {
  const { data, isLoading } = useStocksOverview();
  const navigate = useNavigate();

  if (isLoading) return <ScaleLoader loading />;
  if (!data || !Array.isArray(data)) return null;

  // Sort by different criteria
  const byReturn = [...data]
    .filter((s) => s.daily_return_pct != null)
    .sort((a, b) => b.daily_return_pct - a.daily_return_pct);
  const byInsider = [...data]
    .filter((s) => s.insider_sentiment != null)
    .sort((a, b) => b.insider_sentiment - a.insider_sentiment);
  const byRoe = [...data]
    .filter((s) => s.roe != null && s.roe > 0)
    .sort((a, b) => b.roe - a.roe);
  const byDropScale = [...data]
    .filter((s) => s.last_lower != null && s.last_lower > 0)
    .sort((a, b) => b.last_lower - a.last_lower);

  const winners = byReturn.slice(0, 5);
  const losers = byReturn.slice(-5).reverse();
  const topInsider = byInsider.slice(0, 5);
  const worstInsider = byInsider.slice(-5).reverse();
  const topRoe = byRoe.slice(0, 10);
  const biggestDrops = byDropScale.slice(0, 5);

  const RankList = ({ items, valueKey, suffix = "", colorize = true }) => (
    <List dense>
      {items.map((s) => {
        const val = typeof valueKey === "function" ? valueKey(s) : s[valueKey];
        const color = !colorize
          ? undefined
          : val > 0
          ? "success.main"
          : val < 0
          ? "error.main"
          : undefined;
        return (
          <ListItem
            key={s.id}
            button
            onClick={() => navigate(`/stocks/${s.id}/historical/price`)}
            divider
          >
            <ListItemText
              primary={<Typography fontWeight="bold">{s.symbol}</Typography>}
            />
            <Typography color={color} fontWeight={600}>
              {val != null
                ? `${val > 0 ? "+" : ""}${
                    typeof val === "number" ? val.toFixed(1) : val
                  }${suffix}`
                : "—"}
            </Typography>
          </ListItem>
        );
      })}
    </List>
  );

  return (
    <Grid container spacing={2}>
      {/* Today's Winners */}
      <Grid item lg={3} md={4} sm={6} xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant="h6">🟢 Today's Winners</Typography>}
            subheader="Highest daily return"
          />
          <CardContent sx={{ pt: 0 }}>
            <RankList items={winners} valueKey="daily_return_pct" suffix="%" />
          </CardContent>
        </Card>
      </Grid>

      {/* Today's Losers */}
      <Grid item lg={3} md={4} sm={6} xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant="h6">🔴 Today's Losers</Typography>}
            subheader="Worst daily return"
          />
          <CardContent sx={{ pt: 0 }}>
            <RankList items={losers} valueKey="daily_return_pct" suffix="%" />
          </CardContent>
        </Card>
      </Grid>

      {/* Insider Buying */}
      <Grid item lg={3} md={4} sm={6} xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant="h6">👔 Insider Bullish</Typography>}
            subheader="Highest insider buy sentiment"
          />
          <CardContent sx={{ pt: 0 }}>
            <RankList
              items={topInsider}
              valueKey={(s) => s.insider_sentiment * 100}
              suffix="%"
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Insider Selling */}
      <Grid item lg={3} md={4} sm={6} xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant="h6">🚪 Insider Bearish</Typography>}
            subheader="Heaviest insider selling"
          />
          <CardContent sx={{ pt: 0 }}>
            <RankList
              items={worstInsider}
              valueKey={(s) => s.insider_sentiment * 100}
              suffix="%"
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Biggest Drops (buying opportunities) */}
      <Grid item lg={3} md={4} sm={6} xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant="h6">📉 Biggest Drops</Typography>}
            subheader="Days since a lower price (oversold = opportunity)"
          />
          <CardContent sx={{ pt: 0 }}>
            <RankList
              items={biggestDrops}
              valueKey="last_lower"
              suffix=" days"
              colorize={false}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Top ROE */}
      <Grid item lg={3} md={4} sm={6} xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant="h6">💎 Top Quality (ROE)</Typography>}
            subheader="Highest return on equity"
          />
          <CardContent sx={{ pt: 0 }}>
            <RankList
              items={topRoe}
              valueKey="roe"
              suffix="%"
              colorize={false}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Summary */}
      <Grid item lg={6} md={8} sm={12} xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant="h6">📊 Quick Summary</Typography>}
          />
          <CardContent>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {data.filter((s) => s.daily_return_pct > 0).length}
                  </Typography>
                  <Typography variant="caption">Stocks Up</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="error.main">
                    {data.filter((s) => s.daily_return_pct < 0).length}
                  </Typography>
                  <Typography variant="caption">Stocks Down</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4">
                    {data.filter((s) => s.insider_sentiment > 0).length}
                  </Typography>
                  <Typography variant="caption">Insider Buying</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default WinnersLosersView;
