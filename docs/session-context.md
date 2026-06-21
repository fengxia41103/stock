# Session Context — Resume File

## Current State (2026-06-21 16:16 ET)

### Branch
- **Active branch**: `feat-step-5.1-sec-insider-trades`
- **Base branch**: `feat-stock-skills`
- **8 commits** on this branch, all pushed to origin

### Commits on this branch
```
7a1cb6d feat: show full company name in stock detail header
a70ca27 feat: add earnings impact computation and macro correlation (Steps 5.6, 5.7)
7a7e0c2 feat: add insider sentiment, earnings beat rate, macro overlay (Steps 5.5, 5.9)
c3efb2b feat: add Earnings view under Valuation tab (Step 5.10 partial)
24af638 feat: add SEC EDGAR institutional holdings (Step 5.2)
8e13034 docs: add data sources expansion plan (SEC EDGAR, FRED, Alpha Vantage)
c5a24d8 feat: add FRED macro data and Alpha Vantage earnings (Steps 5.3, 5.4)
14f8875 feat: add SEC EDGAR insider trades (Step 5.1)
```

### What was done this session

1. **Added 24 "Darwin完全过关" stocks** to the app (from `纳指Top20标普Top30基本面及箱体操作分析.md`)
   - Created sector "Darwin完全过关" with 24 stocks
   - 16 new stocks created, 8 existing linked

2. **Implemented all 10 data source steps (5.1–5.10)**:
   - 5.1: SEC EDGAR Insider Trades (model + worker + API + frontend)
   - 5.2: SEC EDGAR Institutional Holdings (model + worker + API + frontend)
   - 5.3: FRED Macro Indicators (model + worker + API) — **LIVE with data**
   - 5.4: Alpha Vantage Earnings (model + worker + API) — **LIVE with data**
   - 5.5: Insider sentiment property on MyStock
   - 5.6: Macro correlation management command
   - 5.7: Earnings price impact computation
   - 5.8: Ownership tab (insider + institutional sub-views)
   - 5.9: Macro Overlay on price charts (dual Y-axis, checkbox controls)
   - 5.10: Earnings View (beat rate, surprise chart, upcoming alert)

3. **Stock detail header** changed to H1 with full company name: "KLA Corporation (KLAC)"

4. **Created plan docs** in `/docs/`:
   - `data-sources-plan.md` (master overview)
   - `data-sources-plan-sec-edgar.md`
   - `data-sources-plan-fred.md`
   - `data-sources-plan-alpha-vantage.md`
   - `data-sources-plan-analysis.md`

### Data Status
- **FRED**: 17 series, 2,942 data points (10Y Treasury latest: 4.49% on 2026-06-17)
- **Alpha Vantage**: 31 upcoming earnings events fetched
- **SEC EDGAR Insider Trades**: 256 trades for MSFT/AAPL/V/GOOGL
- **SEC EDGAR Holdings**: Worker ready but not yet run (quarterly)

### Environment (dotenv-local)
```
FRED_API_KEY=40cf1911a0a8ec03410ba374f481b207
ALPHA_VANTAGE_API_KEY=<set, working>
SEC_EDGAR_USER_AGENT=StockApp/1.0 (dev@example.com)  # implicit default in code
```

### New API Endpoints
| Endpoint | Status |
|----------|--------|
| `/api/v1/insider-trades/?stock={id}` | ✅ Live |
| `/api/v1/holdings/?stock={id}` | ✅ Live (empty until quarterly fetch) |
| `/api/v1/macro-series/` | ✅ Live with 17 series |
| `/api/v1/macro-data/?series_id=DGS10` | ✅ Live with 2942 points |
| `/api/v1/earnings/?stock={id}` | ✅ Live with 31 events |
| `/api/v1/earnings/upcoming/` | ✅ Live |

### New Frontend Views
- **Valuation → Earnings**: Beat rate, EPS surprise bar chart, upcoming alert
- **Ownership → Insider Trades**: Sentiment gauge, buy/sell timeline, cluster buy alert
- **Ownership → Institutional**: Top holders pie chart, holdings table
- **Price & Trends → Daily Prices**: Macro Overlay section at bottom (checkbox to overlay FRED series)

### New Celery Schedules
| Task | Schedule |
|------|----------|
| `insider_daily` | Daily 6AM |
| `fred_weekly` | Sunday 6AM |
| `earnings_calendar_daily` | Daily 7AM |
| `rebuild_ranking_cache` | Every 6 hours |

### New Models (4 migrations: 0047–0051)
- `InsiderTrade` — SEC Form 4 data
- `MacroSeries` + `MacroDataPoint` — FRED economic series
- `EarningsEvent` — Alpha Vantage earnings calendar/surprise
- `InstitutionalHolding` — SEC 13F holdings
- `MyStock.name` field added (populated from Yahoo)

### Tests
- 19 backend tests passing
- Frontend builds clean (vite)
- All endpoints return 200

### What's NOT done yet (from upgrade-plan.md)
- Step 4.x items (Phase 4 from upgrade plan) — dead code removal, test expansion, etc.
- Earnings price impact stored in DB (currently just computed/logged)
- Macro correlation stored in DB (currently management command only)
- Dashboard widgets (MacroWidget, UpcomingEarningsWidget on TodayDashboardView)
- Earnings markers on price chart (vertical lines at earnings dates)

### Auth Token for Testing
```
Token: 72b2fc70c676c67ba611f863c3b1dffcf8cab5ec
User: fengxia
```

### Key File Locations
- Backend models: `backend/stock/models/`
- Workers: `backend/stock/workers/`
- Tasks: `backend/stock/tasks.py`
- API: `backend/stock/api/{views,serializers,urls}.py`
- Frontend routes: `frontend/src/routes.jsx`
- Stock detail view: `frontend/src/views/stock/StockDetailView/index.jsx`
- API hooks: `frontend/src/api/hooks.ts`
- Plan docs: `docs/data-sources-plan*.md`
