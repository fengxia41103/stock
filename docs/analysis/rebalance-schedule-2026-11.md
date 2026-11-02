# Rebalance Execution Schedule — Staged

Created: 2026-11-01 | Revised 2026-11-01 (cash-funded, +1 week) | Account:
Rollover IRA 230806312 (tax-free to rebalance) | Prices ~2026-11-01

> Execution mechanics, not investment advice. Order types are general best
> practice for liquid ETFs/stocks; limit prices and tranche sizes are your call
> at the screen. This is a PRE-COMMITTED schedule, not a "wait for recovery"
> condition — follow the cadence regardless of short-term price moves.

## Principle
- The big SPYG→diversified shift is **staged over 4 weeks** to avoid dumping
  $176K into last week's weakness in one shot — a fixed schedule, not a timing
  bet. If SPYG bounces you capture some; if it falls you've de-risked some.
- The one-time trades (loser sells, MSFT/TSM trims, LRCX start, and the
  EM/mid/REIT buys) go **Monday 2026-11-10** — no reason to stage these.
- **Cash funding:** the IRA holds ~$54,530 cash (FDRXX, ~10% vs a 3% target).
  Use the ~$39.5K excess to FUND the diversifying buys so nothing waits on sale
  settlement. Cash does NOT cancel the thesis sells and does NOT replace the
  SPYG trim (only selling SPYG cuts the large-cap-growth overweight). Keep ~$15K
  as the cash sleeve.
- **Schedule shifted out one week** from the original 2026-11-03 start.

## Order-type cheatsheet
- **ETF buys/sells**: market or marketable-limit. Trade **after ~9:45 AM**
  (avoid the opening-bell wide spreads; matters most for VEA/VWO).
- **Large SPYG sells**: marketable-limit; fine as one order per week at ~$44K.
- **Loser sells (PDD/SBUX)**: just execute — don't anchor on cost.
- **LRCX start**: **limit** at/just below the open (~$232-234). No urgency;
  don't chase.
- **Sequencing**: sells before buys; the cash buffer means no same-day
  settlement risk either way.

---

## MONDAY 2026-11-10 — one-time block

> Rule of the day: **do all SELLS first, then BUYS**. With ~$54.5K IRA cash on
> hand the buys are fully funded regardless of settlement, so there's no
> same-day settlement risk. Trade ETFs **after ~9:45 AM**. All $ are from
> ~2026-11-01 prices — recompute shares at the screen (amount ÷ live price).
> This includes the Week-1 SPYG tranche (see the staged section below) done the
> same session.

### Step 1 — SELLS (do these first) · raises ~$86,875

| # | Ticker | Action | Order type | Amount | Why |
|---|--------|--------|-----------|-------:|-----|
| 1 | PLTR | Sell ALL | market/marketable-limit | ~$7,949 | Take profit (unplanned winner) |
| 2 | PDD | Sell ALL | market — don't anchor on cost | ~$11,318 | Loser, Darwin gate fail |
| 3 | SBUX | Sell ALL | market — don't anchor on cost | ~$11,663 | Loser, Darwin gate fail |
| 4 | MCD | Sell ALL | market/marketable-limit | ~$4,810 | Fold into index core |
| 5 | MSFT | TRIM to $30K cap | marketable-limit | ~$47,912 | Enforce per-name cap |
| 6 | TSM | TRIM to $3.5K | marketable-limit | ~$3,223 | Geopolitical-tail down-size |
|   |   |   | **Sells subtotal** | **~$86,875** |   |

### Step 2 — BUYS (funded by cash on hand) · deploys ~$74,325

| # | Ticker | Action | Order type | Amount | Notes |
|---|--------|--------|-----------|-------:|-------|
| 7 | LRCX | START (new) | **limit ~$232-234**, don't chase | ~$5,500 | ~24 sh; room to add lower later |
| 8 | VWO | Buy | marketable-limit, after 9:45 | ~$27,549 | Emerging markets |
| 9 | VO | Buy | marketable-limit, after 9:45 | ~$21,692 | US mid cap |
| 10 | VNQ | Buy | marketable-limit, after 9:45 | ~$19,584 | REIT / real assets |
|   |   |   | **Buys subtotal** | **~$74,325** |   |

### Step 3 — Week-1 SPYG tranche (same session) · see staged section

