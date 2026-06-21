# Stock App — Upgrade Plan

## DevOps Workflow

```
1. git checkout feat-ai-revive-this-stack && git pull origin feat-ai-revive-this-stack
2. git checkout -b feat-step-<id>-<short-description>
3. Implement changes, commit incrementally using conventional commits
4. Run functional regression tests (all API endpoints, data integrity, frontend rendering)
5. Report regression results — all must pass before proceeding
6. PAUSE — ask human to confirm
7. git push -u origin feat-step-<id>-<short-description>
8. Create PR targeting feat-ai-revive-this-stack, merge with rebase
9. git checkout feat-ai-revive-this-stack && git pull origin feat-ai-revive-this-stack
10. Continue to next step
```

---

## Completed Work

### Phase 1 (All 11 steps ✅)

| Step | What was done |
|------|---------------|
| 1.1 | Trailing-slash interceptor + DRF response normalization |
| 1.2 | moment.js → dayjs (immutable, no mutation bugs) |
| 1.3 | DRF pagination (200/page, 62k historicals bounded) |
| 1.4 | Denormalize computed properties into DB columns (**rankings 10s → 10ms**) |
| 1.5 | Fan out Celery tasks with `group` (parallel, isolated failures) |
| 1.6 | Django Redis cache layer |
| 1.7 | Consolidate 4 workers into StatementWorker base class |
| 1.8 | Replace react-sparklines + react-gauge-chart with ECharts; rewrite TechIndicatorView |
| 1.9 | Rewrite Get/PollResource internals to use react-query |
| 1.10 | pytest + factory-boy + 9 API tests; fix signals.py deprecated save() |
| 1.11 | Remove @mui/styles (makeStyles → sx prop); fix layout overlap |

### Phase 2 (8 of 10 steps ✅)

| Step | What was done |
|------|---------------|
| 2.1 | Composite indexes on (stock, on) for all statement models |
| 2.2 | Materialized ranking cache with rebuild_rankings command |
| 2.3 | drf-spectacular OpenAPI schema + Swagger UI; TypeScript config |
| 2.4 | Split storybook lib into charts/layout/display modules |
| 2.5 | Lazy-load all routes (66 JS chunks, code-split by view) |
| 2.6 | Dark mode toggle with localStorage persistence; y-axis scaling fix |
| 2.8 | Split heavy endpoints: /stocks/{id}/dupont/, /nav/, /cross-statements/ |
| 2.10 | Gzip compression on both nginx proxies |

### Phase 3 (3 of 10 steps ✅)

| Step | What was done |
|------|---------------|
| 3.1 | Migrate API layer to TypeScript (client.ts, hooks.ts with generics) |
| 3.2 | Decouple user provisioning into services.py with skip_fetch |
| 3.4 | Vendor chunk splitting (React 22kB, MUI 155kB, ECharts 350kB gzipped) |

### Phase 4 (All 12 steps ✅)

| Step | What was done |
|------|---------------|
| 4.1 | Remove dead code (models_old, api_old, craco, selenium, emacs backups) |
| 4.2 | Auto-update denormalized fields in __price_single and __statement_single |
| 4.3 | Expand tests 9 → 34 (insider trades, macro, earnings, holdings, auth) |
| 4.4 | Fix ListStockCard crash (missing Box import) |
| 4.5 | ECharts dark mode sync via useChartTheme hook |
| 4.6 | CardSkeleton / PageSkeleton loading components |
| 4.7 | Data freshness: last_price_date, stale chip, price in header |
| 4.8 | Historical worker cleanup (dead code removed) |
| 4.9 | Per-section SectionErrorBoundary wrapping all route groups |
| 4.10 | Celery beat: rebuild_ranking_cache every 6 hours |
| 4.11 | Makefile with test/build/dev/fetch-fred/fetch-earnings targets |
| 4.12 | DictTable: SVG sparklines per row + "Show % Change" toggle |

### Phase 5 — Data Sources (All 10 steps ✅)

