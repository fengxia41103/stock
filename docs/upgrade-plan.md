# Stock App — Unified Upgrade Plan

**Last updated**: 2026-08-02
**Branch**: `feat-frontend-refactor-cwis-style`

---

## Completed Work (Phases 1–9) ✅

### Phases 1–5 (Prior Work)

| Phase | Summary | Status |
|-------|---------|--------|
| 1 | DRF migration, dayjs, pagination, denormalization, Celery parallel, Redis cache, ECharts, react-query, pytest, MUI sx | ✅ 11/11 |
| 2 | Composite indexes, ranking cache, OpenAPI, code-splitting, dark mode, endpoint splitting, gzip | ✅ 8/10 |
| 3 | TypeScript API layer, user provisioning decouple, vendor chunks | ✅ 3/10 |
| 4 | Dead code removal, auto-denormalize, 34 tests, error boundaries, Celery beat, Makefile, sparklines | ✅ 12/12 |
| 5 | SEC EDGAR (insider + 13F), FRED (17 series), Alpha Vantage (earnings), ownership tab, macro overlay, earnings markers | ✅ 10/10 |

### Phase 6 — Features & UX ✅

| Item | Feature | Status |
|------|---------|--------|
| 6.1 | Alert System (6 types: RSI, price, insider, earnings, drop) + bell icon + drawer | ✅ |
| 6.2 | Portfolio Tracker (positions, transactions, P&L, pie chart) | ✅ |
| 6.3 | Notes UI Refactor (3-panel, filters, scorecard, compact cards) | ✅ |
| 6.4 | Async Backtesting (Celery + polling + progress bar + history) | ✅ |
| 6.5 | 11 Backtesting Strategies (Darwin RSI, Box, Earnings, Buy&Hold, Mean Reversion, Momentum, Golden Cross, Insider, Post-Drift, Volatility, Low PE) | ✅ |
| 6.6 | Technical Dashboard (RSI/SMA/BB/verdict for all stocks) | ✅ |
| 6.7 | Stock Comparison View (normalized chart + metrics table) | ✅ |
| 6.8 | Auto-Refresh on Market Hours (useMarketStatus hook + status dot) | ✅ |

### Phase 7 — Frontend Architecture ✅

| Item | Feature | Status |
|------|---------|--------|
| 7.1 | Kill dead deps (moment, faker, context.js) | ✅ |
| 7.2 | Standardize on Highcharts Only | ✅ Done (ECharts fully removed) |
| 7.3 | Dark Theme Default (locked in) | ✅ |
| 7.5 | Shared components (Page, ColoredNumber, etc.) | ✅ |

### Phase 8 — Infrastructure & DevOps ✅

| Item | Feature | Status |
|------|---------|--------|
| 8.1 | Smart Celery Scheduling (market-hours aware) | ✅ |
| 8.2 | Health Check Endpoint (DB + Redis + Celery) + Docker healthcheck | ✅ |
| 8.3 | Automated DB Backup (nightly, 7 daily + 4 weekly retention) | ✅ |
| 8.4 | Docker Production Mode (gunicorn, docker-compose.prod.yml) | ✅ |
| 8.5 | Weekly Email Digest (Friday 4:30PM, movers + alerts + earnings) | ✅ |
| 8.6 | Mobile Responsive Pass (table scroll, chart reflow) | ✅ |

### Phase 9 — Data Backfill & Quality ✅

| Item | Feature | Status |
|------|---------|--------|
| 9.1 | Earnings Surprise Daily Rotation (12 stocks/day, all covered in 4 days) | ✅ |
| 9.2 | Institutional Holdings (worker exists, scheduled quarterly) | ✅ |
| 9.3 | Earnings Price Impact (compute_earnings_impact worker) | ✅ |
| 9.4 | Macro Correlations (compute_macro_correlations command) | ✅ |

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Data sources | 4 (Yahoo + SEC EDGAR + FRED + Alpha Vantage) |
| Stocks tracked | 47 |
| Historical records | 287K+ |
| FRED macro series | 17 (2,942 data points) |
| Earnings events | 2,342 |
| Insider trades | 2,723 |
| Backtesting strategies | 11 |
| API endpoints | 25+ |
| Frontend routes | 40+ |
| Backend tests | 34 |
| JS chunks (code-split) | 72 |
| Celery scheduled tasks | 8 |

---

## Phase 10 — Future Ideas (Not Started)

These are potential enhancements beyond the current scope. No timeline assigned.

### 10.1 AI-Assisted Analysis

- "Generate Analysis" button on stock detail → calls LLM with financials + technicals
- Auto-generates Darwin Kill List assessment + verdict as diary note
- Could use local Ollama or Claude API

### 10.2 Real-Time WebSocket Prices

- Replace polling with WebSocket connection during market hours
- Live price tickers in dashboard without full page refetch
- Requires: Django Channels + Redis pub/sub

### 10.3 Social Sharing / Export

- PDF report generation per stock (weasyprint)
- Share analysis via link (public read-only view)
- Export portfolio history as CSV

### 10.4 Options Chain Integration

- Fetch options data from Yahoo Finance
- Display implied volatility, put/call ratio
- Greeks visualization per stock

### 10.5 Sector Rotation Heatmap

- Calendar heatmap showing which sector leads each week
- Visualize money flow between sectors over time
- Highlight rotation opportunities

### 10.6 Watchlist Sharing

- Multiple users can share a sector/watchlist
- Collaborative diary entries (team analysis)
- Role-based access (viewer/editor)

### 10.7 Tax Lot Tracking

- FIFO/LIFO cost basis per transaction
- Estimated tax impact of selling specific lots
- Wash sale detection

### 10.8 Dividend Tracking

- Fetch dividend history per stock
- Project annual dividend income
- Dividend growth rate analysis
- Ex-date calendar

### 10.9 Custom Dashboard Layouts

- Drag-and-drop tile arrangement
- Save multiple dashboard configurations
- User-configurable KPI tiles

### 10.10 Browser Notifications

- Service worker push notifications for alerts
- Works when app is not open
- Critical alerts only (RSI <20, insider cluster, earnings gap)

---

## Architecture Summary (Current State)

```
Frontend: React 18 + Vite + MUI 5 + Highcharts
Backend:  Django 5.2 + DRF + Celery + Redis + MySQL
Infra:    Docker Compose (dev) + docker-compose.prod.yml (prod)
Data:     Yahoo Finance + SEC EDGAR + FRED + Alpha Vantage
Auth:     API key in localStorage
Tests:    34 pytest (backend)
```

---

## Makefile Reference

```bash
make dev              # Start all services
make prod             # Start in production mode (gunicorn)
make test             # Run backend tests
make build            # Build frontend
make backup           # Manual DB backup
make backfill         # Backfill computed fields
make rebuild-rankings # Rebuild ranking cache
make fetch-fred       # Fetch FRED macro data
make fetch-earnings   # Fetch earnings calendar
make fetch-earnings-surprise  # Fetch earnings surprises (12 stocks rotation)
make fetch-insider    # Fetch insider trades
make fetch-all        # Run all data fetches
make lint             # Lint backend
make logs             # Follow logs
make shell            # Django shell
```

---

*Plan finalized August 2, 2026.*
