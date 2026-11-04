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

#### 11-02 ~11:00am — EXECUTED: VEA buy (international developed, #1 gap)

Bought VEA **285.449 sh @ $70.07 = $20,001** (intl developed 0 -> ~3.6% of IRA;
non-US exposure off zero). App DB: VEA position auto-created on import.

Rationale: VEA is the single biggest allocation gap (non-US, 20% target).
Entry mid-range (+0.9%). Cash-funded front-load of the buy side; does NOT
reduce the need to still trim SPYG on schedule.

Cash accounting: Pending now -$28,246 = +$16,754 (PDD+MCD) - $24,999 (BND)
- $20,001 (VEA). FDRXX $54,530 - $28,246 = effective cash ~$26,284. Still
above the ~$15K sleeve (~$11K headroom), but realized proceeds fully consumed
and ~half of base cash now in use.

DECISION: STOP cash buys for today to protect the ~$15K sleeve. Fund the rest
(remaining BND ~$30K, VWO, VO, VNQ, VB, LRCX start) from the 11-10 SPYG
tranche proceeds per schedule.

Today's diversification progress: BND 4.5% + VEA 3.6% started from zero.
Remaining non-US/bond/real-asset legs resume 11-10.

#### 11-02 ~11:03am — EXECUTED: PLTR full exit (take profit, pulled forward)

Sold ALL PLTR (43 sh). Fill ≈ **$185.2** (proceeds ~$7,963). Total G/L was
+675% on a ~$1,025 cost basis.

Rationale: PLTR is a committed FULL exit in the governing strategy ("take
profit — one-off win, never planned; no entry thesis"). Today's move was only
+0.4% (below the ~2-3% guardrail), so this was NOT a "sell into strength" call
— it was a deliberate risk-reduction exit of an outsized +675% winner with real
give-back risk. User decided. Honest note: with a committed full exit, the
guardrail is advisory; the exit itself is plan-consistent regardless of the
day's move.

Bookkeeping:
- App DB: PLTR position closed (matches Fidelity).
- Schedule: PLTR marked DONE (table/subtotal/header/cash-flow/Day-1 checklist);
  remaining 11-10 sells now ~$44,183.
- Cash: +$7,963 proceeds REBUILT the cushion — pending moved -$28,246 ->
  -$20,283; effective cash ~$34,247, comfortably above the ~$15K sleeve.

Remaining Day-1 (11-10): SBUX (full exit), MSFT trim, TSM trim. SBUX still
eligible to pull forward on a ≥~2-3% up-day (was -0.94% today).

#### 11-02 ~11:10am — RESTING ORDER (pending, NOT filled): TSM trim

Set a **GTC limit SELL on TSM @ $414** for the TRIM quantity (~8.2 sh of
16.672, to land at the ~$3.5K keep — NOT a full exit). Target is ~+1.2% above
the current ~$408.6, near today's high. If it fills: trim done early at a good
price. If not: leave it; executes on 11-10 as planned.

Status: NOT filled (TSM $408.60 < $414). Positions CSV does NOT show open
orders, so TSM still reads 16.672 sh in the app — expected, not a discrepancy.
Will reconcile when a future CSV shows TSM shares dropping to ~8.45.

Coordination: TSM trim is paired with the LRCX start (the swap). LRCX ~$239 is
still ABOVE the $232-234 limit, so even if the TSM order fills this week, the
LRCX buy can wait until it comes into range — don't forget the LRCX leg stays
open.

Wait decisions logged today:
- SBUX (full exit): -0.9% today — don't sell a loser into weakness; hold for a
  ≥~2-3% up-day or execute 11-10.
- TSM (trim): waiting is right for STRUCTURAL reasons (keeper-trim, paired with
  LRCX not triggering) — NOT because it's red. In a tax-free IRA a realized loss
  gives no benefit; the -2.6% is a sunk cost, not a reason to wait.

#### 11-02 ~4:00pm — CLOSE (official end-of-day warm-up data point)

Tape: growth-fade day with LATE selling into the close; broad tape mixed-to-
green but mega-cap growth dragged.
- Value/cyclical led all day: MA +3.1%, V +2.9%, RCL +4.5%, PEP +2.2%,
  SPGI +1.9%, TXN +0.7%.
- Mega-cap growth faded: MSFT the big loser (close ~$507), VOO -0.47%,
  SPYG/TSM red. Final hour rolled over (MSFT $514->$507, VOO -0.04%->-0.47%).
- Diversifiers held: VEA +0.5% (recovered from midday red), BND +0.1% ballast.

Risk gauges at close:
- VIX 21.27, +9.5% — climbed all day (-2% am -> +9.5% pm), closed ABOVE 20
  (first time today). Nervousness/hedging.
- HYG -0.13% (credit CALM) — so NOT a real risk-off turn. Per the anchor rule
  (real risk-off = VIX 22-25 WITH HYG dropping hard), we have the VIX half but
  NOT the credit half. Cautious close, not a turn. WATCH.

After-hours flag: MSFT -2.74% in POST — likely a post-close headline. If it
holds into tomorrow it shrinks the eventual MSFT trim-to-$48K (fewer dollars),
but does NOT change the decision. Check MSFT AH news before tomorrow.

Plan impact: NONE. Remaining sells (SBUX + MSFT/TSM trims) stay on 11-10; TSM
$414 resting order unfilled (TSM closed ~$399, far below). SBUX +0.8% — no
pull-forward strength. This day is a textbook "why diversify" illustration:
the two biggest positions (MSFT, SPYG/VOO) dragged while the smaller
diversified names carried the account — exactly the concentration the rebalance
is cutting.

End-of-day position state: today's early executions (PDD/MCD/PLTR exits, BND +
VEA buys) all settled as expected; no new fills since.

