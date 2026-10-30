# Final Allocation Decision — Aggressive-Diversified Core + Satellite

Date: 2026-10-30 | Owner: fengxia | Status: TARGET SET (execution pending)

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
