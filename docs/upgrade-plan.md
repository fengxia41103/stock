# Stock App — Unified Upgrade Plan

**Last updated**: 2026-08-02
**Branch**: `feat-frontend-refactor-cwis-style` (then merge to `dev`)

---

## Completed Work (Phases 1–5)

| Phase | Summary | Status |
|-------|---------|--------|
| 1 | DRF migration, dayjs, pagination, denormalization, Celery parallel, Redis cache, ECharts, react-query, pytest, MUI sx | ✅ 11/11 |
| 2 | Composite indexes, ranking cache, OpenAPI, code-splitting, dark mode, endpoint splitting, gzip | ✅ 8/10 |
| 3 | TypeScript API layer, user provisioning decouple, vendor chunks | ✅ 3/10 |
| 4 | Dead code removal, auto-denormalize, 34 tests, error boundaries, Celery beat, Makefile, sparklines | ✅ 12/12 |
| 5 | SEC EDGAR (insider + 13F), FRED (17 series), Alpha Vantage (earnings), ownership tab, macro overlay, earnings markers | ✅ 10/10 |

**Key metrics achieved**: Rankings 10s→10ms, 4 data sources, 287K+ historicals, 72 JS chunks, 22 API endpoints, 34 tests.

---

## Phase 6 — Features & UX (Current Priority)

### 6.1 Alert System ⭐ HIGH

**Problem**: Miss RSI <30 events, insider cluster buys, earnings dates.

**Backend**:
```python
class Alert(models.Model):
    user = models.ForeignKey(User)
    stock = models.ForeignKey(MyStock)
    alert_type = models.CharField(max_length=32)   # rsi_oversold, price_below, insider_buy, earnings_soon
    threshold = models.FloatField(null=True)
    is_active = models.BooleanField(default=True)
    triggered_at = models.DateTimeField(null=True)

class AlertEvent(models.Model):
    alert = models.ForeignKey(Alert)
    triggered_at = models.DateTimeField(auto_now_add=True)
    value = models.FloatField()
    message = models.TextField()
```

**Celery task**: `check_alerts()` runs after `price_daily`, evaluates all active alerts.

**Frontend**: Bell icon in TopBar with badge count + AlertsDrawer. "Add Alert" button on stock detail.

**Effort**: 4h | **Delivers**: Never miss an oversold signal again.

---

### 6.2 Portfolio Tracker ⭐ HIGH

**Problem**: Track stocks but not actual positions. Can't measure real P&L vs SPY.

**Backend**:
```python
class Position(models.Model):
    user, stock, shares, avg_cost, opened_at, closed_at

class Transaction(models.Model):
    position, action (BUY/SELL), shares, price, date, notes
```

**Frontend** (new nav item `/portfolio`):
- Holdings table: symbol, shares, avg cost, current price, P&L $/%,  weight %
- Total value + daily/weekly/monthly change
- Pie chart by sector
- Performance chart: portfolio vs SPY over time
- Add transaction dialog

**Effort**: 6h | **Delivers**: Know your real returns.

---

### 6.3 Notes UI Refactor ⭐ HIGH

**Problem**: Flat wall of 50+ diary entries, no filtering, no prediction scoreboard.

**Implementation** (from `notes-ui-refactor-plan.md`):
- Backend: `GET /diaries/stats/` → accuracy%, bull/bear breakdown, per-stock stats
- Frontend: 3-panel layout (scorecard + filter/compact list + detail)
- Filter by: bull/bear, correct/wrong, stock, time period
- Only render markdown for selected note (not all 50)

**Effort**: 4h | **Delivers**: Find past analysis, track prediction accuracy.

---

### 6.4 Async Backtesting

**Problem**: Large backtests timeout (504) or freeze the browser.

**Implementation** (from `backtest-async-plan.md`):
- `BacktestResult` model (migration 0053 already exists)
- Celery task `run_backtest_task` on `backtest` queue with progress updates
- Poll endpoint `GET /backtest/{id}/status/`
- Frontend: submit → poll with progress bar → display results
- History list of past backtests (free with the model)

**Effort**: 3h | **Delivers**: Run 49-stock backtests without timeout.

---

### 6.5 Additional Backtesting Strategies

**Problem**: Only 3 strategies implemented. Can't answer "does RSI timing beat buy-and-hold?"

From `backtesting-plan.md`, implement:
- **Buy & Hold Darwin** (benchmark — THE most important comparison)
- **Mean Reversion (SMA deviation)**
- **Momentum + Trailing Stop**
- **Golden Cross / Death Cross**
- **Insider Cluster Buy**

**Effort**: 4h | **Delivers**: Statistical answer to "is my framework better than holding?"

---

### 6.6 Multi-Timeframe Technical Dashboard

**Problem**: Must click into each stock to see RSI/BB/SMA. No overview.

