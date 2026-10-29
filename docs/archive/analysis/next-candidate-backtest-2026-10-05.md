# Next Darwin Candidate — Backtest & Screen

Date: 2026-10-05 | Universe: 77 single stocks in DB | Window: 2021-01-04 → 2026-10-05 (~5.75 yrs)
Framework: Pulak Prasad "Investing from Darwin" (survive first, compound quality, buy on temporary weakness).

---

## Executive Summary

Across the tracked universe, ranking on **real risk-adjusted return (Sharpe)** plus the Darwin quality overlay, the standout "next candidate" is **Lam Research (LRCX)** — highest ROCE in the shortlist (~52%), a near-fortress balance sheet (D/E 0.30, current ratio 2.63), no goodwill, strong cash conversion, 42% annualized return, and currently **~20% below its 52-week high** (a classic Darwin "quality on temporary cyclical weakness" setup). **Alphabet (GOOGL)** is the close runner-up and the lower-risk alternative (widest moat, 55% net margin, D/E 0.18), with the caveat of antitrust overhang and weaker FCF conversion.

---

## ⚠️ Methodology note (important)

The app's `BacktestEngine` reported returns that are **badly understated** — e.g. it reported KLAC buy-and-hold at +32% when the real move over the window was **+740%**. Root cause appears to be the engine deploying only a slice of capital per single-symbol run (and/or a report-layer bug in `total_return_pct`). **I did not rank on the engine's return figures.** Instead I computed returns, annualized return, true max drawdown, and Sharpe **directly from raw DB price history**, then overlaid fundamentals (ROE, net margin, ROCE, debt, FCF conversion). This is a tracked-universe screen, not a full S&P 500 scan — the DB holds 77 single names (mostly S&P 500 quality), not all 500. (A true 500-name backtest would require ingesting ~420 more tickers' price history first — flagged as an open item.)

---

## Top 20 by real risk-adjusted return (Sharpe)

| Rank | Sym | TotRet% | Ann% | Sharpe | MaxDD% | vs 52wk Hi% | ROE% | NetMgn% |
|------|-----|---------|------|--------|--------|-------------|------|---------|
| 1 | LLY | 631 | 41.4 | 1.23 | −34 | −10.7 | 102.3 | 33.5 |
| 2 | CAT | 414 | 33.0 | 1.07 | −34 | −20.4 | 57.0 | 14.5 |
| 3 | KLAC | 741 | 44.8 | 1.03 | −45 | −31.4 | 87.5 | 35.6 |
| 4 | PANW | 594 | 40.1 | 1.02 | −36 | 0.0 | 4.8 | 7.9 |
| 5 | LRCX | 665 | 42.5 | 0.97 | −56 | −20.2 | 65.1 | 31.3 |
| 6 | RSG | 144 | 16.8 | 0.95 | −23 | −7.8 | 18.2 | 12.9 |
| 7 | GOOGL | 305 | 27.5 | 0.94 | −44 | −13.9 | 48.7 | 54.8 |
| 8 | AMAT | 553 | 38.6 | 0.93 | −55 | −25.0 | 41.1 | 30.1 |
| 9 | TSM | 375 | 31.1 | 0.91 | −56 | 0.0 | 40.0 | 49.9 |
| 10 | ORLY | 177 | 19.4 | 0.88 | −23 | −19.9 | — | 14.3 |
| 11 | AMD | 584 | 39.7 | 0.88 | −65 | −0.3 | 10.2 | 15.6 |
| 12 | PLTR | 710 | 43.9 | 0.87 | −85 | −8.6 | 38.1 | 49.0 |
| 13 | COST | 157 | 17.9 | 0.85 | −31 | −15.6 | 29.2 | 3.0 |

(MSFT, your largest holding, sits at Sharpe 0.72, +150%, ann 17% — solid but mid-pack over this window; it was a steadier, lower-drawdown ride at −37% max DD.)

---

## Darwin "buy quality on weakness" shortlist

Filter: ≥10% below 52-wk high + Sharpe > 0.8 + ROE > 15% → then Kill List fundamentals.

| Sym | Ann% | Sharpe | vs52wHi% | NetMgn% | ROCE% | D/E | CurRatio | FCF/NI% | Goodwill |
|-----|------|--------|----------|---------|-------|-----|----------|---------|----------|
| **LRCX** | 42.5 | 0.97 | −20.2 | 31.3 | **52.0** | **0.30** | 2.63 | 67 | **no** |
| GOOGL | 27.5 | 0.94 | −13.9 | **54.8** | 41.8 | **0.18** | 2.72 | 22 | yes |
| KLAC | 44.8 | 1.03 | −31.4 | 35.6 | 48.1 | 0.97 | 2.88 | 78 | yes |
| AMAT | 38.6 | 0.93 | −25.0 | 30.1 | 36.2 | 0.30 | 2.51 | 61 | yes |
| LLY | 41.4 | 1.23 | −10.7 | 33.5 | 44.6 | 1.62 | 1.35 | 51 | yes |
| CAT | 33.0 | 1.07 | −20.4 | 14.5 | 22.4 | 2.33 | 1.37 | 83 | yes |
| COST | 17.9 | 0.85 | −15.6 | 3.0 | 30.4 | 0.24 | 1.07 | 100 | no |

---

## Recommendation: LRCX (primary), GOOGL (lower-risk alternative)

### Why LRCX
- **Best ROCE in the set (~52%)** — Darwin's core "survival fitness" metric; sustained high ROCE implies a real moat.
- **Near-fortress balance sheet**: D/E 0.30, current ratio 2.63, **no goodwill** (organic, not acquisition-inflated) — passes Kill List #2 (leverage) and #3 (serial acquirer) cleanly.
- **Down ~20% from its 52-wk high** = Darwin's preferred entry: a high-quality compounder on *temporary* (cyclical semicap) weakness, not a broken business.
- 42% annualized over the window with strong FCF conversion (67%).
- **Kill List caveat**: semiconductor capital equipment is cyclical (adjacent to #4 "rapidly-changing industry"). Mitigant: WFE is an oligopoly (LRCX/AMAT/KLAC/ASML) with structural secular demand (AI, advanced packaging). Treat the cyclicality as the *source* of the dip, not a disqualifier.

### Why GOOGL as the safer alternative
- **Widest moat + best net margin (55%)** and a **true fortress balance sheet (D/E 0.18)**.
- Only −14% from its high, lower business cyclicality than semicap.
- **Kill List caveats**: antitrust/regulatory overhang (ongoing cases), and FCF/NI conversion is only ~22% (heavy capex/SBC) — worth monitoring vs. Darwin's "cash cow" preference.

### How this fits your portfolio
- You already own CDNS, TXN (semi-adjacent) and MSFT, GOOGL-like mega-caps. **LRCX adds a best-in-class semicap compounder on a cyclical dip** — complementary to CDNS (EDA software) on the same AI/semis theme but a different layer of the stack.
- Sizing (Darwin): initiate small, add on further weakness only if the thesis holds. Don't chase; the −20% drawdown is the opportunity.

### Next step before buying (per deep-dive framework)
Run the full 10-dimension deep-dive on **LRCX** (and GOOGL) — Kill List, moat durability, Graham IV + margin of safety, insider activity — before committing capital. This screen identifies the candidate; the deep-dive confirms the buy.

---

## Open items
- [ ] Deep-dive LRCX + GOOGL (Kill List + Graham IV + margin of safety) before any purchase.
- [ ] Fix `BacktestEngine.total_return_pct` (understates returns ~20x on single-symbol runs) — the ranking had to bypass it.
- [ ] Optional: ingest full S&P 500 price history for a true 500-name screen.
