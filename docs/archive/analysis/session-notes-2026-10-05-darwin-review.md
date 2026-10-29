# Session Notes — Darwin Framework Portfolio Review

Date: 2026-10-05 | Investor framework: Pulak Prasad, *What I Learned About Investing from Darwin*

---

## 1. Portfolio Update (Fidelity → DB)

Imported `Portfolio_Positions_Oct-05-2026.csv` via `python manage.py import_fidelity_csv`.

- **Prices**: 16 historical records written for 2026-10-05 (MSFT, VOO, MA, V, PDD, CDNS, SBUX, LIN, TXN, PG, PEP, RCL, MCD, SPGI, PLTR).
- **Position changes (Rollover IRA)**:
  - MA: 22.939 → 37.103 shares, avg cost $523.09 → $539.01 (added)
  - V: 19.456 → 46.626 shares, avg cost $308.38 → $343.15 (roughly doubled)
- Skipped: money market (FDRXX) + untracked funds (VEIRX, JOBYX, WSVABX, NHX202764).

### Portfolio snapshot
- Concentration: MSFT ~24% ($78.5K), VOO ~16% ($52.3K), cash/MM ~16.5% ($53.5K). Payments tilt increasing (V + MA + SPGI).
- Winners: VOO +78%, MSFT +48%, CDNS +13%, V +8%, MA +5%.
- Laggards: PDD −25%, SBUX −18%, LIN −0.4%.

---

## 2. Darwin Strategy (reference)

**One line:** Avoid bad companies at all costs. After buying good ones, avoid selling at all costs.

**Three pillars:**
1. Avoid big risks — run the 10-item Kill List *before* any analysis; any trigger → reject.
2. Buy quality (sustained ROCE >15%, moat, honest/able management, cash cow, self-funding growth) at a fair price (margin of safety, not precise DCF).
3. Be very lazy — 95% do nothing, 5% act decisively. Sell only on: moat permanently impaired, management integrity breach, or thesis proven wrong. Never sell on a short-term miss or because price dropped.

---

## 3. Deep-Dive Verdicts (the two laggards)

Full reports:
- `docs/analysis/PDD/pdd-deep-analysis-2026-10-05.md`
- `docs/analysis/SBUX/sbux-deep-analysis-2026-10-05.md`

### PDD — ~5.5/10 — HOLD, do not add (value trap)
- Elite financials: ROCE ~29.5%, net cash ~RMB431B, FCF ≈ net income, zero goodwill, cheap (9x trailing, PEG 0.73). Graham IV MoS ~+48% at conservative growth.
- **BUT fails Darwin gate on 3 Kill List triggers:** #9 VIE/ADR opacity, #4 rapidly-changing + regulation-hit Temu (US/EU de minimis end, EU €232.5M fine), #6 misalignment (largest net-cash pile of any public co paying NO dividend & NO buyback; founder dual-class control).
- Synthesis: Graham PASS + Darwin FAIL = cheap for a reason. Don't average down. Thesis-break sell = Temu-driven reported loss OR VIE/delisting escalation.

### SBUX — ~4.2/10 — HOLD / do not add, trim candidate
- Turnaround under Niccol is real: comps +6.2% (reversed 7 down quarters) → N.A. +8.1%; FY26 guide raised.
- **BUT fails Darwin gate on 2 Kill List triggers:** #2 high leverage (negative equity −$7.67B, net debt/EBITDA 4.44, current ratio 0.76), #5 turnaround.
- Expensive (61x trailing / 36x fwd); Graham IV ~$35–62 vs $94 price = negative MoS. Dividend consumed 142% of earnings / 113% of FCF FY25 → cut risk. Insider selling cluster (CEO International, repeatedly, near highs).
- Synthesis: Graham FAIL + Darwin FAIL = avoid. Trim into rallies toward $105–108; hard exit if dividend cut or comps roll negative.

**Both laggards are "don't-add" for structural reasons, not because they're down. Recent adds (V, MA) are far better Darwin fits.**

---

## 4. Data Pipeline Notes (for future runs)

- **Prices**: `make` → `docker compose exec web python manage.py shell -c "from stock.tasks import price_daily; price_daily()"` (yfinance, all tracked `MyStock`). Or `import_fidelity_csv` for a point-in-time snapshot from a Fidelity export.
- **10-K**: `Filing10KWorker(symbol).get(years=N)` in `workers/get_10k.py`. Requires `pip install edgartools` + `SEC_EDGAR_USER_AGENT` env. Not scheduled; run per symbol. Model: `Filing10K` (unique per stock+fiscal_year).
- **8-K**: NOT supported — no model, no worker. Would need a new model + migration + worker (schema change; get sign-off before building).
- **Backtesting**: `BacktestEngine(strategy, symbols, start, end, cash).run()`. Strategies: box_trading, buy_and_hold, darwin_rsi, earnings_beat, golden_cross, insider_cluster, low_pe_value, mean_reversion, momentum_trailing, post_earnings_drift, volatility_breakout. **Only works on symbols already in DB with price history.**
- **Universe**: DB tracks 81 names (mostly S&P 500 / high-quality). A true full-S&P-500 backtest requires ingesting ~420 more tickers' price history first.

---

## 5. Open Items / Next Session

- [ ] Backtest tracked universe (darwin_rsi + buy_and_hold) to rank next candidate.
- [ ] Decision needed: build 8-K ingestion (new model + worker)?
- [ ] Decision needed: ingest full S&P 500 price history for a true 500-name backtest?
- [ ] Consider `make backfill-financials` to get multi-year ROCE trend (DB currently has ~1 full annual row per stock).
