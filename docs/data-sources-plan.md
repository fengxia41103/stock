# Data Sources Expansion Plan

## Overview

Add three free data sources to enrich stock analysis beyond Yahoo Finance:

1. **SEC EDGAR** — Authoritative US filings, insider trades, institutional holdings
2. **FRED** — Federal Reserve macroeconomic indicators
3. **Alpha Vantage** — Earnings calendar, consensus estimates, pre-computed technicals

## Architecture Principle

Each data source follows the existing `StatementWorker` pattern:
- One worker class per data type
- Celery task wrapping the worker
- Django model storing the fetched data
- DRF serializer + viewset exposing the data
- Frontend view consuming and displaying it

## Implementation Phases

| Phase | Scope | Steps |
|-------|-------|-------|
| 5.1 | SEC EDGAR: Insider Trades | Model + Worker + API + Frontend tab |
| 5.2 | SEC EDGAR: Institutional Holdings (13F) | Model + Worker + API + Frontend tab |
| 5.3 | FRED: Macro Indicators | Model + Worker + API + Dashboard overlay |
| 5.4 | Alpha Vantage: Earnings Calendar | Model + Worker + API + Frontend indicator |
| 5.5 | Analysis: Insider Sentiment Score | Computed property + ranking integration |
| 5.6 | Analysis: Macro Correlation | Stock vs. macro correlation stats |
| 5.7 | Analysis: Earnings Surprise Impact | Pre/post earnings price reaction |
| 5.8 | Frontend: New "Ownership" detail tab | Combine insider + 13F into one view |
| 5.9 | Frontend: Macro Overlay on price charts | FRED series overlaid on stock price |
| 5.10 | Frontend: Earnings markers on price chart | Vertical lines on earnings dates |

## Detailed Plans

- [Step 5.1–5.2: SEC EDGAR](data-sources-plan-sec-edgar.md)
- [Step 5.3: FRED](data-sources-plan-fred.md)
- [Step 5.4: Alpha Vantage](data-sources-plan-alpha-vantage.md)
- [Step 5.5–5.10: Analysis & Frontend](data-sources-plan-analysis.md)

## New Dependencies

```
# backend/requirements.txt additions
sec-edgar-downloader>=5.0.0    # SEC EDGAR filings
fredapi>=0.5.2                 # FRED economic data
alpha-vantage>=3.0.0           # Alpha Vantage API (or raw requests)
```

## Environment Variables

```
# .env additions
SEC_EDGAR_USER_AGENT=MyStockApp/1.0 (your-email@example.com)
FRED_API_KEY=<free key from https://fred.stlouisfed.org/docs/api/api_key.html>
ALPHA_VANTAGE_API_KEY=<free key from https://www.alphavantage.co/support/#api-key>
```

## New Celery Queues

| Queue | Tasks | Rate Limit |
|-------|-------|------------|
| `edgar` | Insider trades, 13F holdings | 10 req/sec (SEC limit) |
| `macro` | FRED series fetch | No limit (generous) |
| `alpha` | Earnings, technicals | 5 req/min (free tier: 25/day) |

## Scheduling

| Task | Schedule | Rationale |
|------|----------|-----------|
| `insider_daily()` | Daily 6 AM ET | Form 4 filed within 2 business days of trade |
| `holdings_quarterly()` | Every 45 days | 13F due 45 days after quarter end |
| `fred_weekly()` | Weekly Sunday | Macro data updates weekly/monthly |
| `earnings_daily()` | Daily 7 AM ET | Calendar changes as companies announce dates |
