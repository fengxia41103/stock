# Final Allocation Decision — Aggressive-Diversified Core + Satellite

Date: 2026-10-30 | Owner: fengxia | Status: SUPERSEDED by 2026-11-01 revision (see end)

> Analysis, not advice. Targets are the user's chosen plan; the buy/sell/size
> calls are the user's. Prices as of 2026-10-30.

## Decision

Stay **aggressive** (10-yr working horizon, still contributing) but fix the
**single-factor concentration** that the Oct-30 selloff exposed (≈70% in US
large-cap growth). Structure: **core + satellite**.

- **90% equity / 10% bonds** — more aggressive than the Fidelity "Aggressive
  Growth" proposal (85/15), but diversified across size + geography.
- **Core ~75%**: diversified index ETFs.
- **Satellite ~25%**: individual conviction names, each capped ~$30K so no
  single name (MSFT) recreates the concentration.
- Trim the losers (PDD, SBUX) entirely; fold steady compounders
  (SPGI/LIN/PG/PEP/MCD) into the core index.

## Whole-portfolio target (sums to 100)

| Sleeve | Target | Core ETF |
|--------|-------:|----------|
| US Large Cap | 41% | VOO (+ satellite large-caps) |
| US Mid Cap | 10% | VO (+ RCL) |
| US Small Cap | 6% | VB |
| International Developed | 22% | VEA |
| Emerging Markets | 6% | VWO (+ TSM) |
| Bonds / Fixed Income | 10% | BND |
| Real Assets / REIT | 3% | VNQ |
| Cash / Short Term | 2% | — |

Satellite (25%, capped ~$30K each): MSFT, MA, V, RCL, GOOGL, TXN, PLTR, TSM.
(LRCX is a pending add from the Oct-30 thesis work.)
> ⚠️ SUPERSEDED by the "Revised split: 70% core / 30% satellite" section below.
> In the governing final revision PLTR is a full EXIT (take profit) and is NOT
> in the satellite keep list. Use the keep list under the revised split.

## Backtest (allocation backtester, annual rebalance, 2020-2026 incl. 2022)

Window clipped to 2020 because PLTR IPO'd then (honest common history with the
satellite). Price-return, no fees/dividends.

| Plan | CAGR | Vol | MaxDD | Sharpe | 2022 |
|------|-----:|----:|------:|-------:|-----:|
| Current (concentrated) | 16.7% | 17.8% | 26.1% | 0.73 | −19.8% |
| **Aggressive-Diversified (this plan)** | **14.3%** | **15.0%** | 26.7% | 0.70 | −18.6% |
| Advisor (85/15) | 11.8% | 13.8% | 24.2% | 0.59 | −17.2% |

Read: this plan sits between — keeps most of the growth (14.3 vs 16.7 CAGR),
cuts volatility (15.0 vs 17.8), near-identical risk-adjusted return (Sharpe
0.70 vs 0.73). The diversification payoff is mainly lower volatility and not
betting the whole book on one factor continuing to lead — not a dramatic 2022
rescue (2022 hit everything).

## DIY execution list (IRA — tax-free to rebalance)

SELLS (~$216K raised):
- SPYG trim ~$159K (US-large core 262K → 103K; keep VOO)
- MSFT trim ~$48K (→ $30K satellite cap)
- PDD, SBUX: sell all (~$23K) — the planned loser trim
- SPGI, LIN, MCD, PEP, PG: sell all (~$35K) → fold into index core

BUYS (~$230K deployed):
- VEA (intl developed) ~$108K  ← biggest gap: 0% → 22%
- BND (bonds) ~$49K  ← 0% → 10%
- VO (US mid) ~$49K · VB (US small) ~$29K · VWO (EM) ~$29K · VNQ (REIT) ~$15K

KEEP (satellite): MSFT $30K, MA $24K, V $19K, RCL $17K, GOOGL $8K, TXN $9K,
PLTR $8K, TSM $7K.

## Caveats
- Backtest is price-return (no dividends → understates bonds/diversified side),
  no fees/taxes, 6-yr window. Treat decimals as approximate; trust direction.
- Satellite names carry single-stock risk; the cap limits but doesn't remove it.
- Plan to raise bonds toward 20-25% on a glide path as 2036 approaches.

