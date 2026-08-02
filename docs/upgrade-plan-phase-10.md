# Stock App — Phase 10 Upgrade Plan

**Date**: 2026-08-02
**Status**: Phases 1–9 complete. This is the next iteration.

---

## What's Working Well

The app is feature-rich: 4 data sources, 47 stocks, 287K historicals, 11 backtest strategies, alerts, portfolio tracking, technical dashboard, comparison view, 58 frontend routes, 25+ API endpoints. Infrastructure is solid (health checks, backups, smart scheduling, production mode).

## Where It Still Falls Short

After using the app daily for trading analysis, these are the **actual friction points**:

| # | Pain Point | Impact |
|---|-----------|--------|
| 1 | Can't quickly answer "what should I look at today?" without clicking 5 pages | Wastes 10 min every morning |
| 2 | No trade journal linked to positions — diary and portfolio are disconnected | Can't review "why did I buy this?" |
| 3 | Backtesting results are ephemeral — can't compare strategy A vs B over time | Re-run same tests repeatedly |
| 4 | Alert thresholds are manual — no "auto-alert when RSI drops below 30 for ANY stock" | Miss signals on stocks without explicit alerts |
| 5 | No dividend income tracking despite owning PEP, V, MA, COST | Can't project annual income |
| 6 | Frontend test coverage = 0 — no confidence in refactoring | Scared to touch shared components |
| 7 | Single-user auth (API key) — no way to demo or share | Can't show others |
| 8 | 23 computed properties on MyStock hit DB per call — stock list view is slow with 47 stocks | 2-3s load time on stock list |

---

## Phase 10 — Prioritized Plan

### 10.1 Morning Brief (Auto-Generated Daily Summary) ⭐ HIGH

**Problem**: Every morning you open the app, click dashboard, then technicals, then screener, then check alerts. Should be one view.

**Implementation**: New `/brief` route that aggregates:
- Stocks hitting RSI <30 or >70 today (from `/stocks/technicals/`)
- Triggered alerts (from `/alerts/triggered/`)
- Upcoming earnings this week
- Biggest movers (top 3 up, top 3 down)
- Portfolio P&L summary (from `/portfolio/holdings/`)
- New insider trades from yesterday

All on one page — no clicking needed. Just read top-to-bottom.

**Backend**: Single endpoint `GET /stocks/brief/` that pre-computes everything in one DB pass.

**Effort**: 4h | **Delivers**: "Open app, read brief, know what to do."

---

### 10.2 Trade Journal (Link Notes to Positions) ⭐ HIGH

**Problem**: Portfolio shows positions. Diary shows notes. They're disconnected. Can't answer "why did I buy MSFT at $353?"

**Implementation**:
- Add optional `position` FK to `MyDiary` model
- When viewing a position in Portfolio, show linked diary entries below
- When creating a note from stock detail, option to "Link to position"
- Position detail page shows: transactions + linked notes + P&L chart

**Effort**: 3h | **Delivers**: Full trade reasoning audit trail.

---

### 10.3 Smart Alerts (Universal Thresholds) ⭐ HIGH

**Problem**: Currently you must create one alert per stock per condition. With 47 stocks, that's 47 alerts just for "RSI below 30." Should be: "alert me when ANY stock in my Darwin portfolio hits RSI <30."

**Implementation**:
- New alert type: `universal_rsi`, `universal_drop` (not tied to one stock)
- Add optional `sector` FK to Alert model (null = all stocks)
- `check_alerts()` task already loops all stocks — extend to evaluate universal alerts
- Frontend: "Add Universal Alert" in alert management (applies to entire portfolio)

**Effort**: 2h | **Delivers**: One alert covers all 47 stocks.

---

### 10.4 Backtest Comparison View ⭐ MEDIUM

**Problem**: Run Darwin RSI, then run Buy & Hold, then try to remember which was better. No side-by-side.

**Implementation**:
- New route: `/backtest/compare`
- Select 2-3 past BacktestResult records from history
- Show overlay chart: equity curves on same axes
- Metrics table side-by-side (return, Sharpe, drawdown, win rate)

**Effort**: 3h | **Delivers**: "Does timing beat holding?" answered visually.

---

### 10.5 Dividend Tracker ⭐ MEDIUM

**Problem**: Own PEP (50yr dividend aristocrat), V, MA, COST. No visibility into dividend income.

**Implementation**:
- Fetch dividend history from `yfinance` (`.dividends` attribute, free)
- New model `DividendEvent(stock, ex_date, pay_date, amount)`
- Portfolio view: annual projected dividend income based on current holdings
- Ex-date calendar (next 30 days)
- Dividend growth rate per stock

**Effort**: 4h | **Delivers**: "My portfolio generates $X/year in dividends."

---

### 10.6 Performance Cache (Stock List Speed) ⭐ MEDIUM

