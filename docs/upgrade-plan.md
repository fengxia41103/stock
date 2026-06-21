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

### Skipped / Deferred

| Step | Reason |
|------|--------|
| 2.7 (lodash removal) | Minimal bundle impact with 66 code-split chunks |
| 2.9 (Playwright E2E) | Requires browser environment setup |
| 3.3 (Feature folders) | Cosmetic restructure, high risk of import breakage |

---

## Key Metrics Achieved

| Metric | Before | After |
|--------|--------|-------|
| Rankings API latency | 10+ seconds | **10ms** |
| Unfiltered /historicals/ | 504 timeout | 200 (paginated) |
| JS chunks | 1 monolithic (7MB) | 66 chunks (284kB initial gzipped) |
| moment.js mutations | Infinite render loops | Zero (dayjs immutable) |
| @mui/styles (JSS) | 10 files | Zero |
| Backend test coverage | 0 | 9 tests passing |
| Chart libraries | 4 (mixed) | 1 (ECharts only) |
| Data fetch patterns | 2 (Get + hooks) | 1 (react-query everywhere) |
| Celery daily tasks | Sequential (30+ min) | Parallel (~40s) |

---

## Recommended Next Steps (Internal, No External Services)

These improvements require no external products (no Sentry, no AWS, no Playwright browser). They improve code quality, correctness, and developer experience using only what's already in the stack.

### Priority 1 — High Impact, Low Risk

#### A. Expand backend test coverage (target: 30+ tests)

Current: 9 tests covering basic CRUD and rankings. Missing:
- [ ] Test stock creation triggers Celery tasks (mock celery)
- [ ] Test balance/income/cash serializer computed fields return correct values
- [ ] Test pagination: page_size, next/previous links
- [ ] Test date range filtering on historicals
- [ ] Test ranking cache: rebuild command populates correctly
- [ ] Test user provisioning service with skip_fetch=True and False
- [ ] Test authentication: invalid token returns 401, registration works
- [ ] Test backfill_computed_fields management command

#### B. Fix remaining frontend runtime crashes

Known issues from browsing:
- [ ] `/stocks/{id}/historical/return/24hr` — verify all return views load after guard fix
- [ ] Audit all views that use `useContext(StockHistoricalContext)` — add guards
- [ ] Audit `DropdownMenu` usage: TopBar passes `title`/`content`, verify rendered correctly
- [ ] Test all stock detail sub-views: summary, dupont, dcf, nav, ratios

#### C. Update denormalized fields on data refresh

Currently `backfill_computed_fields` is manual. Should run automatically:
- [ ] After `price_daily()` completes: recompute d_last_lower, d_last_better for latest records
- [ ] After `statement_daily()` completes: update d_pe, d_pb, d_ps on MyStock
- [ ] Add post-task hook in `__price_single` and `__statement_single` to update denormalized fields
- [ ] Rebuild ranking cache after daily refresh completes

#### D. Remove dead code and unused dependencies

- [ ] Delete `backend/stock/models_old.py` (56k lines, unused)
- [ ] Delete `backend/stock/api_old.py` (30k lines, unused)
- [ ] Delete `frontend/routes.js` (old CRA routes file, unused)
- [ ] Delete `frontend/craco.config.js` (unused, migrated to vite)
- [ ] Remove `clsx` from package.json (no longer imported)
- [ ] Remove `d3-format`, `d3-time-format` (only used by deleted react-stockcharts)
- [ ] Remove `selenium` from backend requirements (unused)
- [ ] Clean up emacs backup files (`#...#`, `~` files)

### Priority 2 — Medium Impact

#### E. Improve ECharts wrapper components

- [ ] Add `loading` prop to HighchartGraph (show ECharts loading animation while data fetches)
- [ ] Add theme sync: read MUI theme mode and apply matching ECharts dark/light theme
- [ ] Improve bubble chart tooltip formatting (show actual field labels, not just x/y/z)
- [ ] Add export-to-image button on all charts (ECharts `toolbox.feature.saveAsImage`)

#### F. Improve API error handling

- [ ] Backend: add proper error responses (400 with field errors, not 500)
- [ ] Frontend: show toast/snackbar on mutation errors (create stock, add sector)
- [ ] Frontend: retry failed queries with exponential backoff (react-query config)
- [ ] Add loading skeletons for card layouts (MUI Skeleton matching card shape)

#### G. Improve data freshness UX

- [ ] Show "last updated" timestamp on dashboard (from latest historical record date)
- [ ] Add "Refresh Data" button per stock that triggers `batch_update_helper`
- [ ] Show stale data indicator if latest price is > 1 day old
- [ ] Frontend: invalidate react-query cache after stock update

#### H. Consolidate the historical worker

