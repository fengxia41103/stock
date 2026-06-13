# Data Pipeline

## Overview

The data pipeline fetches stock market data from Yahoo Finance using background Celery workers. Data is fetched both on-demand (when a user adds/updates a stock) and on a schedule (periodic tasks).

## Celery Configuration

- **Broker**: Redis
- **Result Backend**: django-db (django-celery-results)
- **Serialization**: JSON
- **Queues**: `price`, `summary`, `statement`, `news`
- **Rate Limiting**: 12 requests/minute on statement queue tasks

## Workers

### MyStockHistoricalYahoo (`get_historical.py`)
- **Queue**: `price`
- **Library**: `yfinance`
- **Fetches**: Full price history (max period) — OHLCV data
- **Storage**: Bulk creates `MyStockHistorical` records (batch size 1000)
- **Deduplication**: Uses `ignore_conflicts=True` on bulk_create

### MySummary (`get_summary.py`)
- **Queue**: `summary`
- **Library**: `yahooquery`
- **Fetches**: ROA, ROE, beta, institutional ownership, shares outstanding, profit margin
- **Storage**: Updates `MyStock` fields directly

### MyBalanceSheet (`get_balance_sheet.py`)
- **Queue**: `statement`
- **Library**: `yahooquery`
- **Fetches**: Quarterly balance sheet (56 mapped fields)
- **Storage**: Creates `BalanceSheet` records, converts large numbers to billions

### MyIncomeStatement (`get_income_statement.py`)
- **Queue**: `statement`
- **Library**: `yahooquery`
- **Fetches**: Quarterly income statements (31 mapped fields)
- **Storage**: Creates `IncomeStatement` records

### MyCashFlowStatement (`get_cash_flow_statement.py`)
- **Queue**: `statement`
- **Library**: `yahooquery`
- **Fetches**: Quarterly cash flow (23 mapped fields)
- **Storage**: Creates `CashFlow` records

### MyValuationRatio (`get_valuation_ratio.py`)
- **Queue**: `summary`
- **Library**: `yahooquery`
- **Fetches**: PE, PB, PEG, PS, Forward PE
- **Storage**: Creates `ValuationRatio` records, deletes all-zero records

### MyNewsWorker (`get_news.py`)
- **Queue**: `news`
- **Library**: `newscatcher`
- **Fetches**: News articles by topic (news, economics, finance, business, politics, tech, science, world)
- **Storage**: Creates `MyNews` records
- **Status**: Currently disabled in periodic tasks

## Task Orchestration

### On-Demand: `batch_update_helper(user, symbol)`

Triggered when a user adds or updates a stock. Creates two parallel Celery chains:

```
Chain 1 (price):    yahoo_consumer(symbol) → summary_consumer(symbol)
Chain 2 (statement): balance_sheet(symbol) → income(symbol) → cash_flow(symbol) → valuation_ratio(symbol)
```

Both chains run independently via `apply_async()`. Each chain's root task ID is saved as a `MyTask` for tracking.

### Periodic Tasks (`setup_periodic_tasks`)

| Task | Schedule | Queue |
|------|----------|-------|
| `price_daily` | Every 600 seconds (10 min) | price |
| `statement_daily` | Daily at midnight (crontab 0:00) | statement |
| `get_news` | Disabled (was every 5 min) | news |
| `remove_old_news` | Disabled (was hourly) | news |

## Task Lifecycle

1. `batch_update_helper` creates `MyTask` with UUID and initial state
2. Celery executes the chain, creating `TaskResult` on completion
3. Django signal `on_new_task_result` fires on TaskResult save:
   - Links `TaskResult` to `MyTask` (by matching task_id)
   - Updates `MyTask.state` to result status
   - On SUCCESS: deletes `TaskResult` (cascade deletes `MyTask`)
4. Frontend polls `/api/v1/tasks/` to show progress via `TaskNotificationIcon`

## Error Handling

- Workers silently handle missing data (stock not found, API errors)
- Rate limiting (`rate_limit="12/m"`) prevents Yahoo Finance throttling
- Statement tasks are chained sequentially to manage API load
- No retry configuration (failed tasks simply fail)

## Data Freshness

| Data Type | Refresh Rate | Latency |
|-----------|-------------|---------|
| Price (OHLCV) | Every 10 minutes | Near real-time during market hours |
| Summary (ROE, beta) | On stock add/update | On-demand |
| Financial statements | Daily at midnight | Up to 24 hours |
| Valuation ratios | Daily at midnight | Up to 24 hours |
