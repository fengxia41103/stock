# Agents.md — Stock Analyzer

## Project Overview

A containerized **Django 5.1 + React 18** web application for stock market data analysis. It fetches Yahoo Finance data (prices, financial statements, valuation ratios), computes 100+ financial metrics, and presents human-friendly insights like "last time I saw a price lower than this was 30 days ago."

**Repo**: https://github.com/fengxia41103/stock

---

## Architecture

```
React SPA (Vite) ──► Nginx (8084) ──► Browser
Django/DRF        ──► Nginx (8083) ──► REST API
Celery Worker     ──► Redis         ──► Yahoo Finance API
MySQL 9.7         ──► Persistent volume
```

Six Docker Compose services: `frontend`, `backend-proxy`, `web`, `celery`, `redis`, `db`.

Two isolated networks: `management` (frontend, backend-proxy, web) and `data` (db, redis, web, celery).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, MUI 5, ECharts, react-query v5, react-router v6, TypeScript (API layer) |
| Backend | Django 5.1, Django REST Framework, drf-spectacular (OpenAPI), django-filter |
| Task Queue | Celery 5.4, Redis broker, django-celery-results |
| Database | MySQL 9.7 |
| Cache | django-redis |
| Data Sources | yfinance, yahooquery |
| Testing | pytest, pytest-django, factory-boy |
| CI/CD | GitHub Actions (Prettier), Husky (commitlint), conventional commits |
| Deployment | Docker Compose (local), Kubernetes + Helm (production) |

---

## Directory Structure

```
├── backend/
│   ├── fin/                    # Django project settings, celery config, wsgi
│   ├── stock/
│   │   ├── api/                # DRF viewsets, serializers, urls
│   │   ├── models/             # Django models (stock, historical, statements, etc.)
│   │   ├── workers/            # Celery task implementations (Yahoo Finance fetchers)
│   │   ├── management/commands/# Django management commands (backfill, rebuild_rankings)
│   │   ├── tests/              # pytest test suite
│   │   ├── services.py         # User provisioning logic
│   │   ├── signals.py          # Django signals (post_save)
│   │   └── tasks.py            # Celery task definitions and scheduling
│   ├── requirements.txt
│   ├── conftest.py
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                # TypeScript API client (axios + react-query hooks)
│   │   ├── components/         # UI components (stock, sector, diary, dashboard, auth, etc.)
│   │   ├── views/              # Route-level view components
│   │   ├── layouts/            # MainLayout, NavBar, TopBar
│   │   ├── lib/                # Shared chart/display/layout components
│   │   ├── theme/              # MUI theme config with dark mode
│   │   ├── utils/              # Helper utilities
│   │   ├── routes.jsx          # React Router config (lazy-loaded, 66 chunks)
│   │   └── main.jsx            # App entry point
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docs/                       # Architecture docs, design docs, Pelican site
├── skills/                     # Trading strategy notes and analysis documents
├── docker-compose.yml
├── Makefile
├── .env.example
└── dotenv-local                # Local env vars (symlinked to .env)
```

---

## Key Data Models

| Model | Purpose |
|-------|---------|
| `MyStock` | Core stock entity — symbol, beta, ROE, ROA, denormalized fields |
| `MyStockHistorical` | Daily OHLCV with computed `d_last_lower`, `d_last_better` |
| `MySector` | User-defined stock groups (M2M to stocks) |
| `IncomeStatement` | Quarterly income data (~30 fields + computed ratios) |
| `BalanceSheet` | Quarterly balance data (~56 fields + computed ratios) |
| `CashFlow` | Quarterly cash flow (~20 fields + computed ratios) |
| `ValuationRatio` | PE, PB, PS, PEG, Forward PE |
| `MyDiary` | User journal with bull/bear predictions |
| `MyTask` | Tracks Celery task execution |
| `RankingCache` | Materialized ranking data |

---

## API Design

**Base URL**: `/api/v1/`  
**Auth**: Token-based (`Authorization: Token <key>`)  
**Framework**: Django REST Framework with `DefaultRouter`

Core endpoints:
- `/sectors/`, `/stocks/`, `/historicals/`
- `/incomes/`, `/balances/`, `/cashes/`, `/ratios/`
- `/stock-ranks/`, `/balance-ranks/`, `/cash-ranks/`, `/income-ranks/`, `/valuation-ranks/`
- `/diaries/`, `/news/`, `/tasks/`
- `/users/` (register), `/auth/login/`, `/auth/logout/`

