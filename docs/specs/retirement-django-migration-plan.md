# Retirement Planner → Django App Migration (DB-backed, integrated UI)

Status: ✅ COMPLETE — all phases shipped & pushed | Date: 2026-11-01
Branch: `feat-frontend-refactor-cwis-style`
Supersedes: the standalone `retirement/` stdlib server + the dev-only `retirement`
Docker service (both removed).

## Goal (met)

Retirement planning is now a first-class feature of the stock app: same Django
backend, same React UI, with **on-demand DB snapshots** so each time you refresh
your numbers you can save a timestamped point and chart your outlook over time.

Plus an **app-wide UI theme uplift** (Phase 0): the retirement look/feel (dark
panels, accent blue, pill chips, compact tables) now applies across the whole
app via the centralized MUI theme, with a light/dark toggle.

## Decisions (confirmed, all implemented)

- **A = sub-package** of `stock` (`stock/retirement/` + `stock/models/retirement.py`).
  No second Django app; matches the codebase convention.
- **B = `RetirementHolding` own table** (queryable position history per snapshot).
- **C = history chart metric toggle** (net/gross income, pool, IRA, DC, pension).
- **D = seed** the profile from `my_inputs.json` via a management command.
- **E = light/dark toggle** (default dark; choice in localStorage).
- **F = UI uplift as Phase 0 first**, then the migration.

---

## As-built summary (by phase → commit)

| Phase | Commit | Delivered |
|------|--------|-----------|
| 0. UI theme uplift | `f0d0276` | `createAppTheme(mode)` factory (dark+light) + `ColorModeProvider` (localStorage, default dark) + top-bar toggle; fixed hardcoded white panel bg in BacktestView |
| 1. Models + migration | `5ff89e9` | `RetirementProfile` / `RetirementSnapshot` / `RetirementHolding` + migration `0068` |
| 2. Core logic + tests | `a36db95` | Ported `model/service/parsers/allocation/pricing` into `stock/retirement/`; 25 tests; parity verified byte-for-byte vs the original |
| 3. REST API + tests | `3c785e6` | `RetirementViewSet` (7 endpoints) + serializers + 11 API tests |
| 4. Seed command | `ca95bfb` | `seed_retirement --user --path`, secrets ignored |
| 5. Frontend views | `8d16f75` | `RetirementView` + `RetirementHistoryView` + hooks + routes + nav |
| 6. Removal + cleanup | `2a207ba` | Deleted standalone `server.py`/`index.html`/`Dockerfile.dev` + `:8086` dev service; updated README/Makefile/compose; e2e verified |
| 7. ESLint migration* | `a7773f6` | Flat `eslint.config.js` for ESLint 9 (follow-up request) |

\* Not in the original plan — a follow-up: the legacy `.eslintrc.json` extended
plugins that were not installed and could not load under ESLint 9. Replaced with
a flat config built on the installed packages (`@eslint/js`,
`eslint-plugin-react`, `eslint-plugin-react-hooks`, `globals`).

> Note: the original build order listed separate "Frontend" and "History view"
> steps; these were delivered together in `8d16f75`. The result is the same
> 7-task scope.

---

## Backend (as built)

### Models — `backend/stock/models/retirement.py`
- **`RetirementProfile`** — `OneToOne(User)`, all planning inputs as columns;
  `ss_by_claim_age` / `fed_brackets` / `skip_accounts` / `dc_plans` as JSON.
  Generic placeholder defaults only; real values live in the local DB.
- **`RetirementSnapshot`** — `profile` FK, `taken_at`, `label`, frozen `inputs`
  (JSON) and computed `results` (JSON). Results store **lean scenario summaries**
  (per-year rows stripped) so the history chart is instant.
- **`RetirementHolding`** — own table: `snapshot` FK, symbol, quantity, price,
  value, sleeve, source (live/fallback); indexed on (snapshot, symbol).
- Registered in `stock/models/__init__.py`. Migration `0068`. (No Django admin —
  the project uses none.)

### Core logic — `backend/stock/retirement/`
- `model.py` — pure computation (scenarios, optimize, pension, glidepath, taxes),
  no file IO / CLI.