### 2026-11-03 (Tue) — warm-up day 1

#### 11-03 ~11:16am — EXECUTED: LRCX start (pulled forward from 11-11)

Bought LRCX ~$5,500 at MARKET (~24 sh @ ~$233-234). Pulled forward because it
came into the $232-234 target range today (was $239 on 11-02 — "don't chase"
held, and it came to us). This starts the only NEW position in the plan.

Order-type note: plan specified a LIMIT on LRCX ("don't chase"); executed at
market. Fine here since it was already in-range and liquid, but a limit is
preferred on LRCX specifically for future adds.

Exact fill + auto-classification PENDING a fresh Nov-03 CSV (the one in
~/Downloads was still the Nov-02 file). Will reconcile shares/price and confirm
LRCX auto-maps to us_large on the next import.

Still open on the semi sleeve: TSM trim (GTC $414 resting, TSM ~$408, unfilled)
is the paired SWAP with this LRCX start — LRCX now started, TSM trim still
pending its limit.

RECONCILED (Nov-03 CSV, 11:18am): LRCX **23.582 sh @ $233.22 = $5,500**
confirmed. Auto-classify WORKED on first real test — import printed
"CLASSIFIED LRCX -> us_large" automatically (no manual step; the bug fix holds).
Cash: prior exits settled, FDRXX now $34,248; pending -$5,500 (LRCX settling);
effective cash ~$28,748 after settle — above the ~$15K sleeve (~$13.7K
headroom). CONFIRMS: no more cash buys — remaining VWO/VO/VNQ (~$69K) wait for
SPYG proceeds or the sleeve breaks.

#### 11-03 ~11:49am — EXECUTED: TSM trim (pulled forward from 11-10)

Sold **8.0 sh TSM @ ~$406 = ~$3,249**; kept **8.672 sh ≈ $3,523** (the planned
~$3.5K keep). Partial TRIM, NOT a full exit. TSM position now 8.672 sh in app.

Reasoning (the good version, decided fresh — NOT anchored to yesterday's stale
$414 limit): TSM is in a downtrend (1w -6.9%, 1m -16.3%); today's +1.85% is a
bounce within that downtrend. For the slice being SOLD, sooner is a better exit
than waiting into likely further weakness — same "I'm leaving this, take the
better price" logic as the PDD pop, just the mirror (sell before more downside
vs sell into strength). User's own insight drove this: "if it's a bounce in a
downtrend, wouldn't waiting be worse?" — correct for the sell slice.

Discipline note: did NOT panic-sell the whole position. Kept the ~$3.5K as the
deliberate small semi/EM exposure — the TSM THESIS hasn't broken (−16% is a
drawdown on a volatile semi, not a broken story), so no reason to exit fully.
Trimming to plan = good; dumping all on red = the reactivity the anchor warns
against. Held the line.

Swap status: LRCX start (11-03) + TSM trim (11-03) — the paired semi SWAP is
now BOTH legs done. GTC $414 order should be CANCELLED (superseded by this
market trim) — confirm it's not still resting.

Remaining on 11-10: SBUX (full exit) + MSFT trim → $48K (~$40,934 total).

#### 11-03 ~4:00pm — CLOSE (official end-of-day data point)

Growth-led green day — the MIRROR of Monday's growth-fade.
- Growth/tech/semis led: MSFT +2.8% (fully recovered from Mon AH scare), SPYG
  +1.0%, VOO +0.2-0.4%; semis ran hard — TXN +3.8%, TSM +3.4%, LRCX +3.3%.
- Value gave back: MA/V/SPGI/RCL/PEP all red (exact inverse of Monday).
- VIX ~20.8 (sideways, just above 20), HYG calm — no stress; Monday's
  nervousness has unwound.

Two-day pattern (the thesis, live): Mon value-up/growth-down; Tue growth-up/
value-down. Opposite leadership both days, diversified book green-ish both =
exactly why single-factor concentration is the risk the rebalance cuts.

Executions today (Tue 11-03):
- LRCX STARTED 23.582 sh @ $233.22 ($5,500) — auto-classified us_large ✅.
- TSM TRIMMED 8.0 sh @ ~$406 (~$3,249), kept 8.672 sh ~$3.5K. GTC $414
  cancelled (confirmed). The LRCX+TSM semi swap is now BOTH legs done.
- SBUX NOT pulled forward — never found strength (ranged -0.1% to -0.3% all
  day). Stays on 11-10.