**Problem**: Stock list and overview endpoint compute 23 properties per stock × 47 stocks = slow.

**Implementation**:
- Denormalize the frequently-accessed computed fields into a `StockSnapshot` model
- Celery task refreshes snapshot after each `price_daily()` run
- Overview endpoint reads from snapshot (single query) instead of computing per-stock
- Fields: price, daily_return, weekly_return, rsi, last_lower, insider_sentiment, pe, roe

**Effort**: 3h | **Delivers**: Stock list loads in <500ms instead of 2-3s.

---

### 10.7 Frontend Test Coverage (Critical Paths)

**Problem**: Zero frontend tests. Can't refactor shared components with confidence.

**Implementation**:
- Add Vitest + React Testing Library (already have Vite)
- Write tests for:
  - `useMarketStatus` hook (deterministic with mocked date)
  - `ColoredNumber` component
  - `routes.jsx` renders without crash (smoke test)
  - `PortfolioView` renders with mock data
  - `TechnicalsView` renders with mock data
- Goal: 15-20 tests covering critical paths, not 100% coverage

**Effort**: 4h | **Delivers**: Confidence to refactor.

---

### 10.8 PDF Report Export

**Problem**: Can't share analysis with yourself via email or print a one-page summary.

**Implementation**:
- Backend: `GET /stocks/{id}/report/?format=pdf`
- Use `weasyprint` to render HTML template → PDF
- Contents: stock name, price, 52-wk range, key metrics, 6-month chart (SVG), earnings history, insider sentiment, Darwin verdict
- Frontend: "Download PDF" button on stock detail

**Effort**: 5h | **Delivers**: One-click shareable stock report.

---

### 10.9 AI-Assisted Analysis (LLM Integration)

**Problem**: Currently you manually write Darwin Kill List assessments in diary notes. LLM could draft these.

**Implementation**:
- "Generate Analysis" button on stock detail page
- Gathers: financials (ROCE, margins, growth), insider activity, earnings history, technicals, valuation
- Sends structured prompt to Claude API (or local Ollama)
- Returns: Kill List assessment + strengths/weaknesses + verdict
- Saves as diary note (user can edit before saving)

**Effort**: 4h | **Delivers**: Auto-drafted analysis in 10 seconds vs 30 minutes.

---

### 10.10 Intraday Price Alerts (WebSocket-lite)

**Problem**: Current alerts only fire after `price_smart()` completes (every 5 min during market). For fast-moving stocks, a 5-min delay means missing the exact entry.

**Implementation** (pragmatic, no Django Channels):
- Reduce `price_smart()` to every 2 min during market hours (just change the counter logic)
- Add "urgent" alert type that checks every 2 min instead of 5
- Frontend: `useTriggeredAlerts` already polls every 30s — good enough
- **Not** full WebSocket (complexity not justified for 1 user)

**Effort**: 1h | **Delivers**: 2-min alert latency during market hours.

---

## Priority Matrix

```
                    LOW EFFORT ────────────── HIGH EFFORT
                    │                                   │
  HIGH VALUE        │ 10.3 Smart alerts    10.1 Brief  │
  (do first)        │ 10.10 Intraday       10.2 Journal│
                    │                      10.5 Divs   │
                    │                                   │
  MEDIUM VALUE      │ 10.6 Perf cache     10.4 BT comp │
                    │                      10.7 Tests  │
                    │                      10.8 PDF    │
                    │                                   │
  NICE TO HAVE      │                      10.9 AI     │
                    │                                   │
```

---

## Execution Order

| Week | Items | Hours | Delivers |
|------|-------|-------|----------|
| 1 | 10.3 Smart alerts + 10.10 Intraday speed + 10.6 Perf cache | 6h | Faster alerts, faster load |
| 2 | 10.1 Morning Brief | 4h | One-page daily actionable summary |
| 3 | 10.2 Trade Journal + 10.5 Dividend tracker | 7h | Complete position context |
| 4 | 10.4 Backtest comparison + 10.7 Frontend tests | 7h | Strategy answers + refactor safety |
| 5 | 10.8 PDF export + 10.9 AI analysis | 9h | Shareable reports + auto-drafts |

**Total: ~33 hours over 5 weeks**

---

## What NOT to Do

| Item | Reason |
|------|--------|
| Full WebSocket/Django Channels | Overkill for single-user. 2-min polling is fine. |
| Multi-user / sharing | No one else uses this. Build if/when needed. |
| Options chain | Not part of current trading framework (box trading doesn't use options) |
| Custom dashboard drag-drop | Current layout works. Polish over substance. |
| Migrate to Next.js/Remix | React 18 + Vite is fine. Zero user benefit from framework churn. |
| GraphQL | REST works fine for this data shape. Would slow development. |

---

*Plan created August 2, 2026.*
