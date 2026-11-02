# Rebalance Warm-Up Log — validate before executing 2026-11-10

Purpose: before a ~$260K two-sided IRA shift, spend the days up to 2026-11-10
checking the plan against **live, end-of-day market data** (not overnight
futures). One dated entry per trading day. Analysis, not advice.

> Honest constraints: US markets trade 9:30am–4:00pm ET. The app pulls
> **end-of-day** daily bars (yfinance via `get_historical`) — no intraday or
> pre-market feed. So each day's useful check happens **after the close**. The
> agent runs only when you message it; it does not monitor overnight.

## Daily workflow (after each close, or next morning)
1. You: send the day's close (or re-download the Fidelity positions CSV to
   `~/Downloads/`).
2. Agent refreshes prices in the app, e.g.:
   `docker compose ... exec web python manage.py <price refresh>`
   (worker: `stock/workers/get_historical.py`) and/or
   `python manage.py import_fidelity_csv ~/Downloads/<file>.csv`.
3. Agent recomputes vs the plan and appends an entry below:
   - MSFT value & trim-to-$48K size
   - SPYG value & the ~$44K tranche (and shares at the day's price)
   - LRCX entry level (~$232-234 limit still sensible?)
   - PLTR/PDD/SBUX/MCD/TSM sell sizes
   - Allocation drift: GET /api/v1/portfolio/allocation/
   - Flag: did anything move enough to change a decision? Any thesis news?

## What would change the plan (watch-items)
- MSFT swings a lot → recompute trim so the keep-size stays ~$48K.
- SPYG gaps → tranche $ is fixed (~$44K); shares float. Cadence does NOT change.
- LRCX runs well above ~$234 → don't chase; keep the limit, add lower later.
- Any earnings/news breaking a thesis (esp. GOOGL capex, TXN cycle) → revisit
  that name's sell/keep before 11-10.

## Target end-state (unchanged)
Satellite ~30% (≤$30K each EXCEPT MSFT ~$48K); core ~70% index; 90/10 equity/
bonds; ~3% (~$15K) cash sleeve. Full plan:
`docs/analysis/rebalance-schedule-2026-11.md`.

---

## Log

### 2026-11-01 (Sun) — setup
- Market closed (weekend). No price action to read.
- Baseline from Fidelity CSV Nov-01 (10:47am ET download): IRA ~$545,284;
  MSFT $78,026 (14.3%); SPYG $212,006 (38.9%); FDRXX cash $54,530 (10%).
- Decisions locked: MSFT Option B cap ~$48K; schedule shifted +1 week
  (execute week of 11-10); Week-1 split Day1 sells / Day2 buys / Day3 SPYG.
- Next check: Mon 2026-11-02 after close (first live data point of the
  warm-up week).

### 2026-11-02 (Mon) — pre-open read (~9:20am ET)

World / overnight wind (fresh capture): **constructive, tech-led.**
- US futures green into the open: S&P (ES=F) ~7,655, Nasdaq (NQ=F) ~28,770,
  Dow (YM=F) ~52,271; firmer than the 7:30am read. VIX ~19.1 and falling —
  risk appetite improving.
- Asia (closed): KOSPI +2.24%, Shanghai +1.08%, Hang Seng +0.42% — risk-on,
  Korean semis strong (tell for TSM/LRCX/TXN). Nikkei −0.33% laggard.
- Europe (open): FTSE/DAX/Euro Stoxx ~flat-to-slightly-green — no drag.
- Net: mild tailwind for the semi sleeve + tech (MSFT/GOOGL) at the open.

Data caveat: individual-stock PRE-market prints from yahooquery were stale
at 9:20am (echoing prior close + last night's after-hours), so NO reliable
per-name pre-market read yet. Reliable signal pre-open = index futures only.

Monitoring note: the overnight `monitor_overnight` loop was NOT left running
last night, so there is no intraday time-series — only point captures. Leave
it running tonight for the evolving view.

Live open read (~9:31am ET, first REGULAR-session prints) — broad risk-on,
semis & growth leading, confirming the overnight wind:
- Leaders: PDD +2.12%, PLTR +1.87%, TSM +1.46% (Korea tell paid off),
  RCL +1.24%, TXN +0.97%.
- Mega/core: GOOGL +0.74%, MSFT +0.73% ($525.17), SPYG +0.54% ($117.18),
  VOO +0.33%, V +0.10%.
- Defensives muted (PEP +0.12%, PG +0.39%), MCD −0.07% lone red — classic
  risk-on signature. No ugly gaps anywhere in the book.

Recomputed trade sizes vs live open prices (execution is 11-10; these are
sizing checks, NOT orders to place today):
- **MSFT trim:** value ≈ $78,596 (base $78,026 × +0.73%). Option-B keep ~$48K
  → sell ≈ **$30,600 ≈ ~58 sh** at $525.17 (leaves ~$48K / ~8.8%).
- **SPYG tranche:** fixed ~$44K per tranche → ≈ **~375 sh** at $117.18.
  Cadence unchanged (4 tranches: 11-12, 11-17, 11-24, 12-01).
- **LRCX entry:** limit ~$232-234 still sensible. Semis running hot at the
  open (TSM/TXN up ~1-1.5%) — do NOT chase; keep the limit, add lower if it
  doesn't fill.

Caveats: opening-minute prints are volatile; a ~9:45 or after-close recapture
gives steadier numbers. Share counts are approximate — finalize at the screen
on 11-10 against that day's prices.

#### 11-02 mid-morning — Fidelity CSV (10:15am ET marks)

Imported `Portfolio_Positions_Nov-02-2026.csv` (18 prices updated; 0 position
changes — no trades, same share counts as 11-01).

Rollover IRA (230806312) vs 11-01 baseline:
- IRA total: ~$545,284 -> **~$551,683** (broad +1% tape lifted the book).
- MSFT: $78,026 (14.3%) -> **$78,493 (14.23%)**, 149.5 sh @ $525.04 (+0.59%).
- SPYG: $212,006 (38.9%) -> **$214,145 (38.82%)**, 1,821.04 sh @ $117.60 (+1.00%).
- FDRXX cash: **$54,530 (9.88%)** unchanged (~$39.5K excess vs 3% target still
  available to fund 11-10 buys).

Recomputed sizes (sizing checks only; execution 11-10):
- MSFT trim: keep ~$48K -> sell ~$30,493 ≈ **~58 sh** @ $525.04 (of 149.5).
- SPYG tranche: ~$44K -> **~374 sh** @ $117.60; 4-tranche cadence unchanged.
- LRCX: ~$232-234 limit holds; TSM soft (+0.56% today), semis mixed — no chase.

Drift read: nothing moved enough to change a decision. MSFT/SPYG overweights
intact; the rally lifted everything roughly proportionally. Plan holds for
11-10 as scheduled.

Tooling note: fixed a snapshot bug today — day-change % now computed from
price vs prior close (yahooquery's % field was lagging the live price; e.g.
TSM was wrongly shown positive while actually down).

#### 11-02 ~10:29am — EXECUTED: PDD full exit (pulled forward from 11-10)

Sold ALL PDD (~143.642 sh). Fill ≈ **$82.65** (proceeds $11,872.48 shown as
"Pending activity", settling into FDRXX). Fill landed in the $82.3-82.7 target
zone. Sold into a +5% up-day.

Rationale (plan-consistent): PDD was already a committed full exit (broken
thesis / Darwin gate fail). Pulled forward because (a) tax-free IRA = no cost
to timing, (b) PDD rarely follows through on consecutive up-days, so selling
the pop beats chasing it lower next week. This is NOT a new decision — just a
better execution moment within the locked plan.

Bookkeeping:
- App DB: PDD position closed (matches Fidelity).
- Schedule Step 1: PDD marked DONE so 11-10 Day-1 does NOT double-count it.
- Cash: +$11,872 proceeds ADD to the ~$54.5K sleeve; does NOT change 11-10 buy
  funding (buys were cash-funded regardless). One fewer sell on Day-1 11-10.
- SBUX (other full-exit) left on the 11-10 schedule — it was -0.72% today, no
  strength to sell into.

Remaining Day-1 (11-10) sells: PLTR, SBUX, MCD, MSFT trim, TSM trim.

#### 11-02 ~10:43am — EXECUTED: MCD full exit (pulled forward from 11-10)

Sold ALL MCD (~18.577 sh). Fill ≈ **$262.8** (proceeds ~$4,882; Pending
activity now $16,754 = PDD $11,872 + MCD $4,882). Sold into +1.9% up-day.

Rationale (plan-consistent): MCD is a committed FULL exit in the governing
70/30 doc ("fold into index core" — one of the few from the SPGI/LIN/PEP/PG
group that stayed a sell; the others are KEEPS). +1.9% is a softer trigger than
PDD's +5% and just under the ~2-3% guardrail, but MCD is low-vol (won't pop 5%)
and it's a committed exit, so selling green is defensible — not front-running a
keeper. User ready.

Bookkeeping:
- App DB: MCD position closed (matches Fidelity).
- Schedule: MCD marked DONE (table/subtotal/header/cash-flow/Day-1 checklist);
  remaining 11-10 sells now ~$52,146.
- Cash: +$4,882 adds to the sleeve; does NOT change 11-10 buy funding.

Remaining Day-1 (11-10): PLTR (full exit), SBUX (full exit), MSFT trim, TSM
trim. (PLTR/SBUX still eligible to pull forward on a ≥~2-3% up-day; neither
qualified today — PLTR +0.9%, SBUX −1.1%.)

#### 11-02 ~10:56am — EXECUTED: BND buy (first diversification tranche)

Bought BND **350.459 sh @ $71.33 = $24,999** (bonds 0 -> 4.53% of IRA).
App DB: BND position auto-created on CSV import.

Rationale: cash-funded diversification started early (plan allows — buys don't
wait on SPYG settlement). BND chosen as the first buy because it was the
cleanest entry (flat +0.06%, bottom of day range) and is pure de-risking
(bonds 0 -> 10% target). This FRONT-LOADS the buy side; does NOT reduce the
need to still trim SPYG on schedule.

Cash accounting (watch): FDRXX still shows $54,530 (buy not yet drawn);
Pending activity flipped to -$8,246 = +$16,754 PDD/MCD proceeds - $24,999 BND.
So BND recycled the realized proceeds + ~$8.2K of base cash. Effective cash
after settle ~$46,284 — still above the ~$15K sleeve, but base cash now tapped.
Keep remaining same-day buys modest so cash stays > $15K sleeve.

Progress toward 10% bonds: $24,999 of ~$55,168 target (~$30K remaining, to
complete alongside the SPYG tranches).