## Next
- [ ] Execute the trades (user's call, staged).
- [ ] Add LRCX starter (Oct-30 thesis confirmed).
- [ ] Track drift via GET /api/v1/portfolio/allocation/ after execution.

---

# REVISION — 2026-11-01: 70/30, retain quality winners + TXN

Status: TARGET SET (execution pending; LRCX to be bought Mon 2026-11-03).

## What changed and why
Reviewing the 10-30 plan, the user flagged that the 75/25 cut folded four
**quality winners** into the core: LIN (+6.4%, rev +9.2% YoY), SPGI (+14.7%,
+6.8%), PG (+13.5%, +4.0%), PEP (−1.5%, +5.6%). All are green/growing at
reasonable multiples — and crucially **non-tech** (industrials, financial-data,
staples), so they *diversify* the satellite rather than concentrate it. Selling
them would have made the remaining satellite MORE tech-heavy. Decision: keep.

**TXN retained — thesis checked against past verdicts** (diaries 2026-06-22,
08-04/05/07/10, 08-30): analog duopoly (TXN+ADI), doesn't follow Moore's law so
the competitive structure is stable for decades; 300mm wafer cost advantage =
"10-year moat"; 25-35% ROCE; entered Aug-2026 in tranches on the inventory-cycle
turn. Aug-30 hold check: rev +16.6% YoY, 6/7 earnings beats, kill-criterion
(rev decline >10% for 3+ qtrs) NOT triggered. Clean quarterly data now shows
revenue still reaccelerating. Thesis is panning out → keep.

**PLTR — full EXIT (take profit, NOT retained)** — user: "one-off win, never
planned"; no entry thesis in the diaries; +675% = outsized single-stock risk.
Sell the entire position; PLTR is dropped from the satellite keep list (it does
NOT get a capped slice). **PDD, SBUX** sold entirely (losers failing the Darwin
gate). **MCD** folds into core.

## Revised split: 70% core / 30% satellite
Keeping all 11 conviction names at current size (MSFT capped $30K) lands the
satellite at ~29.4%. Chosen 70/30 rather than forcing 25% — the user is an
active, thesis-driven picker, and 30% across 11 diversified-sector names is an
active sleeve, not a concentration risk. The real fix (killing the SPYG/growth
over-weight) is unchanged.

## Revised whole-portfolio target (sums to 100)
| Sleeve | Target |
|--------|-------:|
| US Large Cap | 42% |
| US Mid Cap | 8% |
| US Small Cap | 6% |
| International Developed | 20% |
| Emerging Markets | 7% |
| Bonds / Fixed Income | 10% |
| Real Assets / REIT | 4% |
| Cash / Short Term | 3% |

Satellite (30%, ≤$30K/name): MSFT, MA, V, RCL, LIN, PG, TXN, GOOGL, PEP, TSM,
SPGI. (+ LRCX starter to add Monday.)

## Revised DIY execution list (IRA — tax-free; sells = buys = $259,769)
SELLS:
- SPYG trim ~$176K (US-large core 262K → 86K; keep VOO)
- MSFT trim ~$48K (→ $30K cap)
- PLTR ~$8K (take profit), PDD ~$11K, SBUX ~$12K (losers), MCD ~$5K (→ core)

BUYS:
- VEA (intl) ~$98K · BND (bonds) ~$49K · VB (small) ~$29K · VWO (EM) ~$28K
- VO (mid) ~$22K · VNQ (REIT) ~$20K · cash ~$15K

KEEP (satellite): MSFT $30K, MA $24K, V $19K, RCL $17K, LIN $9K, PG $9K,
TXN $9K, GOOGL $8K, PEP $7K, TSM $7K, SPGI $5K.

## Next
- [ ] Monday 2026-11-03: SWAP, not add — TRIM TSM $6.7K→$3.5K, START LRCX ~$5.5K
      (~24 sh @ ~$234). LRCX > TSM (lower geopolitical tail; peers on fundamentals).
      Keeps semi sleeve ~same size; satellite stays 29.9%. See diary 2026-11-01.
- [ ] Stage the rebalance; raise bonds toward 20-25% on a glide path toward 2036.

---

# NOTE — 2026-11-01: account for external DC plans (household view)

Private numbers intentionally omitted (kept out of the repo). The analysis lives
in `retirement/household_allocation.py`, which reads a gitignored
`my_inputs.json`.

Finding (no figures): the household view (brokerage/IRA + employer 401(k)/457)
still shows a large US-large-cap concentration because the brokerage account
dominates the book; the DC plans' bonds/international help only at the margin.
So this rebalance **stands**. The only adjustment is a slightly smaller bond
(BND) buy, since the DC plans already hold fixed income that counts toward the
household bond target. Run the script locally for the exact, private numbers.