- `service.py` — `assumptions_from_profile(profile, overrides)`; coerces JSON
  string keys (ss) and list brackets back to the dataclass shapes.
- `parsers.py` — Fidelity CSV / Empower PDF / master JSON.
- `allocation.py` — sleeve maps + household targets.
- `pricing.py` — **in-process** pricing via `MyStock` historicals (no HTTP/token);
  `reprice_holdings` + `reprice_and_allocate`.

### API — `backend/stock/api/retirement.py` (`/api/v1/retirement/`)
User-scoped `RetirementViewSet` (TokenAuth, `IsAuthenticated`):
`profile` (GET/PUT), `compute`, `optimize`, `allocation`, `upload` (multipart,
not persisted), `snapshots` (GET list / POST create), `timeseries` (GET `?age=`).

### Tests — `backend/stock/tests/test_retirement.py`
36 passing: model math (golden values from generic defaults), pension/SS/tax/
glidepath/allocation/pricing (incl. DB historicals), parsers, and all API
endpoints + auth. Parity vs the original model verified out-of-band with real
inputs (not committed): the ported model reproduces the standalone outputs
exactly (net monthly, pool, and optimal age all matched).

---

## Frontend (as built)

- **Routes** (`routes.jsx`): `/retirement` → `RetirementView`,
  `/retirement/history` → `RetirementHistoryView` (lazy, behind the auth guard).
- **Hooks** (`api/hooks.ts`): `useRetirementProfile`, `useRetirementSnapshots`,
  `useRetirementTimeseries(age)`; `RetirementView` uses the `api` client directly
  for compute/optimize/upload/allocation/snapshot POSTs.
- **RetirementView**: grouped assumptions form, headline summary cards, scenario
  table, optimal-age summary, statement upload → live reprice + household
  allocation vs target + per-ticker, and **Save snapshot**.
- **RetirementHistoryView**: age toggle (62/67/70) + **metric toggle**
  (net/gross/pool/IRA/DC/pension) driving a line chart over snapshots + a table.
- **Charts**: Highcharts (the app's existing lib), via the shared `HighchartGraph`.
- **Nav**: a "Retirement" entry (Savings icon) in `app/navigation.jsx`.
- All in the uplifted dark MUI theme.

---

## Removal / cleanup (done)
- Deleted `retirement/server.py`, `retirement/index.html`,
  `retirement/Dockerfile.dev`; removed the `retirement` service + `:8086` from
  `docker-compose.dev.yml`; updated the Makefile `dev-hot` comment.
- Rewrote `retirement/README.md` to point at the in-app feature + the
  `seed_retirement` command.
- **Kept** the pure-Python model/parsers/allocation modules under `retirement/`
  as an optional offline CLI (the in-app copy is canonical). `my_inputs.json`
  stays gitignored; the DB is local.

---

## Privacy & security (held throughout)
- All endpoints user-scoped + auth-required (global `IsAuthenticated` + TokenAuth).
- No personal numbers or tokens in any committed file — verified by grep each
  phase. Real data lives only in the local DB, seeded from the gitignored JSON.
- Uploaded statements are parsed in-memory and **not** persisted.
- In-process pricing removes any need to store a Django API token.
- The seed command ignores `django_token` / `django_base_url` so secrets never
  land in the DB profile.

---

## Verification (e2e)
- Dev stack runs **without** the `:8086` service; frontend compiles (vite) and
  the new views transform cleanly.
- Live API round-trip through the running stack: profile auto-create → compute
  (net $11,114/mo from generic defaults) → snapshot create → timeseries.
- Backend suite: **36 passing**; `manage.py check` clean.
- New frontend files are ESLint-clean under the new flat config.

---

## Follow-ups / known debt (not blocking)
- `eslint src` reports ~80 **pre-existing** issues in older views (mostly
  `react/no-unescaped-entities`). Left untouched; many are `--fix`-able.
- To seed the real profile: `my_inputs.json` is not mounted in the `web`
  container, so run `seed_retirement` where the file is reachable (or mount it).
- The standalone CLI modules under `retirement/` now duplicate the in-app logic;
  consider retiring them fully in a later cleanup if the CLI is unused.
