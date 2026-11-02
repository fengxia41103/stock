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

## MONDAY 2026-11-03 — one-time block

> Rule of the day: **do all SELLS first, then BUYS** so settled cash is
> available. Trade ETFs **after ~9:45 AM**. All $ are from 2026-10-30 prices —
> recompute shares at the screen (amount ÷ live price). This includes the
> Week-1 SPYG tranche (see the staged section below) done the same session.

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

### Step 2 — BUYS (after sells settle) · deploys ~$74,325

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

### Cash flow for the day

| Bucket | Cash in | Cash out |
|--------|--------:|---------:|
| Step 1 sells | +$86,875 | — |
| Step 2 buys | — | −$74,325 |
| Step 3 (SPYG sell − buys) | +$44,029 | −$44,064 |
| **Net** | **~+$12,515 left as cash** (rolls to Week-2) | |

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
