# Stock App — Unified Upgrade Plan

**Last updated**: 2026-08-07
**Branch**: `feat-frontend-refactor-cwis-style`

---

## Completed Work (Phases 1–10) ✅

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
| 6.1 | Alert System (6 types: RSI, price, insider, earnings, drop + universal) + bell icon + drawer | ✅ |
| 6.2 | Portfolio Tracker (positions, transactions, P&L, pie chart) | ✅ |
| 6.3 | Notes UI Refactor (3-panel, filters, scorecard, compact cards) | ✅ |
| 6.4 | Async Backtesting (Celery + polling + progress bar + history) | ✅ |
| 6.5 | 11 Backtesting Strategies (Darwin RSI, Box, Earnings, Buy&Hold, Mean Reversion, Momentum, Golden Cross, Insider, Post-Drift, Volatility, Low PE) | ✅ |
| 6.6 | Technical Dashboard (RSI/SMA/BB/verdict for all stocks) | ✅ |
| 6.7 | Stock Comparison View (normalized chart + metrics table) | ✅ |
| 6.8 | Auto-Refresh on Market Hours (useMarketStatus hook + status dot) | ✅ |
| 6.9 | Morning Brief (auto-generated daily summary at /brief) | ✅ |
| 6.10 | Trade Journal (diary linked to positions via FK) | ✅ |
| 6.11 | Backtest Comparison View (overlay equity curves) | ✅ |
| 6.12 | Dividend Tracker (DividendEvent model + worker) | ✅ |
| 6.13 | Performance Cache (StockSnapshot denormalized) | ✅ |

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

### Phase 10 — Deep-Dive Research Framework ✅ COMPLETE

Bridges the gap between "Darwin quality screen + RSI timing" and institutional-grade fundamental research. 5 Research tabs in StockDetailView.

| Phase | Feature | Status | Date |
|-------|---------|--------|------|
| 10A | StockThesis model + UI (edge, drivers, scenarios, kill criteria) | ✅ | Aug 6 |
| 10B | Reverse DCF Calculator (implied growth from price) | ✅ | Aug 6 |
| 10C | Peer Benchmark View (PEER_DEFAULTS for 24 stocks, populate action) | ✅ | Aug 7 |
| 10D | Capital Cycle Dashboard (capex/ROIC aggregation, phase detection) | ✅ | Aug 7 |
| 10E | Earnings Call Notes (structured scorecard form) | ✅ | Aug 7 |
| 10F | Thesis Stale Alerts (>30 days = alert fires) | ✅ | Aug 6 |
| 10G | Risk Factors Tracker (10-K risks, materializing toggle) | ✅ | Aug 7 |

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
| API endpoints | 28+ |
| Frontend routes | 45+ |
| Backend tests | 63 (34 original + 29 new) |
| Frontend tests | 18 |
| JS chunks (code-split) | 75 |
| Celery scheduled tasks | 8 |
| Django models | 25 |
| Django migrations | 63 |

---

## Phase 11 — Future Ideas (Not Prioritized)

These are potential enhancements. No timeline assigned.

| # | Feature | Effort | Value |
|---|---------|--------|-------|
| 11.1 | AI-Assisted Analysis (LLM generates Darwin assessment) | 4h | Medium |
| 11.2 | PDF Report Export (weasyprint one-page stock report) | 5h | Medium |
| 11.3 | Options Chain Integration (IV, put/call ratio, Greeks) | 6h | Low |
| 11.4 | Sector Rotation Heatmap (calendar view of sector leadership) | 4h | Medium |
| 11.5 | Tax Lot Tracking (FIFO/LIFO cost basis, wash sale detection) | 6h | Medium |
| 11.6 | Browser Push Notifications (service worker for critical alerts) | 3h | Medium |
| 11.7 | Custom Dashboard Layouts (drag-and-drop tiles) | 8h | Low |
| 11.8 | Multi-User / Sharing (role-based access, collaborative analysis) | 10h | Low |
| 11.9 | Real-Time WebSocket Prices (Django Channels) | 8h | Low |
| 11.10 | Additional backend tests (alert evaluation, API contracts) | 3h | High |

---

## Architecture Summary (Current State)

```
Frontend: React 18 + Vite + MUI 5 + Highcharts
Backend:  Django 5.2 + DRF + Celery + Redis + MySQL
Infra:    Docker Compose (dev) + docker-compose.prod.yml (prod)
Data:     Yahoo Finance + SEC EDGAR + FRED + Alpha Vantage
Auth:     Token-based (DRF TokenAuthentication)
Tests:    63 pytest (backend) + 18 vitest (frontend)
```

### StockDetailView Sections (6 tabs, 28 sub-views)

```
Price & Trends    │ Daily Prices, Last Lower, 24hr/Daily/Overnight Returns
Tech Indicators   │ Bollinger, MACD, RSI, SAR, Stochastics, Heikin-Ashi, Elder Ray
Financials        │ Balance Sheet, Income Statement, Cash Flow
Valuation         │ DuPont, DCF, Ratios, NAV, Graham, Earnings, Health
Ownership         │ Insider Trades, Institutional
Research          │ Thesis, Earnings Notes, Risk Factors, Peer Benchmark, Capital Cycle
```

### Management Commands

```bash
python manage.py seed_peer_groups     # Populate default peer groups for 24 stocks
python manage.py backfill_computed_fields  # Refresh denormalized fields
python manage.py rebuild_rankings     # Rebuild ranking cache
python manage.py compute_macro_correlations  # Stock vs macro Pearson r
python manage.py purge_tasks          # Clean old Celery tasks
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

*Plan finalized August 2, 2026. Phase 10 completed August 7, 2026.*
