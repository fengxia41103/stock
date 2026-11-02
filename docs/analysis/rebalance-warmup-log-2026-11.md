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

TODO today: re-capture HOLDINGS after 9:30 (ideally ~9:45) for an accurate
per-name open read; update this entry with how the names actually opened and
recompute the rebalance trade sizes (MSFT trim, SPYG tranche, LRCX entry)
against live prices.
