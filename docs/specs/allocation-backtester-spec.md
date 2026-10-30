# Spec — Asset-Allocation Backtester

Status: DRAFT for review | Date: 2026-10-29 | Owner: fengxia

> Analysis tool, not financial advice. It compares historical behavior of
> allocation mixes; it does not predict the future or recommend a plan.

---

## 1. Motivation

A Fidelity advisor flagged the current book (~93% US large-cap growth, 0%
bonds, ~4% international) as too aggressive for age 53 / retire 60-65. We can
already *see* the current allocation (drift tracker, shipped 2026-10-29). What
we cannot yet do is answer: **"how would a diversified mix have behaved vs my
current concentration, especially in a drawdown?"**

This spec defines a backtester that takes one or more **named allocations**
(weights across asset-class proxies), simulates holding + periodic rebalancing
over history, and reports risk/return metrics side by side.

Example question to answer:
- A = 50% large cap, 25% small cap, 25% bonds
- B = 33% large cap, 33% international, 12% small cap, 22% bonds
- Benchmark = 100% large cap (today's de-facto position)
- Which had the lower max drawdown? Lower volatility? What was the return cost?

---

## 2. Why a new engine (not the existing one)

The current `BacktestEngine` (`backend/stock/backtesting/engine.py`) is
**signal-driven on individual stocks**: it iterates day-by-day and calls
`strategy.should_enter/should_exit` per symbol. Asset-allocation backtesting is
**weight-driven**: hold fixed target weights, rebalance on a schedule, no
entry/exit signals.

Decision: build a **separate module** `backtesting/allocation.py`. Reuse the DB
price source (`MyStockHistorical`) and the metrics style of
`backtesting/report.py`, but do not overload the signal engine.

Out of scope for this engine: stock-picking signals, indicators, earnings
logic. Those stay in the existing engine.

---

## 3. Data requirements & gap

Each asset class needs a **price-proxy ETF** with sufficient DB history.

Current DB coverage (verified 2026-10-29):
- US large cap: SPY (1993), SPYG (2000), VOO (2010) — GOOD.
- Small cap, international, emerging, bonds, REIT, TIPS — **NONE tracked.**

Gap-fill: ingest the missing proxies via the existing yfinance worker
(`MyStockHistoricalYahoo(symbol).parser()`, same path used to backfill SPYG).
Full history, idempotent (skips existing dates).

Proposed default proxy set (OPEN — see §9):

| Asset class            | Primary | Alt    | ~History start |
|------------------------|---------|--------|----------------|
| US large cap           | SPY     | VOO    | 1993           |
| US small cap           | IJR     | VB     | 2000 / 2004    |
| International developed | EFA     | VEA    | 2001 / 2007    |
| Emerging markets       | EEM     | VWO    | 2003 / 2005    |
| US agg bonds           | AGG     | BND    | 2003 / 2007    |
| Intl bonds (opt)       | BNDX    | —      | 2013           |
| TIPS (opt)             | TIP     | SCHP   | 2003 / 2010    |
| REIT (opt)             | VNQ     | —      | 2004           |

**Period rule:** a comparison runs only over the **shortest common history**
across all proxies used in any allocation being compared. Engine computes and
reports the effective start date; warns if it was clipped. (E.g. including BNDX
caps the window at ~2013.)

---

## 4. Core concepts / inputs

```
Allocation = {
    "name": "Balanced 60/40",
    "weights": { "SPY": 40, "EFA": 15, "IJR": 5, "AGG": 40 },  # must sum ~100
}

BacktestConfig = {
    "allocations": [Allocation, ...],   # 1..N to compare
    "start_date": date | None,          # None -> earliest common
    "end_date":   date | None,          # None -> latest common
    "initial_cash": 100_000,
    "rebalance": "quarterly",           # none|monthly|quarterly|annual
    "benchmark": "SPY",                 # single proxy, default 100% large cap
    "rebalance_band_pct": None,         # optional: only rebalance if drift > band
}
```

Validation:
- Each allocation's weights sum to 100 (±0.5 tolerance); else error.
- Every weight ticker must be a tracked `MyStock` with history; else error
  listing missing tickers (and hint to ingest them).
- start/end clipped to common data range; report the clip.

---

## 5. Simulation model

Daily loop over the common trading-date index (same bulk-prefetch approach as
the existing engine for speed):

1. **Day 1 (start):** invest `initial_cash` across sleeves at target weights.
   Fractional shares allowed (ETF index backtest — avoids int-rounding noise
   that distorts small sleeves; the existing stock engine uses int shares, we
   intentionally differ and document it).
2. **Each day:** mark-to-market every sleeve at that day's close; record total
   portfolio value (equity curve point).
3. **On rebalance dates** (per `rebalance` schedule): sell/buy sleeves back to
   target weights. If `rebalance_band_pct` set, only rebalance sleeves whose
   drift exceeds the band ("threshold rebalancing").
4. **Dividends:** Phase 1 uses `close_price` (price return only). Note this
   understates total return, and *more so for bond/high-yield sleeves* than
   equity. Phase 2 may switch to `adj_close` (which the worker already stores)
   for total-return accuracy. Documented limitation, called out in output.
5. **No transaction costs / taxes** in Phase 1 (IRA context ~ tax-free;
   document the assumption). Optional bps cost per rebalance in Phase 2.

Rebalance-date generation: calendar-based (first trading day on/after each
period boundary). `none` = buy-and-hold drift (no rebalancing) — useful as a
contrast to show how much rebalancing actually contributes.

---

## 6. Metrics (per allocation + benchmark)

Return:
- Total return %
- CAGR (annualized) — the headline comparator
- Best / worst calendar year %

Risk (the point of this exercise):
- **Annualized volatility** (stdev of daily returns × √252)
- **Max drawdown %** (peak-to-trough) + drawdown duration (days)
- Sharpe ratio (rf configurable, default from a constant; could wire FRED later)
- Sortino ratio (downside deviation)
- % of months positive

Comparison:
- Alpha / return spread vs benchmark
- Return-per-unit-risk ranking (CAGR ÷ max drawdown)

Output object:
```
{
  "effective_start": "2011-01-04", "effective_end": "2026-10-29",
  "clipped": true, "rebalance": "quarterly",
  "results": [
    { "name": "...", "cagr_pct": ..., "vol_pct": ..., "max_drawdown_pct": ...,
      "sharpe": ..., "sortino": ..., "total_return_pct": ...,
      "equity_curve": [{date,value}, ...], "annual_returns": {2011: .., ...} }
  ],
  "benchmark": { ...same shape... },
  "assumptions": ["price-return only (no dividends)", "no fees/taxes", ...]
}
```

---

## 7. Interfaces

Phase 1 — management command (fast to iterate, no auth):
```
python manage.py backtest_allocation \
  --alloc "Aggressive=SPY:50,IJR:25,EFA:25" \
  --alloc "Balanced=SPY:33,EFA:33,IJR:12,AGG:22" \
  --benchmark SPY --rebalance quarterly --start 2011-01-01
```
Prints a comparison table + writes optional JSON (`--json out.json`).

Phase 2 — DRF API action under the existing BacktestViewSet, e.g.
`POST /api/v1/backtest/allocation/` taking the `BacktestConfig` JSON and
returning the output object, so a frontend chart can consume equity curves.
(Mirror existing async pattern if runs are slow — see `run_backtest_task`.)

Persistence (optional Phase 2): reuse/extend `BacktestResult` model, or add a
light `AllocationModel` save so named allocations are reusable and tie into the
AssetClass buckets already shipped.

---

## 8. Phasing

- **Phase 0 (data):** ingest the chosen proxy ETFs; verify common history
  window. (Prereq for any real run.)
- **Phase 1 (engine + CLI):** `backtesting/allocation.py` + `backtest_allocation`
  command + unit tests on a known case (e.g. 100% SPY must ≈ SPY buy&hold;
  a 2-asset constant-weight rebalance matches a hand-computed small example).
- **Phase 2 (API + persistence + dividends/fees):** endpoint, optional
  adj_close total-return mode, optional costs, saved allocations, frontend.

Each phase independently useful; stop after Phase 1 if the CLI answers the
question well enough.

---

## 9. Open questions (need decisions before build)

1. **Proxy tickers** — accept the §3 defaults (SPY/IJR/EFA/EEM/AGG, + optional
   BNDX/TIP/VNQ), or substitute Vanguard equivalents (VOO/VB/VEA/VWO/BND)?
   iShares (SPY/EFA/EEM/AGG/IJR) generally have *longer* history → longer
   backtests; Vanguard are the ones you'd more likely actually buy. Could
   ingest both and pick per-run.
2. **Rebalance default** — quarterly (proposed) vs annual? And should Phase 1
   include threshold/banded rebalancing or defer to Phase 2?
3. **Dividends in Phase 1** — accept price-return-only to start (simpler,
   slightly pessimistic, uneven across sleeves), or do `adj_close`
   total-return from the outset? Total return is more correct but I want to
   confirm `adj_close` quality for the ingested ETFs first.
4. **Scope to stop at** — Phase 1 (CLI) only for now, or commit to Phase 2 API?
5. **Risk-free rate** for Sharpe — fixed constant (e.g. 2%) or wire to the
   FRED data already in the app?
6. **Fractional shares / rounding** — confirm OK to use fractional (I recommend
   yes for an index allocation backtest).
```

---

## 10. Risks / caveats to surface in output

- Past performance ≠ future. A 2011-2026 window is mostly a bull market with
  one big 2022 drawdown; it under-samples sustained bear/stagflation regimes.
- Proxy ≠ your actual funds (fees, tracking error ignored in Phase 1).
- Shortest-common-history clipping can make the window surprisingly short if an
  exotic sleeve is included — always shown in output.
- Backtests flatter rebalancing in mean-reverting data; don't over-fit the
  rebalance frequency.