Custom split endpoints on StockViewSet: `/stocks/{id}/dupont/`, `/stocks/{id}/nav/`, `/stocks/{id}/cross-statements/`

Pagination: 200 items/page (DRF `PageNumberPagination`).

---

## Data Pipeline (Celery)

### Periodic Tasks
| Task | Interval | Queue |
|------|----------|-------|
| `price_daily` | Every 10 min | price |
| `statement_daily` | Daily at midnight | statement |
| `rebuild_ranking_cache` | Every 6 hours | summary |

### On-Demand (stock add/update)
Two parallel chains via `batch_update_helper(user, symbol)`:
1. **Price chain**: `yahoo_consumer` → `summary_consumer`
2. **Statement chain**: `balance_sheet` → `income` → `cash_flow` → `valuation_ratio`

### Workers (all extend `StatementWorker` base class)
- `MyStockHistoricalYahoo` — yfinance OHLCV fetch
- `MySummary` — yahooquery summary (ROE, ROA, beta)
- `MyBalanceSheet`, `MyIncomeStatement`, `MyCashFlowStatement` — yahooquery statements
- `MyValuationRatio` — yahooquery ratios

### Post-fetch hooks
- `_update_historical_denorm(symbol)` — recomputes `d_last_lower`, `d_last_better` for last 10 records
- `_update_stock_denorm(symbol)` — updates `d_pe`, `d_pb`, `d_ps`, `d_price_to_cash_premium`

---

## Frontend Architecture

- **Routing**: React Router v6, all routes lazy-loaded (66 code-split chunks)
- **Data Fetching**: TypeScript API layer (`src/api/client.ts` + `hooks.ts`) using `@tanstack/react-query` v5
- **State**: No global store — context per view section, react-query for server state
- **Charts**: ECharts exclusively (replaced react-sparklines, react-gauge-chart, react-stockcharts)
- **Theme**: MUI 5 with dark mode toggle (localStorage persistence)
- **Auth**: Token in localStorage, axios interceptor adds `Authorization` header, 401 → redirect to login

---

## Development Workflow

```bash
# Start all services
make up          # docker compose up -d

# Hot reload frontend
make dev         # cd frontend && npx vite --host 0.0.0.0

# Run tests
make test        # docker compose exec web pytest -v --tb=short

# Backfill computed fields
make backfill    # management command

# Rebuild rankings
make rebuild-rankings
```

### Git Conventions
- Branch from `feat-ai-revive-this-stack`
- Conventional commits enforced by commitlint
- PR with rebase merge back to feature branch

---

## Testing

- **Backend**: pytest + factory-boy, 9+ API tests covering CRUD, rankings, signals
- **Factories**: `StockFactory`, `HistoricalFactory`, `SectorFactory`
- **Config**: `conftest.py` with `@pytest.fixture` for DB setup

---

## Investment Philosophy

**Core principle: Own quality businesses.** This is not a trading app — it's a tool to find, evaluate, and monitor monopoly/duopoly businesses that compound wealth over time.

### Framework: Darwin Investing (Pulak Prasad)

1. **Kill List** — Reject stocks that fail any of 10 criteria (dishonest management, high leverage, serial acquirer, fast-changing industry, turnaround, misaligned interests, state-owned, customer concentration, complex model, fraud history)
2. **ROCE >15%** sustained over 5+ years
3. **Clear, durable moat** — switching costs, network effects, physical monopoly, regulatory barrier, scale advantage
4. **Buy and be extremely lazy** — only sell if the moat permanently breaks

### What We Look For

- **Monopolies/duopolies** — Businesses that sit on toll roads the economy must pass through (V/MA for payments, FICO for credit scoring, KLAC for chip inspection, VRSN for internet domains, UNP for railroads)
- **High ROCE** — Capital-efficient businesses that generate excess returns (25-50%+ ROCE)
- **Recurring revenue** — Subscription, licensing, or embedded-in-operations models that customers can't easily cancel
- **Pricing power** — Ability to raise prices without losing customers (moat proof)
- **Healthy cash flow** — Earnings backed by real cash, not accruals. Quantified below.

### Cash Flow Health Gate

A quality business must convert reported earnings into actual cash. This is a hard filter — a name failing it is either capex-heavy (accept only with a re-rating thesis) or has earnings-quality risk (avoid). Metrics from the latest quarter (`CashFlow` model), confirmed against a 4-quarter trend to filter one-off swings:

