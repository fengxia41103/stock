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