The `get_historical.py` worker has dead code (`parser_old`, unused handler):
- [ ] Remove `parser_old()` method (~80 lines dead code)
- [ ] Remove `handler`/`agent` constructor params (unused)
- [ ] After historical ingestion, recompute denormalized fields for affected records
- [ ] Add `post_save` logic to update MyStock.d_last_lower/d_last_better

### Priority 3 — Nice to Have

#### I. Add frontend error boundary per route section

- [ ] Wrap each route section (stock, sector, dashboard) in separate ErrorBoundary
- [ ] Show "Something went wrong in [section]" with retry button
- [ ] Currently one global ErrorBoundary — a crash in any view kills the whole app

#### J. Improve the DictTable financial statement display

- [ ] Add column sorting (click header to sort by date)
- [ ] Highlight negative values in red
- [ ] Add sparkline per metric row showing trend
- [ ] Allow toggling between "absolute" and "% change" views

#### K. Add Celery beat schedule for ranking cache

- [ ] Add periodic task: rebuild rankings every 6 hours
- [ ] Add periodic task: recompute denormalized stock fields after market close (4:30 PM ET)
- [ ] Log timing of each rebuild for monitoring

#### L. Improve developer experience

- [ ] Add `docker compose` profiles: `dev` (with vite HMR) vs `prod` (nginx static)
- [ ] Create `Makefile` with common commands: `make test`, `make build`, `make backfill`
- [ ] Add `.env.example` with documented variables
- [ ] Document the vite dev server workflow in README

---

## Implementation Steps

Each step follows the DevOps workflow: branch → implement → regression test → confirm → push → merge → pull.

---

### Step 4.1 — Remove dead code and unused dependencies

Branch: `feat-step-4.1-remove-dead-code`

- [ ] Delete `backend/stock/models_old.py`
- [ ] Delete `backend/stock/api_old.py`
- [ ] Delete `frontend/routes.js` (old CRA routes)
- [ ] Delete `frontend/craco.config.js`
- [ ] Remove from `frontend/package.json`: `clsx`, `d3-format`, `d3-time-format`
- [ ] Remove from `backend/requirements.txt`: `selenium`
- [ ] Delete emacs backup files: `find . -name "*~" -o -name "#*#" | xargs rm`
- [ ] Verify: `docker compose build frontend` succeeds
- [ ] Verify: all API endpoints return 200
- [ ] Verify: SPA loads

---

### Step 4.2 — Auto-update denormalized fields after daily refresh

Branch: `feat-step-4.2-auto-denorm-refresh`

- [ ] In `tasks.py`: add `__update_stock_denorm(symbol)` task that recomputes d_pe, d_pb, d_ps, d_last_lower, d_last_better on MyStock
- [ ] In `__price_single`: after historical ingestion, recompute d_last_lower, d_last_better, d_vol_over_share_outstanding for the latest 5 records
- [ ] In `__statement_single`: after statement ingestion, call `__update_stock_denorm`
- [ ] Add Celery beat: rebuild ranking cache every 6 hours
- [ ] Verify: trigger price_daily, check denormalized fields updated
- [ ] Verify: ranking cache has fresh `computed_at` timestamp

---

### Step 4.3 — Expand backend test coverage

Branch: `feat-step-4.3-expand-tests`

- [ ] Test stock creation + provisioning (mock Celery)
- [ ] Test pagination: historicals return `{count, results}`, page_size ≤ 200
- [ ] Test date range filter: `on__range` returns correct subset
- [ ] Test authentication: no token → 401, bad token → 401
- [ ] Test registration: creates user + token
- [ ] Test ranking cache: after rebuild_rankings, cache has 5 entries
- [ ] Test backfill_computed_fields: after run, d_last_lower is not None
- [ ] Test new endpoints: /stocks/{id}/dupont/, /nav/, /cross-statements/ return 200
- [ ] Verify: `pytest` passes with ≥ 17 tests

---

### Step 4.4 — Fix remaining frontend runtime crashes

Branch: `feat-step-4.4-fix-frontend-crashes`

- [ ] Audit all `useContext(StockHistoricalContext)` usages — add `if (!Array.isArray(data) || data.length < 2) return null` guard
- [ ] Audit all `useContext(StockDetailContext)` usages — add null guard
- [ ] Test pages: `/stocks/1/historical/price`, `/stocks/1/historical/return/24hr`, `/stocks/1/historical/return/daily`, `/stocks/1/historical/return/overnight`
- [ ] Test pages: `/stocks/1/balance`, `/stocks/1/income`, `/stocks/1/cash`
- [ ] Test pages: `/stocks/1/dupont`, `/stocks/1/ratios`, `/stocks/1/nav`
- [ ] Fix any crash found — commit per fix
- [ ] Verify: navigate all stock detail sub-views without white screen