| Metric | Formula | Healthy threshold | What it catches |
|--------|---------|-------------------|-----------------|
| OCF positive | `operating_cash_flow > 0` | required | Business self-funds operations |
| FCF positive | `free_cash_flow > 0` | required | Funds itself after capex |
| **OCF / Net Income** | `ocf_over_net_income` | **≥ 80%** (persistently) | Earnings-quality: accruals/aggressive rev-rec break this before earnings break |
| **FCF / OCF** | `fcf_over_ocf` | **≥ 50%** | Capex intensity — how much cash survives reinvestment |

Interpretation notes (do NOT auto-reject on a single fail — diagnose):
- **High OCF/NI but low FCF/OCF** = capex-heavy investment phase (e.g. MSFT ~37% FCF/OCF on $100B/yr AI capex; RCL/LIN on fleet/plant). Legitimate IF there's a payback thesis (Step 14 re-rating). Not an earnings-quality problem.
- **Low OCF/NI (< 80%)** = the real red flag. Earnings not backed by cash → investigate accruals, receivables growth, non-GAAP add-backs before trusting the P&L.
- **One strong/weak quarter ≠ trend.** Working-capital swings distort a single period. Require the pattern to hold across ~4 quarters.
- Payments/data/software (V 93%, MA 92%, SPGI 97%, PDD 99%) score highest; capex-heavy semis/industrials (TXN 62%, AMAT 67%, RCL negative) score lower by nature — compare within peer type, not across.

### Entry Timing: Darwin + RSI

- Buy Darwin-approved stocks when RSI(14) < 30 (oversold on non-fundamental reasons)
- Historical accuracy: **93.9%** on Darwin + RSI + 30-day holds
- Position sizing: max 5% per new position, scale in on further weakness
- Stop losses defined per position before entry

### The "Cheap for a Reason" Filter (CRITICAL — avoid value traps)

RSI < 35 and "low in the range" are NECESSARY but NOT SUFFICIENT. Before buying any dip, run this checklist. A stock must pass ALL of it, not just the RSI screen:

1. **Is the decline non-fundamental?** — Sector rotation, market-wide risk-off, or guilt-by-association = OK to buy. Actual business deterioration = AVOID. Ask "why is it down?" and verify with news/earnings, never just the RSI number.

2. **Is it a REAL discount or mid-range?** — Check the 2-year price position, not just RSI. A stock at RSI 32 but 50%+ of its 2-year range is NOT washed out — it's mid-range with a short-term wobble. Require 2-year position < 35% for a genuine discount.

3. **Is the valuation actually cheap?** — A quality business at 38-47x PE is not "cheap" just because it fell. Check PE vs the company's own history and vs growth rate. Falling from 50x to 40x is not a bargain.

4. **Is the chart a dip or a multi-year downtrend?** — A dip in an uptrend = buy. A stock making lower highs for 1-2+ years = falling knife, the market knows something. Check the year-over-year price trajectory.

5. **Is the moat genuinely intact, or is there a NEW structural threat?** — A new competitor, regulatory attack, or technology shift (even if probably overblown) changes the thesis. Distinguish "headline fear" (buy) from "the moat is actually being attacked" (wait for proof).

6. **Does cash flow confirm the quality?** — Run the Cash Flow Health Gate (above). OCF/NI ≥ 80% persistently and FCF/OCF ≥ 50%. If OCF/NI is weak, the "cheap" price may be discounting deteriorating earnings quality — a value trap in disguise. If only FCF/OCF is weak, confirm it's capex (with a payback thesis), not cash burn.

### Decision Matrix (Cash Flow Health × RSI Timing)

The cash-flow gate answers WHAT to own; RSI/2-year position answers WHEN. Cross them:

| | RSI < 35 & 2yr pos < 35% (oversold, real discount) | RSI 35–60 (mid-range) | RSI > 60 / top of box (extended) |
|---|---|---|---|
| **Healthy CF (OCF/NI≥80%, FCF/OCF≥50%)** | ✅ **BUY** — run full Cheap-for-a-Reason filter, then scale in | ⏳ **WATCH** — set RSI<40 alert, wait for pullback | 🚫 **HOLD/DON'T ADD** — quality but chasing; wait |
| **Capex-heavy (OCF/NI≥80%, FCF/OCF<50%)** | ✅ **BUY only with re-rating thesis** (Step 14 payback) + tighter stop | ⏳ **WATCH** — verify capex cycle isn't rolling over | 🚫 **AVOID adding** |
| **Weak OCF/NI (<80%)** | ⚠️ **SUSPECT VALUE TRAP** — earnings-quality risk; prove it's a one-off before buying | ❌ **AVOID** | ❌ **AVOID** |