New route: `/technicals` — table of all stocks with:
| Symbol | Price | RSI(14) | BB Position | SMA50 vs SMA200 | Last Lower | Verdict |
|--------|-------|---------|-------------|-----------------|------------|---------|

Color-coded: red=oversold, green=bullish, amber=neutral.

**Effort**: 5h | **Delivers**: At-a-glance screener for box trading signals.

---

### 6.7 Stock Comparison View

**Problem**: "Is V or MA a better buy?" requires opening two tabs.

Route: `/compare?symbols=MSFT,GOOGL,V`
- Normalized price performance chart
- Key metrics table (PE, ROE, ROCE, D/E, FCF yield, beat rate)
- DuPont decomposition side-by-side
- Insider sentiment comparison

**Effort**: 3h | **Delivers**: Head-to-head stock analysis.

---

### 6.8 Auto-Refresh on Market Hours

**Problem**: Data is stale unless you manually trigger refresh.

```javascript
// useMarketStatus hook
const isOpen = isWeekday && hour >= 9 && hour < 16; // ET
// If open: refetchInterval: 60_000
// If closed: refetchInterval: false
```

Plus: green/red dot in TopBar showing market status.

**Effort**: 2h | **Delivers**: Always-fresh data during trading hours.

---

## Phase 7 — Frontend Architecture (CWIS Refactor)

### 7.1 Kill Dead Dependencies & Code