Mild note: semis ran after the TSM trim (TSM $406->$404 close but +3.4% intraday
high zone; LRCX +3.3%). Left a little on the TSM sell slice, but that's noise on
a planned trim; LRCX green validates the swap timing.

Remaining: SBUX full exit + MSFT trim ->$48K (11-10); VWO/VO/VNQ (SPYG-funded);
SPYG tranches 11-12/17/24, 12-01. Cash ~$32K effective after TSM proceeds settle
(above $15K sleeve). Plan impact: none — all on schedule.

## Wed 11-04 — SBUX exit + MSFT trim executed (10:15am ET)

Tape: broad risk-on rally. VOO +1.8%, SPYG +2.1%, VIX 17.2 (-17%, from 20.8),
HYG +0.4%, 10Y 4.93%, DXY 101.4. Value and growth both up (semis lagged:
LRCX/TSM +0.5%).

Executions (reconciled from Fidelity CSV, pending proceeds +$46,913.57):
- SBUX FULL EXIT — sold all 111.88 sh (~$12.0K) into +2.6% up-day. Meets the
  validated pull-forward rule (committed full-exit loser, up-day >=2-3%).
  Position closed in app.
- MSFT TRIM — sold 63.0 sh (~$34.9K) @ ~$554; kept 86.5 sh (~$47.9K, Option B
  $48K cap). NOT covered by the pull-forward rule (MSFT is a keeper-trim,
  which stays on schedule); done at user discretion after a +6.4% pop. The
  larger share count vs plan (63 vs 56.5) is because MSFT appreciated.

Result: ALL Step 1 sells are now complete. Nothing is left for Mon 11-10 sells.
Cash: FDRXX $31,997 settled + $46,914 pending = ~$78.9K (well above the ~$15K
sleeve), waiting for the VWO/VO/VNQ buys and SPYG tranches.

Remaining: VWO/VO/VNQ buys; SPYG tranches 11-12/17/24, 12-01 (+VEA/BND/VB).

## Wed 11-04 — VWO / VO / VNQ buys executed (10:20am ET)

Fills (reconciled from Fidelity CSV; all auto-classified):
- VWO 488 sh @ $56.44 = $27,545 -> emerging
- VO  265 sh @ $81.88 = $21,697 -> us_mid
- VNQ 204 sh @ $96.32 = $19,649 -> real_assets
- Total $68,891 (plan ~$68.8K). Bought into the rally day; each ~flat vs fill.

Step 2 is now fully done. All Step 1 sells and Step 2 buys are complete, a
week ahead of the 11-10 schedule.

Cash: FDRXX $31,997 settled, pending -$21,977 (SBUX+MSFT proceeds +$46,914
less buys $68,891) => effective ~$10,020. That is ~$5K BELOW the ~$15K sleeve
(flagged before executing; user chose to proceed). Not a problem for the plan —
SPYG tranche proceeds fund the next buys — but the sleeve is thin until rebuilt.

Remaining: SPYG tranches 11-12/17/24, 12-01 with VEA/BND/VB buys. Tranche 1
buys ($44,064) ~= sell ($44,029), so cash stays ~$10K unless a buy is trimmed.

## Wed 11-04 — Plan recomputed against target % (10:30am ET)

Recomputed the remaining plan on the live app positions (positions $550,277 +
~$10,020 effective cash). The original SPYG tranche amounts over-bought BND
(plan end-state 13.4% vs 10% target — the $25K BND bought 11-02 was not netted
out) and left mid/EM/REIT/small and the cash sleeve short.

Revised per tranche (x4: Thu 11-12, Tue 11-17, 11-24, 12-01): SELL SPYG ~$44.8K;
BUY VEA ~$23.0K, BND ~$7.8K, VB ~$8.4K, top-ups VO ~$1.2K / VWO ~$2.0K /
VNQ ~$0.7K; HOLD ~$1.7K cash. Totals: SPYG $179.2K, VEA $92K, BND $31.2K,
VB $33.6K, VO $4.8K, VWO $8K, VNQ $2.8K, cash +$6.8K. Rule: the target %, not
the dollars — re-derive from the live gap before each tranche.

Also corrected weekday labels in the schedule (11-10 is a Tuesday; 11-12 a
Thursday; 11-17/11-24/12-01 are Tuesdays).

## Wed 11-04 — Decision: tranche 1 stays on Thu 11-12 (10:44am ET)

Considered running SPYG tranche 1 today (SPYG +1.7%, VIX 17). Decided to wait:
- Staging spreads timing risk; going early only compresses the four weeks.
- The pull-forward rule covers full-exit losers only. SPYG tranches are
  scheduled trims (like MSFT, which was already a discretionary exception).
- SBUX/MSFT proceeds (~$46.9K) will have settled by 11-12; cleaner cash.
- Warm-up week is for validating the revised numbers first.
Today's VWO/VO/VNQ buys are already netted out of the revised tranche amounts.
Process decision, not a market call. Plan unchanged: Thu 11-12, then Tue 11-17,
11-24, 12-01 (revised amounts in the schedule).
