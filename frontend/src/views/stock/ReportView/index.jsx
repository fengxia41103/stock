import React, { useContext } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import {
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";

import { useResource } from "@/api";
import StockDetailContext from "@Views/stock/StockDetailView/context";

const fmt = (v, d = 2) => (v != null ? Number(v).toFixed(d) : "—");
const fmtB = (v) => (v != null ? `$${Number(v).toFixed(2)}B` : "—");
const fmtPct = (v) => (v != null ? `${Number(v).toFixed(1)}%` : "—");

const verdictColor = {
  BUY: "success",
  WATCH: "warning",
  AVOID: "error",
  PASS: "success",
  FAIL: "error",
  FAIR: "warning",
  BORDERLINE: "warning",
  OVERSOLD_BUY: "success",
  APPROACHING_BUY: "success",
  OVERBOUGHT_AVOID: "error",
  HIGH_CAUTION: "warning",
  NEUTRAL: "default",
  NO_DATA: "default",
};

const VerdictChip = ({ label, value }) => (
  <Box textAlign="center">
    <Chip
      label={value || "—"}
      color={verdictColor[value] || "default"}
      sx={{ fontWeight: "bold", fontSize: "0.85rem", minWidth: 100 }}
    />
    <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
      {label}
    </Typography>
  </Box>
);

const ScoreCard = ({ title, value, subtitle, color }) => (
  <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
    <Typography variant="h4" color={color || "primary"} fontWeight="bold">
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">{title}</Typography>
    {subtitle && <Typography variant="caption">{subtitle}</Typography>}
  </Paper>
);

const Section = ({ title, children }) => (
  <Box mt={3}>
    <Typography variant="h6" gutterBottom sx={{ borderBottom: 1, borderColor: "divider", pb: 0.5 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const ReportView = () => {
  const stock = useContext(StockDetailContext);
  const { data: r, isLoading } = useResource(
    ["report", String(stock.id)],
    `/stocks/${stock.id}/report/`,
  );

  if (isLoading) return <ScaleLoader loading />;
  if (!r) return <Typography>No data available</Typography>;

  const { basic, graham, darwin, dupont, financials, earnings, insiders, technicals, verdict } = r;

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        {r.name} ({r.symbol})
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Generated: {r.generated_at} • Price: ${fmt(basic?.price)}
      </Typography>

      {/* Verdict Banner */}
      <Paper sx={{ p: 2, mt: 2, bgcolor: verdict?.combined === "BUY" ? "success.dark" : verdict?.combined === "AVOID" ? "error.dark" : "warning.dark" }}>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid item>
            <Typography variant="h5" color="white" fontWeight="bold">
              {verdict?.combined === "BUY" && "✅ "}
              {verdict?.combined === "AVOID" && "🚫 "}
              {verdict?.combined === "WATCH" && "👀 "}
              VERDICT: {verdict?.combined}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={3} justifyContent="center" mt={1}>
          <Grid item><VerdictChip label="Darwin (Quality)" value={verdict?.darwin} /></Grid>
          <Grid item><VerdictChip label="Graham (Value)" value={verdict?.graham} /></Grid>
          <Grid item><VerdictChip label="Timing (RSI)" value={verdict?.timing} /></Grid>
        </Grid>
      </Paper>

      {/* Score Cards */}
      <Grid container spacing={2} mt={1}>
        <Grid item xs={6} md={2.4}>
          <ScoreCard title="ROCE" value={fmtPct(darwin?.roce_avg)} subtitle={darwin?.roce_all_above_15 ? "✓ All periods >15%" : "⚠️ Not consistent"} />
        </Grid>
        <Grid item xs={6} md={2.4}>
          <ScoreCard title="Graham Score" value={`${graham?.score || 0}/7`} />
        </Grid>
        <Grid item xs={6} md={2.4}>
          <ScoreCard title="RSI(14)" value={fmt(technicals?.rsi, 0)} color={technicals?.rsi < 30 ? "success.main" : technicals?.rsi > 70 ? "error.main" : undefined} />
        </Grid>
        <Grid item xs={6} md={2.4}>
          <ScoreCard title="PE" value={fmt(basic?.pe, 1)} />
        </Grid>
        <Grid item xs={6} md={2.4}>
          <ScoreCard title="ROE" value={fmtPct(basic?.roe)} />
        </Grid>
        <Grid item xs={6} md={2.4}>
          <ScoreCard title="OCF/NI" value={basic?.ocf_ni_ratio ? `${fmt(basic.ocf_ni_ratio)}x` : "—"} subtitle="Cash quality (>1.0 = good)" color={basic?.ocf_ni_ratio > 1 ? "success.main" : basic?.ocf_ni_ratio < 0.7 ? "error.main" : undefined} />
        </Grid>
        <Grid item xs={6} md={2.4}>
          <ScoreCard title="FCF/NI" value={basic?.fcf_ni_ratio ? `${fmt(basic.fcf_ni_ratio)}x` : "—"} subtitle="Cash conversion (>1.0 = strong)" color={basic?.fcf_ni_ratio > 1 ? "success.main" : basic?.fcf_ni_ratio < 0.5 ? "error.main" : undefined} />
        </Grid>
      </Grid>

      {/* DuPont */}
      {dupont && (
        <Section title="DuPont Decomposition">
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
            ROE {fmt(dupont.roe, 1)}% = Margin {fmt(dupont.net_margin, 1)}% × Turnover {fmt(dupont.asset_turnover, 1)}% × Leverage {fmt(dupont.equity_multiplier)}x
          </Typography>
          <Typography variant="caption" color="text.secondary">As of {dupont.date}</Typography>
        </Section>
      )}

      {/* Financials — Income */}
      {financials?.income?.length > 0 && (
        <Section title="Income Trend">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Net Income</TableCell>
                <TableCell align="right">EPS</TableCell>
                <TableCell align="right">Margin</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {financials.income.map((row) => (
                <TableRow key={row.date}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell align="right">{fmtB(row.revenue)}</TableCell>
                  <TableCell align="right">{fmtB(row.net_income)}</TableCell>
                  <TableCell align="right">${fmt(row.eps)}</TableCell>
                  <TableCell align="right" sx={{ color: row.margin > 20 ? "success.main" : undefined }}>
                    {fmtPct(row.margin)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      )}

      {/* Balance Sheet */}
      {financials?.balance && (
        <Section title="Balance Sheet">
          <Grid container spacing={2}>
            {[
              ["Total Assets", fmtB(financials.balance.total_assets)],
              ["Current Assets", fmtB(financials.balance.current_assets)],
              ["Total Debt", fmtB(financials.balance.total_debt)],
              ["Equity", fmtB(financials.balance.equity)],
              ["Working Capital", fmtB(financials.balance.working_capital)],
              ["Cash", fmtB(financials.balance.cash)],
              ["Current Ratio", fmt(financials.balance.current_ratio)],
              ["Debt/Equity", fmt(financials.balance.debt_to_equity)],
            ].map(([label, val]) => (
              <Grid item xs={6} md={3} key={label}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="body1" fontWeight="bold">{val}</Typography>
              </Grid>
            ))}
          </Grid>
        </Section>
      )}

      {/* Cash Flow */}
      {financials?.cash_flow?.length > 0 && (
        <Section title="Cash Flow">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell align="right">FCF</TableCell>
                <TableCell align="right">OCF</TableCell>
                <TableCell align="right">Capex</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {financials.cash_flow.map((row) => (
                <TableRow key={row.date}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell align="right" sx={{ color: row.fcf > 0 ? "success.main" : "error.main" }}>
                    {fmtB(row.fcf)}
                  </TableCell>
                  <TableCell align="right">{fmtB(row.ocf)}</TableCell>
                  <TableCell align="right">{fmtB(row.capex)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      )}

      {/* Earnings */}
      {earnings?.length > 0 && (
        <Section title="Earnings History">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Estimate</TableCell>
                <TableCell align="right">Actual</TableCell>
                <TableCell align="right">Surprise</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {earnings.map((e) => (
                <TableRow key={e.date}>
                  <TableCell>{e.date}</TableCell>
                  <TableCell align="right">{e.estimated ? `$${fmt(e.estimated)}` : "—"}</TableCell>
                  <TableCell align="right">{e.reported ? `$${fmt(e.reported)}` : "pending"}</TableCell>
                  <TableCell align="right" sx={{ color: e.surprise_pct > 0 ? "success.main" : e.surprise_pct < 0 ? "error.main" : undefined }}>
                    {e.surprise_pct != null ? `${e.surprise_pct > 0 ? "+" : ""}${fmt(e.surprise_pct, 1)}%` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {darwin?.earnings_beat_rate != null && (
            <Typography variant="body2" mt={1}>
              Beat Rate: <strong>{fmt(darwin.earnings_beat_rate, 0)}%</strong>
            </Typography>
          )}
        </Section>
      )}

      {/* Insiders */}
      {insiders?.length > 0 && (
        <Section title="Insider Activity">
          <Chip
            label={`Sentiment: ${fmt(darwin?.insider_sentiment, 2)}`}
            color={darwin?.insider_sentiment > 0 ? "success" : darwin?.insider_sentiment < 0 ? "error" : "default"}
            size="small"
            sx={{ mb: 1 }}
          />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insiders.slice(0, 6).map((t, i) => (
                <TableRow key={i}>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>{t.name?.slice(0, 25)}</TableCell>
                  <TableCell>
                    <Chip
                      label={t.type === "P" ? "BUY" : t.type === "S" ? "SELL" : t.type}
                      color={t.type === "P" ? "success" : t.type === "S" ? "error" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {t.value ? `$${(t.value / 1e6).toFixed(1)}M` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      )}

      {/* Technicals */}
      {technicals && !technicals.insufficient_data && (
        <Section title="Technical / Box Analysis">
          <Grid container spacing={2}>
            {[
              ["60-Day High", `$${fmt(technicals.high_60d)}`],
              ["60-Day Low", `$${fmt(technicals.low_60d)}`],
              ["Position in Range", `${fmt(technicals.position_in_range, 0)}%`],
              ["RSI(14)", fmt(technicals.rsi, 1)],
              ["5-Day Return", fmtPct(technicals.return_5d)],
              ["20-Day Return", fmtPct(technicals.return_20d)],
            ].map(([label, val]) => (
              <Grid item xs={6} md={2} key={label}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="body1" fontWeight="bold">{val}</Typography>
              </Grid>
            ))}
          </Grid>
          <Box mt={2}>
            {technicals.rsi < 30 && (
              <Chip icon={<TrendingUpIcon />} label="🔥 OVERSOLD — Potential buy zone" color="success" />
            )}
            {technicals.rsi > 70 && (
              <Chip icon={<TrendingDownIcon />} label="⚠️ OVERBOUGHT — Do NOT buy here" color="error" />
            )}
            {technicals.rsi >= 30 && technicals.rsi <= 70 && (
              <Chip label="Mid-range — wait for clearer signal" color="default" />
            )}
          </Box>
        </Section>
      )}

      {/* Graham Detail */}
      <Section title="Graham Valuation">
        <Grid container spacing={2}>
          {[
            ["Graham Score", `${graham?.score || 0}/7`],
            ["Graham Number", graham?.number ? `$${fmt(graham.number)}` : "—"],
            ["Intrinsic Value", graham?.intrinsic_value ? `$${fmt(graham.intrinsic_value)}` : "—"],
            ["Margin of Safety", fmtPct(graham?.margin_of_safety)],
            ["PE × P/B", fmt(graham?.pe_pb_product, 1)],
            ["Net-Net Ratio", fmt(graham?.net_net_ratio)],
          ].map(([label, val]) => (
            <Grid item xs={6} md={2} key={label}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="body1" fontWeight="bold">{val}</Typography>
            </Grid>
          ))}
        </Grid>
      </Section>
    </Box>
  );
};

export default ReportView;
