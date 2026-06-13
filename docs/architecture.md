# Architecture Overview

## System Summary

A containerized Django + React web application for stock market data analysis using Yahoo Finance API data. The system fetches, stores, and analyzes stock financial data, providing human-friendly insights such as "last time I saw a price lower than this was 30 days ago."

## High-Level Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────┐
│  React SPA  │────▶│ Nginx Proxy  │────▶│  Django/Gunicorn │────▶│  MySQL  │
│  (Port 8084)│     │  (Port 8083) │     │  (Tastypie API)  │     │  (3306) │
└─────────────┘     └──────────────┘     └─────────────────┘     └─────────┘
                                                │
                                                │ Celery tasks
                                                ▼
                                         ┌─────────────┐
                                         │    Redis     │
                                         │   (Broker)   │
                                         └─────────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │   Celery     │
                                         │   Worker     │
                                         └─────────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │ Yahoo Finance│
                                         │     API      │
                                         └─────────────┘
```

## Technology Stack

### Frontend
- React 18.2 (create-react-app via craco)
- Material UI 5
- react-router-dom v6 (createBrowserRouter)
- ECharts + react-stockcharts for charting
- restful-react for HTTP
- react-hook-form for forms
- jstat for statistical computations
- Multi-stage Docker build → nginx static serving

### Backend
- Django 4.2+ with django-tastypie REST API
- MySQL 9.7 database
- Celery 5.3+ with Redis broker
- django-celery-results (DB-backed result storage)
- Gunicorn WSGI server
- yfinance + yahooquery for Yahoo Finance data
- Python 3.8

### Infrastructure
- Docker Compose for local development
- Kubernetes (Helm charts) for production
- Nginx reverse proxy with CORS + WebSocket support
- Harbor private registry for container images

## Network Topology (Docker Compose)

```
┌─── management network ────────────────────────────┐
│                                                    │
│  frontend (8084:80)  backend-proxy (8083:80)  web  │
│                                                    │
└────────────────────────────────────────────────────┘

┌─── data network ──────────────────────────────────┐
│                                                    │
│  db (3306)    redis    web    celery               │
│                                                    │
└────────────────────────────────────────────────────┘
```

Six Docker Compose services:
1. `db` — MySQL 9.7 with persistent volume
2. `redis` — Celery message broker
3. `web` — Django/Gunicorn (shared config via YAML anchor `x-django-base`)
4. `celery` — Worker processing queues: summary, stock, statement, price, news
5. `backend-proxy` — Nginx reverse proxy (port 8083)
6. `frontend` — React SPA served by nginx (port 8084)

## Authentication Flow

1. User registers via `POST /api/v1/users/`
2. User logs in via `POST /api/v1/auth/login/` → receives API key
3. All subsequent requests include API key in header (ApiKeyAuthentication)
4. Authorization: Django's permission system (DjangoAuthorization)
5. New user signal auto-provisions: permissions, "demo" sector, sample stocks (AAPL, MSFT, AMZN, TSLA, MCD), sample diary entries

## Data Flow

### On-Demand (User adds a stock)

1. User creates stock → `StockResource.obj_create`
2. `batch_update_helper` dispatches two Celery chains:
   - **Chain 1** (price queue): historical prices → summary (ROA/ROE/beta)
   - **Chain 2** (statement queue): balance sheet → income → cash flow → valuation ratios
3. `MyTask` records created to track progress
4. Signal `on_new_task_result` links `TaskResult` to `MyTask`, deletes on SUCCESS

### Periodic (Scheduled)

- Every 10 minutes: `price_daily()` fetches prices for all stocks
- Daily at midnight: `statement_daily()` refreshes all financial statements

## Deployment

### Local Development
All services via `docker-compose up` with `dotenv-local` environment variables.

### Kubernetes Production
- Backend: 1 replica, Secret+ConfigMap for DB/Redis, Ingress at `mystock.backend.feng.local`
- Frontend: 3 replicas, nginx ConfigMap for SPA routing, Ingress at `mystock.feng.local`
- Helm charts: `helm-stock-backend-api`, `helm-stock-backend-celery`, frontend helm chart
- Images from private Harbor registry (`harbor.feng.local:9800/library/`)

## CI/CD

- GitHub Actions workflow: Prettier auto-formatting on push (frontend/src)
- Husky pre-commit hooks: lint-staged for frontend
- commitlint enforcing conventional commits
- standard-version for changelog generation
