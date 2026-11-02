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