| Step | What was done |
|------|---------------|
| 5.1 | SEC EDGAR Insider Trades (model + worker + API + frontend) |
| 5.2 | SEC EDGAR Institutional Holdings 13F (model + worker + API + frontend) |
| 5.3 | FRED Macro Indicators (17 series, 2942 data points live) |
| 5.4 | Alpha Vantage Earnings Calendar (31 upcoming events live) |
| 5.5 | Insider sentiment score + earnings beat rate properties |
| 5.6 | Macro correlation management command |
| 5.7 | Earnings price impact computation |
| 5.8 | Ownership tab (Insider Trades + Institutional views) |
| 5.9 | Macro Overlay on price charts (dual Y-axis, checkbox FRED series) |
| 5.10 | Earnings View + earnings date chips on price chart + dashboard widgets |

### Skipped / Deferred

| Step | Reason |
|------|--------|
| 2.7 (lodash removal) | Tree-shakes well with 66 chunks; 57 files = high breakage risk |
| 2.9 (Playwright E2E) | Requires browser environment setup |
| 3.3 (Feature folders) | Cosmetic restructure, ~80 file moves, zero functional gain |

---

## Key Metrics Achieved

| Metric | Before | After |
|--------|--------|-------|
| Rankings API latency | 10+ seconds | **10ms** |
| Unfiltered /historicals/ | 504 timeout | 200 (paginated) |
| JS chunks | 1 monolithic (7MB) | 72 chunks (284kB initial gzipped) |
| moment.js mutations | Infinite render loops | Zero (dayjs immutable) |
| @mui/styles (JSS) | 10 files | Zero |
| Backend test coverage | 0 | **34 tests passing** |
| Chart libraries | 4 (mixed) | 1 (ECharts only) |
| Data fetch patterns | 2 (Get + hooks) | 1 (react-query everywhere) |
| Celery daily tasks | Sequential (30+ min) | Parallel (~40s) |
| Data sources | 1 (Yahoo) | **4 (Yahoo + SEC + FRED + Alpha Vantage)** |
| Insider trades | 0 | 2,723 |
| Macro indicators | 0 | 17 series, 2,942 points |
| Earnings events | 0 | 31 upcoming |
| API endpoints | 12 | **20** |
| Frontend sections per stock | 4 | **6 (+ Ownership, + Earnings)** |

---

## Recommended Next Steps (Internal, No External Services)

### Priority 1 — High Impact

#### A. Backfill historical earnings surprise data

Currently only upcoming earnings are fetched (calendar). Need to run `earnings_surprise_batch` for each stock to get historical beat/miss data for the EarningsView and beat rate calculations.

```bash
make fetch-earnings  # calendar only
# Then per-stock (uses 1 API call each, 25/day free limit):
docker compose exec web python manage.py shell -c "
from stock.tasks import earnings_surprise_batch
earnings_surprise_batch()
"
```

#### B. Populate institutional holdings

Run the quarterly 13F fetch:
```bash
docker compose exec web python manage.py shell -c "
from stock.tasks import holdings_quarterly
holdings_quarterly()
"
```

#### C. Store earnings price impact in DB

Currently `compute_earnings_impact` just logs. Add `EarningsPriceImpact` model to store gap%, 1d/5d reaction, volume ratio — then display in EarningsView.

#### D. Store macro correlations in DB

Currently `compute_macro_correlations` is a management command. Add `StockMacroCorrelation` model and display as a heatmap in sector view.

### Priority 2 — Nice to Have

#### E. Add "Refresh Data" button per stock in stock list

Currently only available in stock detail settings menu. Add a small refresh icon on each stock card.

#### F. Earnings markers as vertical lines on ECharts price chart

Currently showing as chips below the chart. Could integrate directly into the ECharts `markLine` config for a more visual experience.

#### G. Mobile responsiveness audit

Test all views on mobile viewport. The MUI Grid system handles most cases but some tables may overflow.

#### H. Sector-level macro correlation heatmap

After macro correlations are stored in DB, show a color-coded heatmap per sector showing which stocks are rate-sensitive vs inflation-benefiting.

#### I. Weekly email digest

Celery task that compiles: top movers, upcoming earnings, insider cluster buys, stale stocks → sends email summary.

### Priority 3 — Infrastructure

#### J. Upgrade to Django 5.2 + Python 3.12

Current: Django 5.1 + Python 3.11. Minor version bump.

#### K. Add health check endpoints

`/api/v1/health/` returning DB connectivity + Redis connectivity + Celery worker status.

#### L. Prometheus metrics

Add `django-prometheus` for request latency, DB query counts, Celery task durations.

#### M. Backup MySQL to S3

Nightly `mysqldump` → compressed → uploaded to S3 bucket.
