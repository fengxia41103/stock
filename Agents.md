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

### Graham + Darwin Valuation Synthesis (the "pay-up" rule)

Darwin tells you WHAT to own (quality that passes the Kill List); Graham tells you whether the PRICE offers a margin of safety. Crossing them resolves the most common real-world case — an elite business that screens expensive. Compute Graham IV with `V = EPS × (8.5 + 2g) × 4.4 / Y`, where `Y` = current AAA corporate-bond yield (FRED `DAAA`), `g` = a conservative growth estimate (use well below guidance), and `EPS` = **normalized** (strip one-time/non-operating gains — see GOOGL).

| | Graham PASS (price ≤ IV, real margin of safety) | Graham FAIL (price > IV) |
|---|---|---|
| **Darwin PASS (quality)** | ✅ **Buy** — the rare "both agree" quadrant (e.g. NFLX at ~$73 vs IV ~$73) | ⚠️ **Buy only if price is >25% below Graham IV**; otherwise WATCH. A quality compounder can be worth paying up for, but not at any price. |
| **Darwin FAIL (Kill List trigger)** | 🚫 **Avoid — classic value trap** (cheap for a reason, e.g. PDD, SBUX) | ❌ **Avoid** |

Rules that fall out of this:
- **A big % drop is not a margin of safety if the stock fell *from a bubble*.** LRCX fell ~37% and AMAT ~41% but both still trade *above* Graham IV — the drop only removed froth, it did not create a bargain. "Oversold" (RSI) ≠ "cheap" (Graham). Verify both independently.
- **For quality-growth names that fail strict Graham, PEG and PE-vs-own-history are the secondary read.** GOOGL fails strict IV on normalized EPS but PEG ~0.92 / ~17x earnings make it "cheap for a mega-cap" — acceptable to initiate. This is a judgment call reserved for Darwin-PASS names only.
- **Never relax the Darwin gate to justify a cheap price.** Graham PASS + Darwin FAIL is the trap quadrant, not a buy.

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
- **LRCX / AMAT (reviewed Oct 15, buy-on-weakness but NOT full-size)**: Both are elite Darwin-quality (ROCE ~52% / ~36%, net cash, LRCX goodwill-free) and oversold (RSI 30 / 33, down ~37% / ~41%). The trap avoided here was the *inverse* of a value trap: a quality name that is oversold but still **not cheap**. Both fell *from a bubble* and still trade above Graham IV (LRCX −129% MoS at g=12%; AMAT −75%). LESSON: a 40% drop + RSI 30 is a scale-in trigger, not a backup-the-truck signal, when Graham shows no margin of safety. Start at ~1/3 target and let valuation come to you.
- **NFLX (reviewed Oct 15, starter-only, confirm at earnings)**: First name in the recent series to actually clear Graham (IV ~$73 vs ~$73 price) after a real ~41% de-rating — but the decline is *fundamental* (growth deceleration), and it tripped a **new Kill-List #9 caution: it stopped disclosing subscriber counts** (reduced transparency is exactly what Darwin flags). Top executives (CFO, Co-CEO, CLO) also sold a cluster near the current price. LESSON: a Graham PASS that depends on sustaining the very growth rate the market now doubts is conditional — size a starter, then let the next earnings print confirm or break the growth thesis before adding. Reduced disclosure is a quality demerit, not a neutral.
- **TSM (reviewed Oct 15, buy-but-size-down)**: The highest-quality business in the series (50% net margin, near-monopoly, widest moat) at a fair price — yet it carries a unique, un-hedgeable **geopolitical tail (Taiwan/China)**. LESSON: Darwin's Pillar 1 ("avoid big risks / a single catastrophic loss can't be recovered") means you size a name *below* what its quality alone would justify when it carries a low-probability/high-severity tail. Quality sizing and risk sizing are separate decisions.

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

### Active Candidate Watchlist (as of 2026-10-15 deep-dives)

Ranked by overall deep-dive score (Darwin quality + Graham valuation + technical). All five PASS the Darwin Kill-List gate; none is a full-size, no-caveat buy — each has a specific brake. See `docs/analysis/<SYM>/` for the full reports.