- Remove `moment` from package.json (dayjs already everywhere)
- Remove `@faker-js/faker` (shouldn't be in prod deps)
- Delete `ShowResource`, `PollResource`, `Get` components
- Delete `context.js` (legacy GlobalContext, 1 line)
- Remove `@fengxia41103/storybook` (already done — replaced by `components/shared`)

**Effort**: 1h

---

### 7.2 Standardize on Highcharts Only

Currently: ECharts in PriceView/TechIndicator/MacroOverlay/sectors + Highcharts in dashboard.

Migration:
1. Rewrite PriceChart → Highcharts Stock (candlestick, volume, navigator built-in)
2. Rewrite MacroOverlay → Highcharts dual Y-axis
3. Rewrite sector charts → Highcharts line/bar
4. Rewrite backtest equity curve → Highcharts line
5. Remove `echarts` from package.json (saves 350KB gzipped)

**Effort**: 4h

---

### 7.3 Dark Theme Default (Lock In)

Already mostly done. Finalize:
- Remove light mode toggle (unused, adds dead code)
- Delete `useChartTheme` hook (was for ECharts light/dark sync)
- Hardcode dark theme in `theme/index.js`

**Effort**: 30min

---

### 7.4 Flatten Page Structure (Optional)

Move `views/{domain}/{ViewName}/index.jsx` → `pages/{PageName}.jsx`.

**Decision**: DEFER. The current structure works fine with Vite's lazy loading. Flattening is cosmetic — 80+ file moves with zero functional gain. Only do this if a major rewrite happens.

---

### 7.5 Component Consolidation

Create `components/shared/` (already started):
- `PageShell` — title + content wrapper (replaces `Page`)
- `StatCard` — KPI tile (used in dashboard, could be reused)
- `DataTable` — sortable table wrapper
- `LoadingState` — ScaleLoader + empty state

**Effort**: 2h

---

## Phase 8 — Infrastructure & DevOps

### 8.1 Smart Celery Scheduling

**Problem**: Price fetched every 10 min 24/7. Wasteful.

```python
# Market hours (Mon-Fri 9:30-16:00 ET): every 5 min
# Pre/post market (7-9:30, 16-18): every 15 min
# Nights/weekends: every 2 hours
# Statements: weekly Sunday
# FRED: weekly Sunday
# Insider trades: daily 6 AM ET
# Earnings calendar: daily 7 AM ET
```

**Effort**: 2h

---

### 8.2 Health Check Endpoint

`GET /api/v1/health/` → `{db: "ok", redis: "ok", celery: "ok"}`.
Add Docker healthcheck using this endpoint.

**Effort**: 1h

---

### 8.3 Automated DB Backup

Celery task: nightly `mysqldump` → gzipped → stored locally.
Retain: 7 daily + 4 weekly.

**Effort**: 1h

---

### 8.4 Docker Production Mode

Current: `runserver` (dev mode). Add:
```yaml
# docker-compose.prod.yml override
services:
  web:
    command: gunicorn -w 4 -t 120 -b 0.0.0.0:8001 fin.wsgi
```

**Effort**: 1h

---

### 8.5 Email Digest (Weekly Summary)

Celery task (Friday 4:30 PM ET):
```
Your Week in Review:
• Portfolio: +2.3% vs SPY +1.1%
• Alerts triggered: MSFT RSI<30, CME hit support
• Upcoming earnings: PEP Aug 5, GOOGL Aug 7
• Best: V +4.2% | Worst: NFLX -3.1%
```

Requires SMTP config (AWS SES or local postfix).

**Effort**: 3h

---

### 8.6 Mobile Responsive Pass

Key fixes:
- Dashboard: stack tiles 1-column on xs
- Screener: card layout on mobile (not table)
- Stock detail: collapse sidebar sections into accordion
- Charts: responsive height, touch-friendly tooltips
- Nav: bottom tab bar on mobile

**Effort**: 6h

---

## Phase 9 — Data Backfill & Quality

### 9.1 Backfill Historical Earnings Surprises

Currently only upcoming earnings fetched. Need per-stock surprise data for EarningsView + beat rate + backtesting.

```bash
# Alpha Vantage: 25 calls/day free. Rotate through stocks:
make fetch-earnings  # calendar
# Then daily: 12 stocks/day, all 47 covered in 4 days
```

**Effort**: 1h (script exists, just needs scheduling)

---

### 9.2 Populate Institutional Holdings (13F)

Run quarterly fetch (worker exists, just hasn't been scheduled):
```bash
make fetch-holdings  # new Makefile target
```

**Effort**: 30min

---

### 9.3 Persist Earnings Price Impact

`compute_earnings_impact` worker exists but only logs. Wire it to `EarningsPriceImpact` model (migration 0052 exists) and display in EarningsView.

**Effort**: 2h

---

### 9.4 Persist Macro Correlations

`compute_macro_correlations` management command exists. Wire to `StockMacroCorrelation` model and display as heatmap in sector view.

**Effort**: 2h

---

## Priority Matrix

```
                      LOW EFFORT ─────────────── HIGH EFFORT
                      │                                    │
  HIGH IMPACT         │ 6.4 Async backtest   6.1 Alerts   │
  (do now)            │ 7.1 Dead deps        6.2 Portfolio │
                      │ 6.8 Auto-refresh     6.3 Notes    │
                      │ 8.1 Celery schedule               │
                      │ 8.2 Health check                   │
                      │                                    │
  MEDIUM IMPACT       │ 7.3 Dark theme lock  7.2 Highcharts│
  (do next)           │ 9.1 Earnings backfill 6.5 Strategies│
                      │ 9.2 Holdings         6.6 Tech dash │
                      │                      6.7 Compare   │
                      │                                    │
  LOW IMPACT          │ 8.3 DB backup        8.5 Email    │
  (when convenient)   │ 8.4 Prod compose     8.6 Mobile   │
                      │ 7.4 Flatten pages                  │
                      │                                    │
```

---

## Execution Schedule

| Week | Items | Hours | Delivers |
|------|-------|-------|----------|
| 1 | 7.1 Dead deps + 6.4 Async backtest + 8.2 Health check + 8.1 Celery schedule | 7h | Clean bundle, no timeouts, smart fetching |
| 2 | 6.1 Alert system + 6.8 Auto-refresh | 6h | Never miss a signal |
| 3 | 6.3 Notes refactor + 9.1 Earnings backfill | 5h | Usable diary, complete earnings data |
| 4 | 6.2 Portfolio tracker | 6h | Real P&L tracking |
| 5 | 7.2 Highcharts standardize + 7.3 Dark lock-in | 5h | One chart lib, 350KB smaller, consistent UX |
| 6 | 6.5 More strategies + 6.6 Technical dashboard | 9h | "Does timing beat holding?" answered |
| 7 | 6.7 Compare view + 9.3 Earnings impact + 9.4 Macro correlations | 7h | Side-by-side analysis, richer data |
| 8 | 8.5 Email digest + 8.6 Mobile + 8.3 Backup + 8.4 Prod | 11h | Polish & production-ready |

**Total: ~56 hours over 8 weeks**

---

## What NOT to Do

| Item | Reason |
|------|--------|
| Flatten pages (7.4) | Cosmetic, 80 file moves, zero user benefit |
| Lodash removal | Tree-shakes fine, 57 files to change |
| Playwright E2E | Requires browser env, low ROI with 34 unit tests |
| Prometheus metrics | Overkill for single-user app |
| Feature folders | Already works, breaking for no gain |
| Rewrite API layer | react-query + client.ts works perfectly |

---

## One-Line Summary

> **Week 1–2**: Alerts + auto-refresh + async backtest (stop missing signals, stop timeouts). **Week 3–4**: Notes refactor + portfolio tracking (find analysis, measure P&L). **Week 5–8**: Chart consolidation + more strategies + mobile (polish + validate framework).

---

*Consolidated from: upgrade-plan.md, upgrade-plan-phase-6.md, frontend-refactor-cwis-style.md, notes-ui-refactor-plan.md, backtest-async-plan.md, backtesting-plan.md. August 2, 2026.*