Notes: "Healthy CF + oversold" is the only true green light. "Weak OCF/NI + cheap" is the classic value trap the filter exists to catch. Cash is a position — if nothing lands in a ✅ cell, wait.

### Documented Value-Trap Lessons (do not repeat)

- **ODFL (rejected Sep 1)**: RSI 32 looked oversold, but 2-year position was 56% (mid-range) and PE 38x (expensive for GDP-level growth). Stuck in a $175-230 range for 5 years. LESSON: RSI without checking 2-year position + valuation is misleading.
- **POOL (rejected Sep 2)**: RSI 42, 6% of 2-year range, 17x PE looked like a clean monopoly discount. But the -65% drop was a post-COVID construction-boom unwind (fundamental), not seasonal or rotational. Also has genuine stock-price seasonality (April +6.4%, September weak). LESSON: A big multi-year drop is usually fundamental — "cheap can get cheaper." Check WHY, and know the business's seasonality.
- **FICO (rejected Sep 2)**: RSI 44, 12% of 2-year range, monopoly moat (90%+ US credit scoring). But in a 2-year structural downtrend (−54% from ATH): mortgage-volume collapse (rate sensitivity), CFPB pricing scrutiny, and VantageScore competition threat to the mortgage monopoly. LESSON: Even a real monopoly can be a falling knife if it faces a mortgage/rate cycle + regulatory + competitive overhang. A broken multi-year chart overrides a good moat story.

### The Meta-Lesson

The truly bulletproof monopolies (V, MA, MSCI, VRSN, MCO, ADP) rarely get cheap — they hold up in selloffs precisely because their moats have no current threat. When a "monopoly" IS cheap, first assume the market is pricing a real problem, then prove it isn't before buying. **Cash is a position.** Do not force a buy just because a screen shows low RSI. Rejecting three value traps is worth more than deploying into one.

### What We Don't Do

- Don't trade momentum or hype (no NVDA, no meme stocks)
- Don't try to time the market — time individual stock entries
- Don't panic sell on price drops if the thesis (moat + ROCE) is intact
- Don't chase stocks above RSI 60 or above the middle of their box range
- **Don't buy a dip on RSI alone** — run the "Cheap for a Reason" filter first
- **Don't trust a cheap price if OCF/Net Income is weak** — earnings not backed by cash is a value-trap signal, not a bargain
- **Don't confuse a multi-year downtrend with a dip** — lower highs for 1-2 years = the market knows something
- **Don't force cash deployment** — if nothing passes the full filter, hold cash and wait

### Portfolio Sectors

| Sector | Purpose |
|--------|---------|
| Darwin完全过关 | 25 stocks passing all Kill List criteria — the buy universe |
| Monopoly | 28 monopoly/duopoly businesses tracked for quality screening |
| Fidelity | 11 actual IRA holdings — the real portfolio |
| SP500 Top | 10 highest-quality S&P 500 picks |
| Consideration | 38 general watchlist |

---

## Key Design Decisions

1. **Heavy computed properties** — Financial ratios calculated on-the-fly from raw stored data
2. **Denormalized fields** — Critical hot-path fields (`d_last_lower`, `d_pe`, etc.) cached in DB columns for 10ms ranking queries
3. **User data isolation** — All queries scoped through sector → stock ownership
4. **Human-friendly metrics** — `last_lower` / `last_better` convert price drops to time-based measures ("lost 30 days of ground")
5. **Parallel Celery tasks** — `group()` for daily fetches (~40s vs 30+ min sequential)
6. **Materialized ranking cache** — Pre-computed rankings stored in `RankingCache`, rebuilt every 6 hours

---

## Environment Variables

See `.env.example`:
```
DJANGO_DEBUG=1
MYSQL_DATABASE=stock
DJANGO_DB_USER=...
DJANGO_DB_PWD=...
DJANGO_DB_HOST=db
DJANGO_DB_PORT=3306
DJANGO_REDIS_HOST=redis
DJANGO_SECRET_KEY=...
DJANGO_SUPERUSER_USERNAME=...
DJANGO_SUPERUSER_PASSWORD=...
DJANGO_SUPERUSER_EMAIL=...
```

---

## Ports

| Service | Host Port | Internal |
|---------|-----------|----------|
| Frontend (SPA) | 8084 | 80 |
| Backend API (nginx) | 8083 | 80 |
| MySQL | 3306 | 3306 |
| Django dev server | — | 8001 |
| Redis | — | 6379 |