---

### Step 4.5 — Sync ECharts theme with dark mode

Branch: `feat-step-4.5-echarts-dark-theme`

- [ ] In `src/lib/storybook/index.jsx`: import `useTheme` from MUI
- [ ] Pass `theme: mode === "dark" ? "dark" : undefined` to all `ReactEChartsCore` instances
- [ ] Alternatively: wrap in a `useChartTheme()` hook that returns ECharts theme name based on MUI palette mode
- [ ] Verify: toggle dark mode → charts have dark background and light text
- [ ] Verify: light mode charts unchanged

---

### Step 4.6 — Add loading skeletons and error toasts

Branch: `feat-step-4.6-loading-skeletons`

- [ ] Create `src/components/common/CardSkeleton/index.jsx` — MUI Skeleton matching card layout
- [ ] Update `Get` component: replace `ScaleLoader` with context-appropriate skeleton
- [ ] Add `react-hot-toast` or MUI Snackbar wrapper for mutation errors
- [ ] In `StockLinkToSector`: show toast on sector add/remove success/failure
- [ ] In `AddNewStockDialog`: show toast on stock creation success/failure
- [ ] Verify: loading states show skeleton shapes, mutations show feedback

---

### Step 4.7 — Improve data freshness UX

Branch: `feat-step-4.7-data-freshness`

- [ ] Add "Last updated: {date}" to dashboard header (from latest historical record)
- [ ] Add "Refresh" icon button on StockDetailView that triggers PATCH /stocks/{id}/
- [ ] After refresh, invalidate react-query cache for that stock's data
- [ ] Show stale indicator (yellow dot) if latest price > 1 trading day old
- [ ] Verify: clicking refresh triggers task, new data appears after ~10s

---

### Step 4.8 — Clean up historical worker

Branch: `feat-step-4.8-cleanup-historical-worker`

- [ ] Delete `parser_old()` method from `get_historical.py` (~80 lines)
- [ ] Remove `handler`/`agent` constructor params (unused, yfinance used directly)
- [ ] Simplify constructor to just take `symbol`
- [ ] Update `tasks.py` callers: `MyStockHistoricalYahoo(symbol).parser()` instead of `MyStockHistoricalYahoo(http_agent).parser(symbol)`
- [ ] Remove `fin/tor_handler.py` if no longer used anywhere
- [ ] Verify: price_daily still fetches data correctly
- [ ] Verify: batch_update_helper still works (add stock triggers historical fetch)

---

### Step 4.9 — Per-section error boundaries

Branch: `feat-step-4.9-error-boundaries`

- [ ] Create `src/components/common/SectionErrorBoundary/index.jsx` — shows error message + retry button
- [ ] Wrap stock routes in `<SectionErrorBoundary section="Stock">`
- [ ] Wrap sector routes in `<SectionErrorBoundary section="Sector">`
- [ ] Wrap dashboard routes in `<SectionErrorBoundary section="Dashboard">`
- [ ] Remove global ErrorBoundary from App.jsx (replaced by per-section)
- [ ] Verify: a crash in one section doesn't kill the nav or other sections

---

### Step 4.10 — Celery beat schedule for automated cache refresh

Branch: `feat-step-4.10-celery-beat-schedule`

- [ ] In `tasks.py` `setup_periodic_tasks`: add `rebuild_ranking_cache` every 6 hours
- [ ] Create `@app.task` that calls `compute_all_rankings()` and stores in `RankingCache`
- [ ] After `price_daily` group completes: trigger `rebuild_ranking_cache` as callback
- [ ] Verify: `docker compose logs celery` shows periodic ranking rebuild
- [ ] Verify: ranking cache `computed_at` updates every 6 hours

---

### Step 4.11 — Developer experience improvements

Branch: `feat-step-4.11-developer-experience`

- [ ] Create `Makefile` with targets: `test`, `build`, `dev`, `backfill`, `rebuild-rankings`
- [ ] Create `.env.example` documenting all required env vars
- [ ] Add `docker-compose.override.yml` for vite dev server (port 5173, volume mount, no nginx)
- [ ] Update `README.md` with quick-start: `make dev` for hot reload, `make test` for tests
- [ ] Verify: `make test` runs pytest + frontend build check
- [ ] Verify: `make dev` starts vite + backend in one command

---

### Step 4.12 — Improve DictTable financial display

Branch: `feat-step-4.12-improve-dict-table`

- [ ] Highlight negative values in red, positive in green
- [ ] Add number formatting: round to 2 decimals, add commas for thousands
- [ ] Add mini ECharts sparkline per metric row (trend across dates)
- [ ] Add "Show as % change" toggle (compute period-over-period delta)
- [ ] Verify: `/stocks/1/balance` table renders with colors and sparklines
