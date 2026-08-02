import React from "react";
import { useNavigate } from "react-router-dom";
import ScaleLoader from "react-spinners/ScaleLoader";

import WarningIcon from "@mui/icons-material/Warning";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import {
  Box,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { useResource } from "@/api";

const GREEN = "#10b981";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";

const Section = ({ icon, title, color, children, empty }) => (
  <Paper sx={{ p: 2, borderRadius: 2, borderLeft: `4px solid ${color}`, height: "100%" }}>
    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
      {icon}
      <Typography variant="subtitle2" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>
        {title}
      </Typography>
    </Stack>
    {children || <Typography variant="body2" color="text.secondary">{empty || "None"}</Typography>}
  </Paper>
);

const BriefView = () => {
  const { data, isLoading } = useResource("morning-brief", "/stocks/brief/");
  const navigate = useNavigate();

  if (isLoading) return <ScaleLoader loading />;
  if (!data) return null;

  const { oversold, overbought, alerts, earnings_this_week, top_gainers, top_losers, portfolio, recent_insider_trades } = data;

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Morning Brief</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {data.date} — What needs your attention today.
      </Typography>

      <Grid container spacing={2}>
        {/* Portfolio Summary */}
        {portfolio && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: portfolio.total_pnl >= 0 ? "#064e3b" : "#7f1d1d" }}>
              <Stack direction="row" spacing={4} alignItems="center">
                <AccountBalanceWalletIcon sx={{ color: "#fff" }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "#d1d5db" }}>Portfolio Value</Typography>
                  <Typography variant="h5" fontWeight={700} color="#fff">
                    ${portfolio.total_value?.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#d1d5db" }}>P&L</Typography>
                  <Typography variant="h5" fontWeight={700} color="#fff">
                    {portfolio.total_pnl >= 0 ? "+" : ""}${portfolio.total_pnl?.toLocaleString()} ({portfolio.total_pnl_pct}%)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#d1d5db" }}>Positions</Typography>
                  <Typography variant="h5" fontWeight={700} color="#fff">{portfolio.positions}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* Oversold */}
        <Grid item xs={12} sm={6} md={4}>
          <Section icon={<WarningIcon sx={{ color: RED }} />} title="Oversold (RSI <30)" color={RED} empty="No oversold stocks">
            {oversold?.length > 0 && (
              <List dense disablePadding>
                {oversold.map((s) => (
                  <ListItem key={s.stock__symbol} disablePadding sx={{ cursor: "pointer", py: 0.3 }}
                    onClick={() => navigate(`/stocks/${s.stock__id}/historical/price`)}>
                    <ListItemText
                      primary={<strong>{s.stock__symbol}</strong>}
                      secondary={`RSI ${s.rsi?.toFixed(1)} · ${s.last_lower || 0}d drop · $${s.price?.toFixed(2)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Section>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12} sm={6} md={4}>
          <Section icon={<NotificationsActiveIcon sx={{ color: AMBER }} />} title="Triggered Alerts" color={AMBER} empty="No unread alerts">
            {alerts?.length > 0 && (
              <List dense disablePadding>
                {alerts.map((a) => (
                  <ListItem key={a.id} disablePadding sx={{ py: 0.3 }}>
                    <ListItemText
                      primary={a.message}
                      primaryTypographyProps={{ fontSize: "0.8rem" }}
                      secondary={new Date(a.triggered_at).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Section>
        </Grid>

        {/* Earnings This Week */}
        <Grid item xs={12} sm={6} md={4}>
          <Section icon={<EventIcon sx={{ color: BLUE }} />} title="Earnings This Week" color={BLUE} empty="No upcoming earnings">
            {earnings_this_week?.length > 0 && (
              <List dense disablePadding>
                {earnings_this_week.map((e, i) => (
                  <ListItem key={i} disablePadding sx={{ py: 0.3 }}>
                    <ListItemText
                      primary={<strong>{e.stock__symbol}</strong>}
                      secondary={`${e.report_date} · est EPS $${e.estimated_eps || "—"}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Section>
        </Grid>

        {/* Top Gainers */}
        <Grid item xs={12} sm={6} md={3}>
          <Section icon={<TrendingUpIcon sx={{ color: GREEN }} />} title="Top Gainers" color={GREEN}>
            {top_gainers?.length > 0 && (
              <List dense disablePadding>
                {top_gainers.map((s) => (
                  <ListItem key={s.stock__symbol} disablePadding sx={{ py: 0.3 }}>
                    <ListItemText
                      primary={s.stock__symbol}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Typography variant="body2" sx={{ color: GREEN, fontWeight: 700 }}>
                      +{s.daily_return_pct?.toFixed(1)}%
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </Section>
        </Grid>

        {/* Top Losers */}
        <Grid item xs={12} sm={6} md={3}>
          <Section icon={<TrendingDownIcon sx={{ color: RED }} />} title="Top Losers" color={RED}>
            {top_losers?.length > 0 && (
              <List dense disablePadding>
                {top_losers.map((s) => (
                  <ListItem key={s.stock__symbol} disablePadding sx={{ py: 0.3 }}>
                    <ListItemText
                      primary={s.stock__symbol}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Typography variant="body2" sx={{ color: RED, fontWeight: 700 }}>
                      {s.daily_return_pct?.toFixed(1)}%
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </Section>
        </Grid>

        {/* Overbought */}
        <Grid item xs={12} sm={6} md={3}>
          <Section icon={<WarningIcon sx={{ color: AMBER }} />} title="Overbought (RSI >70)" color={AMBER} empty="None">
            {overbought?.length > 0 && (
              <List dense disablePadding>
                {overbought.map((s) => (
                  <ListItem key={s.stock__symbol} disablePadding sx={{ py: 0.3 }}>
                    <ListItemText
                      primary={<strong>{s.stock__symbol}</strong>}
                      secondary={`RSI ${s.rsi?.toFixed(1)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Section>
        </Grid>

        {/* Insider Trades */}
        <Grid item xs={12} sm={6} md={3}>
          <Section icon={<PersonIcon sx={{ color: "#8b5cf6" }} />} title="Recent Insider Trades" color="#8b5cf6" empty="None in last 3 days">
            {recent_insider_trades?.length > 0 && (
              <List dense disablePadding>
                {recent_insider_trades.map((t, i) => (
                  <ListItem key={i} disablePadding sx={{ py: 0.3 }}>
                    <ListItemText
                      primary={`${t.stock__symbol} ${t.transaction_type === "P" ? "BUY" : "SELL"}`}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: "0.8rem" }}
                      secondary={`${t.insider_name?.split(" ")[0]} · ${t.shares} shares`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Section>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BriefView;