| Sym | Score | Rating | Why / the one brake |
|-----|-------|--------|---------------------|
| **GOOGL** | ~8.0 | **BUY (quality at a fair price)** | Best quality/value combo: wide moat, fortress balance sheet, AI turning tailwind, ~17x PE / PEG 0.92. Brakes: AI-capex suppressing FCF (FCF/NI ~22%) + DOJ antitrust overhang. No catastrophic tail → can size larger. |
| **TSM** | ~8.0 | **BUY (quality), size down** | Highest business quality in the series (50% net margin, near-monopoly, widest moat), fairly priced. Brake: un-hedgeable Taiwan/China geopolitical tail → size below what quality alone suggests. |
| **LRCX** | ~7.5 | **BUY-ON-WEAKNESS, start small** | Elite semicap (ROCE ~52%, net cash, goodwill-free), oversold (RSI 30, −37%). Brake: fell *from a bubble* — still above Graham IV, no margin of safety → scale in, don't full-size. |
| **AMAT** | ~7.5 | **BUY-ON-WEAKNESS, start small** | Broadest #1 semicap franchise, the *cheaper* of the pair (PEG 0.91, PE ~40, smaller Graham gap), oversold (RSI 33). Brakes: still fails Graham; CEO/CFO sold near the highs; $3.8B goodwill. Note ~0.49 correlation with LRCX — don't double semicap beta. |
| **NFLX** | ~7.0 | **BUY (starter), confirm at earnings** | Only name to clear Graham (IV ~$73 vs ~$73). Brakes: decline is fundamental (growth deceleration), stopped disclosing subscriber counts (#9), insider cluster selling → starter only, let the Q3 print confirm growth before adding. |

**Portfolio note:** KLAC (a semicap peer) was exited on 2026-10-15. Semicap exposure is therefore open — LRCX/AMAT would re-establish it on the dip; concentrate in the higher-conviction one rather than holding both at full size.

---

## Standard Pre-Trade Evaluation (MANDATORY STEP)

**Run this before every buy/sell/trim/add recommendation — no exceptions.** It is the operational checklist that ties the frameworks above together. The *content* of each gate lives in the sections above; this is the *procedure* and the order to run it in. Do not skip a step to reach a conclusion faster — a skipped step is how value traps and stale-data errors get through.

> **Scope reminder:** This tool produces *analysis*, not financial advice. Every step informs the user's decision; the buy/sell/size call is always theirs. State assumptions and what was and wasn't verified.

### Step 0 — Data Integrity Check (DO THIS FIRST, ALWAYS)

**Never trust a DB-stored ratio for a valuation decision without verifying it against a primary/independent source.** Denormalized fields (`d_pe`, `d_pb`, `d_ps`) are computed post-fetch and go stale or wrong when the underlying price/EPS/share-count drifts — and a wrong multiple silently corrupts every downstream verdict.

Procedure:
1. Pull the stored ratio *and* its raw inputs (price, EPS, shares outstanding, net income) from the DB.
2. **Cross-check**: recompute `P/E = price / diluted_EPS` by hand. If the stored `d_pe` disagrees with `price / EPS` by more than a few percent, the stored ratio is STALE — discard it.
3. Confirm the true EPS / share count against a primary source (company earnings release) or a reputable aggregator (web search) before proceeding.
4. If stale, note it explicitly in the output and (optionally) trigger a recompute: refresh statements via the per-symbol statement worker, then re-read.

> **Lesson (LRCX, 2026-10-19):** stored `d_pe` showed **77** against FY2026 net income of $7.27B — internally impossible (implied ~2.05B shares, EPS $3.54). The real diluted EPS was **$5.76** on ~1.26B shares → true P/E **~47.6**, not 77. A ~38% error in the headline multiple. The entire Graham verdict hinged on catching this. **A valuation built on an unverified ratio is worthless.**

### Step 1 — Refresh the data

Update prices (`price_daily`) and, for a valuation decision, refresh the target's statements (per-symbol statement worker: summary, balance, income, cash flow, valuation). Confirm the latest trading bar and latest fiscal period are current; note when the source simply has nothing newer (weekend/pre-filing) vs. a real gap.

### Step 2 — Darwin quality gate (WHAT to own)

Run the **Kill List (10 criteria)**, **ROCE ≥ 15%**, and **moat** checks (see *Framework: Darwin Investing*). Any hard Kill-List trigger ends the evaluation — do not relax the gate to justify a cheap price. A reduced-disclosure or governance demerit (e.g. NFLX dropping sub counts) is a quality demerit, not neutral.

### Step 3 — Cash Flow Health Gate (is the quality real?)

Apply the **Cash Flow Health Gate**: OCF > 0, FCF > 0, **OCF/NI ≥ 80%** (persistent, 4-qtr), **FCF/OCF ≥ 50%**. Weak OCF/NI is the value-trap tell (earnings not backed by cash). Low FCF/OCF alone is acceptable *only* with a capex-payback thesis. Compare within peer type, not across.

### Step 4 — Balance-sheet fortress check

Net cash vs. net debt, current ratio (> 2 preferred), debt/equity, goodwill as a share of assets (tangible book quality), and the receivables/inventory trend (a working-capital build is normal in a growth quarter but must be tracked, not ignored).

### Step 5 — Graham valuation (the PRICE / margin of safety)

Using the **verified** EPS from Step 0, compute Graham IV: `V = EPS × (8.5 + 2g) × 4.4 / Y` (normalized EPS; conservative `g` well below guidance; `Y` = AAA yield, FRED `DAAA`). Run a reverse sanity check ("what EPS growth is the current price pricing in at 20×/25×/30×?"). Then place the name in the **Graham × Darwin 2×2**:

- Darwin PASS + Graham PASS → **buy** (rare).
- Darwin PASS + Graham FAIL → **buy only if price is >25% below IV; else WATCH / scale-in starter.**
- Darwin FAIL + Graham PASS → **value trap, avoid.**
- Darwin FAIL + Graham FAIL → **avoid.**

Remember: a big % drop is **not** a margin of safety if the stock fell *from a bubble* (RSI-oversold ≠ Graham-cheap).

### Step 6 — Timing & correlation

Check RSI(14) and 2-year price position (genuine discount needs < 35% of range, not just a low RSI — see *Cheap for a Reason* + *Decision Matrix*). Then check **portfolio correlation**: does this add a genuinely new driver, or does it double an existing factor? Compute daily-return correlation from the DB against current holdings (e.g. LRCX vs TXN ≈ −0.02 = different bet; MSFT/GOOGL ≈ +0.22 = shared AI factor). Hidden correlation turns "diversification" into concentration.

### Step 7 — Position sizing & the Scale-In Ladder

Sizing is a separate decision from quality (Darwin Pillar 1 — a catastrophic, un-hedgeable tail sizes a name *below* its quality, e.g. TSM geopolitics). For any Darwin-PASS name that fails Graham (the common "quality but not cheap" case), **do not full-size — scale in**:

- Default to a **3-tranche ladder**, ~1/3 target size each.
- **Tranche 1** at/near today's price (the starter).
- **Tranches 2 & 3** stepped down (~−8–10% each), with the **final tranche landing near the top of the Graham IV range** so full size is only reached if a real margin of safety appears.
- Max ~5% per new position; define the stop before entry; if the stock never pulls back you still hold a quality starter.
- **Cash is a position.** If nothing lands in a green cell, hold cash and wait.

### Step 8 — Record the decision

Log a dated `MyDiary` entry (bull/bear, entry price, the governing verdict, and the one brake) and, for a full deep-dive, write the report to `docs/analysis/<TICKER>/<ticker>-deep-analysis-<date>.md` (see `skills/stock-deep-dive-framework.md`). When a decision supersedes an earlier note, append a dated `[SUPERSEDED]` marker to the old entry rather than deleting it — preserve the trade-history trail.

> **Quick-reference order:** Verify data → Refresh → Darwin gate → Cash-flow gate → Balance sheet → Graham IV → Timing & correlation → Scale-in sizing → Record. A "no" at the Darwin or cash-flow gate stops the line; a Graham fail downgrades a buy to a scale-in/watch, never an auto-reject for a Darwin-PASS name.

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