| # | Ticker | Action | Order type | Amount |
|---|--------|--------|-----------|-------:|
| 11 | SPYG | SELL tranche 1 of 4 | marketable-limit | ~$44,029 |
| 12 | VEA | Buy | after 9:45 | ~$24,480 |
| 13 | BND | Buy | after 9:45 | ~$12,240 |
| 14 | VB | Buy | after 9:45 | ~$7,344 |

### Cash flow for the day (with the ~$54.5K IRA cash in play)

| Bucket | Cash in | Cash out |
|--------|--------:|---------:|
| Starting IRA cash (FDRXX) | +$54,530 | — |
| Step 1 sells | +$86,875 | — |
| Step 2 buys | — | −$74,325 |
| Step 3 (SPYG sell − buys) | +$44,029 | −$44,064 |
| **End cash** | **~$67,045** (buys fully cash-covered on the spot) | |

The over-target cash is absorbed as the Weeks 2-4 SPYG tranches buy more
VEA/BND/VB; trim toward the ~3% (~$15K) cash sleeve by the final week.

### Monday step checklist
- [ ] 1. Sell PLTR (all)
- [ ] 2. Sell PDD (all)
- [ ] 3. Sell SBUX (all)
- [ ] 4. Sell MCD (all)
- [ ] 5. Trim MSFT → $30K cap
- [ ] 6. Trim TSM → $3.5K
- [ ] 7. Start LRCX (limit ~$232-234)
- [ ] 8. Buy VWO
- [ ] 9. Buy VO
- [ ] 10. Buy VNQ
- [ ] 11. Sell SPYG tranche 1 (~$44,029)
- [ ] 12. Buy VEA · 13. Buy BND · 14. Buy VB
- [ ] After close: GET /api/v1/portfolio/allocation/ to confirm drift closing

---

## WEEKS 1-4 — staged SPYG reallocation (~$44K/week)

Each Monday (2026-11-10, 2026-11-17, 2026-11-24, 2026-12-01), repeat:
- **SELL SPYG ~$44,029**
- **BUY VEA ~$24,480** (international developed)
- **BUY BND ~$12,240** (bonds)
- **BUY VB ~$7,344** (US small cap)

| Week | Date | SPYG sell | VEA | BND | VB |
|------|------|----------:|----:|----:|---:|
| 1 | Mon 2026-11-10 | $44,029 | $24,480 | $12,240 | $7,344 |
| 2 | Mon 2026-11-17 | $44,029 | $24,480 | $12,240 | $7,344 |
| 3 | Mon 2026-11-24 | $44,029 | $24,480 | $12,240 | $7,344 |
| 4 | Mon 2026-12-01 | $44,029 | $24,480 | $12,240 | $7,344 |
| **Total** | | **$176,117** | $97,920 | $48,960 | $29,376 |

## After completion (target end-state)
Satellite ~30% (12 names, each ≤$30K: MSFT, MA, V, RCL, LIN, PG, TXN, GOOGL,
PEP, SPGI, LRCX, TSM). Core ~70% diversified index (VOO/VO/VB/VEA/VWO/BND/VNQ).
Whole portfolio ~90% equity / 10% bonds.

## Checklist
- [ ] Mon 2026-11-10: one-time block + Week-1 SPYG tranche
- [ ] Mon 2026-11-17: Week-2 tranche
- [ ] Mon 2026-11-24: Week-3 tranche
- [ ] Mon 2026-12-01: Week-4 tranche (final)
- [ ] After each: GET /api/v1/portfolio/allocation/ to confirm drift closing
- [ ] If SPYG moves a lot, DO NOT change the cadence — the point is to not time it

## Caveats
- Dollar amounts are from ~2026-11-01 prices; share counts shift with the
  execution-day prices. Recompute shares at the screen (amount ÷ live price).
- With ~$54.5K IRA cash, buys don't depend on sale settlement — but still do
  sells first out of habit; proceeds also settle tax-free in the IRA.

## Warm-up validation week (2026-11-03 → 11-07)
Before executing a ~$260K two-sided shift, spend the week feeding **daily
position + price updates** to sanity-check the plan against live data:
- Update prices + re-import the Fidelity positions CSV each day.
- Re-check the per-name $ (esp. MSFT trim size, SPYG tranche, LRCX entry) and
  the allocation drift (GET /api/v1/portfolio/allocation/) against targets.
- Confirm no thesis changed (earnings, news) that should alter a sell/buy.
- If the numbers hold up through the week, execute the one-time block + Week-1
  tranche on **Mon 2026-11-10** as scheduled. If something material shifts,
  revise here first.
