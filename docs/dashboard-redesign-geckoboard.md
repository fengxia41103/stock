# Dashboard Redesign Plan — Geckoboard Style

## Design Principles (from Geckoboard)

1. **Dark background** — `#1a1a2e` or `#16213e` base
2. **One metric per tile** — big number + label + sparkline
3. **Consistent tile grid** — equal-sized tiles in 4-column layout
4. **Color = status** — green/amber/red dot system, not just text
5. **Sparkline context** — 7-day trend line next to each KPI
6. **Goal/progress bars** — show % toward target
7. **No visual clutter** — remove borders, shadows; use spacing

## Layout (3 rows × 4 columns)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Portfolio   │  Stocks Up   │  Stocks Down │  10Y Treasury│
│  Total Value │  ██████ 15   │  ████   10   │  4.49%  ↑    │
│  $276,588    │  ▁▂▃▅▇       │  ▇▅▃▂▁       │  ▂▃▃▅▆       │
├──────────────┼──────────────┼──────────────┼──────────────┤
│  Best Today  │  Worst Today │  Oversold    │  Insider Buy │
│  CAT +3.7%  │  NFLX -6.4% │  CRM 21d    │  SPGI +100%  │
│  ▂▃▅▇█       │  █▇▅▃▂       │  ●●●○○       │  ●●○○○       │
├──────────────┼──────────────┼──────────────┼──────────────┤
│  Next Earn.  │  Market      │  Top ROE     │  Avg Weekly  │
│  PEP Jul 9   │  Breadth     │  MA 232%     │  Return      │
│  in 16 days  │  ████░░░ 60% │  ▁▃▅▇█       │  -2.1%  ↓    │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## Tile Component Design

```jsx
// Each tile = dark Paper with:
<Paper sx={{
  bgcolor: "#1e293b",  // dark slate
  p: 2.5,
  borderRadius: 2,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}}>
  {/* Label */}
  <Typography variant="caption" color="#94a3b8" textTransform="uppercase" letterSpacing={1}>
    {label}
  </Typography>
  
  {/* Big Number */}
  <Typography variant="h3" color="#f8fafc" fontWeight={700}>
    {value}
  </Typography>
  
  {/* Sparkline (inline SVG or mini ECharts) */}
  <Sparkline data={trend7d} color={trendColor} />
  
  {/* Delta badge */}
  <Chip label="+2.3% vs last week" size="small" color="success" />
</Paper>
```

## Color System

| Status | Color | Usage |
|--------|-------|-------|
| Good/Up | `#10b981` (emerald) | Positive returns, insider buying |
| Bad/Down | `#ef4444` (red) | Negative returns, selling |
| Warning | `#f59e0b` (amber) | Oversold, near earnings |
| Neutral | `#6b7280` (gray) | Unchanged |
| Background | `#0f172a` (slate-900) | Page background |
| Tile | `#1e293b` (slate-800) | Tile background |
| Text primary | `#f8fafc` (white) | Numbers |
| Text secondary | `#94a3b8` (slate-400) | Labels |

## Data Mapping (what goes in each tile)

| Tile | Data Source | Update Frequency |
|------|-------------|------------------|
| Portfolio Total Value | Computed from overview (sum of price × shares) | Real-time |
| Stocks Up / Down | `/stocks/overview/` daily_return_pct | Every 10 min |
| 10Y Treasury | `/macro-data/?series_id=DGS10` | Daily |
| Best/Worst Today | `/stocks/overview/` sorted by return | Every 10 min |
| Oversold | `/stocks/overview/` last_lower > 3 | Every 10 min |
| Insider Buying | `/stocks/overview/` insider_sentiment | Daily |
| Next Earnings | `/earnings/upcoming/` | Daily |
| Market Breadth | Computed (% up vs total) | Every 10 min |
| Top ROE | `/stocks/overview/` sorted by roe | Static |
| Avg Weekly Return | Computed from overview | Every 10 min |

## Implementation Steps

1. Create `DashboardTile` component (reusable dark tile with sparkline)
2. Create `PortfolioDashboard` view using 12-tile grid
3. Replace current `TodayDashboardView` content
4. Add dark mode override for dashboard page only (or use sx overrides)
5. Add 7-day sparkline data to overview endpoint

## Estimated Effort

~200 lines of JSX + ~30 lines backend (sparkline data in overview endpoint)
