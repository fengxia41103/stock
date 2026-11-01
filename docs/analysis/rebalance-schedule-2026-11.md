# Rebalance Execution Schedule — Staged

Created: 2026-11-01 | Account: Managed IRA (tax-free to rebalance) | Prices ~2026-10-30

> Execution mechanics, not investment advice. Order types are general best
> practice for liquid ETFs/stocks; limit prices and tranche sizes are your call
> at the screen. This is a PRE-COMMITTED schedule, not a "wait for recovery"
> condition — follow the cadence regardless of short-term price moves.

## Principle
- The big SPYG→diversified shift is **staged over 4 weeks** to avoid dumping
  $176K into last week's weakness in one shot — a fixed schedule, not a timing
  bet. If SPYG bounces you capture some; if it falls you've de-risked some.
- The one-time trades (loser sells, MSFT/TSM trims, LRCX start, and the
  EM/mid/REIT buys they fund) go **Monday 11-03** — no reason to stage these.

## Order-type cheatsheet
- **ETF buys/sells**: market or marketable-limit. Trade **after ~9:45 AM**
  (avoid the opening-bell wide spreads; matters most for VEA/VWO).
- **Large SPYG sells**: marketable-limit; fine as one order per week at ~$44K.
- **Loser sells (PDD/SBUX)**: just execute — don't anchor on cost.
- **LRCX start**: **limit** at/just below the open (~$232-234). No urgency;
  don't chase.
- **Sequencing**: do sells before buys each session so cash is available.

---

## MONDAY 2026-11-03 — one-time block (do sells first)

SELLS (~$86,875):
- PLTR — sell all ~$7,949 (take profit on the unplanned winner)
- PDD — sell all ~$11,318 · SBUX — sell all ~$11,663 (losers)
- MCD — sell all ~$4,810 (fold into core)
- MSFT — trim to $30K cap → sell ~$47,912
- TSM — trim to $3.5K → sell ~$3,223

BUYS (~$74,325):
- LRCX — start ~$5,500 (~24 sh, **limit** ~$232-234)
- VWO (emerging) ~$27,549 · VO (US mid) ~$21,692 · VNQ (REIT) ~$19,584

(Monday sells exceed buys by ~$12.5K — rolls into Week-1 cash for the SPYG buys.)

---

## WEEKS 1-4 — staged SPYG reallocation (~$44K/week)

Each Monday (11-03, 11-10, 11-17, 11-24), repeat:
- **SELL SPYG ~$44,029**
- **BUY VEA ~$24,480** (international developed)
- **BUY BND ~$12,240** (bonds)
- **BUY VB ~$7,344** (US small cap)

| Week | Date | SPYG sell | VEA | BND | VB |
|------|------|----------:|----:|----:|---:|
| 1 | Mon 11-03 | $44,029 | $24,480 | $12,240 | $7,344 |
| 2 | Mon 11-10 | $44,029 | $24,480 | $12,240 | $7,344 |
| 3 | Mon 11-17 | $44,029 | $24,480 | $12,240 | $7,344 |
| 4 | Mon 11-24 | $44,029 | $24,480 | $12,240 | $7,344 |
| **Total** | | **$176,117** | $97,920 | $48,960 | $29,376 |

## After completion (target end-state)
Satellite ~30% (12 names, each ≤$30K: MSFT, MA, V, RCL, LIN, PG, TXN, GOOGL,
PEP, SPGI, LRCX, TSM). Core ~70% diversified index (VOO/VO/VB/VEA/VWO/BND/VNQ).
Whole portfolio ~90% equity / 10% bonds.

## Checklist
- [ ] Mon 11-03: one-time block + Week-1 SPYG tranche
- [ ] Mon 11-10: Week-2 tranche
- [ ] Mon 11-17: Week-3 tranche
- [ ] Mon 11-24: Week-4 tranche (final)
- [ ] After each: GET /api/v1/portfolio/allocation/ to confirm drift closing
- [ ] If SPYG moves a lot, DO NOT change the cadence — the point is to not time it

## Caveats
- Dollar amounts are from 2026-10-30 prices; share counts shift with Monday
  prices. Recompute shares at the screen (amount ÷ live price).
- Confirm your broker lets unsettled IRA sale proceeds fund same-day buys
  (Fidelity usually does); if not, buy the day after each sell.
