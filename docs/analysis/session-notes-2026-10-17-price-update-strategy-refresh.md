# Session Notes — Price Update & Strategy Refresh

Date: 2026-10-17 (Sat) | Investor framework: Pulak Prasad, *What I Learned About Investing from Darwin* + Benjamin Graham valuation

---

## 1. Price Update (yfinance → DB)

Brought the stack up (`db`, `redis`, `web`, `celery`) and ran the daily price pipeline:

```
docker compose exec web python manage.py shell -c "from stock.tasks import price_daily; price_daily.delay()"
```

- **Result:** 80/80 `__price_single` tasks succeeded, 0 failed (fan-out on the `price` queue via Celery `group`). Denormalized fields + news refreshed per symbol.
- **Latest trading bar:** 2026-10-16 (Fri). Today is Saturday → markets closed, so no newer bar exists; the run re-confirmed Yahoo had nothing beyond Friday's close. This is expected, not a gap.
- Stack left running per request.

### Candidate closes (2026-10-16)

| Sym | Close | vs the Oct-15 deep-dive price |
|-----|-------|-------------------------------|
| GOOGL | $340.59 | ~$348.59 → slightly lower |
| TSM | $412.61 | ~$417 → slightly lower |
| LRCX | $263.94 | ~$272 → lower (still oversold) |
| AMAT | $409.29 | ~$427 → lower |
| NFLX | $70.53 | ~$72.82 → lower (now marginally below Graham IV ~$73) |
| MSFT (held) | $529.05 | — largest position |

Nothing here changes a verdict; the semicap names and NFLX drifted a touch lower, which only reinforces "scale-in" / "starter" sizing rather than full-size entries.

---

## 2. Strategy Refresh (Agents.md → Investment Philosophy)

Codified the refinements that the Oct-15 deep-dives (LRCX, AMAT, GOOGL, TSM, NFLX) had been applying in practice but that weren't yet written into the framework.

### Added: Graham + Darwin Valuation Synthesis (the "pay-up" rule)
A 2×2 crossing Darwin quality (WHAT to own) with Graham margin-of-safety (the PRICE):
- Darwin PASS + Graham PASS = buy (the rare "both agree" quadrant — NFLX).
- **Darwin PASS + Graham FAIL = buy only if price is >25% below Graham IV; otherwise WATCH** (the quality-but-expensive case — LRCX/AMAT/GOOGL/TSM).
- Darwin FAIL + Graham PASS = classic value trap, avoid (PDD, SBUX).
- Darwin FAIL + Graham FAIL = avoid.
- Key fallout rules: a big % drop is **not** a margin of safety if the stock fell *from a bubble* (RSI-oversold ≠ Graham-cheap); normalize EPS before computing IV (strip one-time gains — GOOGL); for quality-growth names failing strict Graham, PEG/PE-vs-own-history is the secondary read; never relax the Darwin gate to justify a cheap price.

### Added: four new Documented Lessons
- **LRCX / AMAT** — the inverse-of-a-value-trap: oversold (RSI 30/33, −37%/−41%) but still above Graham IV because they fell from a bubble → scale-in trigger, not backup-the-truck.
- **NFLX** — first Graham PASS of the series, but a *fundamental* decline + new #9 transparency demerit (stopped disclosing sub counts) + insider cluster selling → starter only, confirm growth at earnings.
- **TSM** — best business, fair price, but un-hedgeable geopolitical tail → size *below* quality (Darwin Pillar 1); quality sizing and risk sizing are separate decisions.

### Added: Active Candidate Watchlist table
Ranked by deep-dive score, all five PASS the Kill-List gate, each with its one brake:

| Sym | Score | Rating |
|-----|-------|--------|
| GOOGL | ~8.0 | BUY (quality at a fair price) — size larger, no catastrophic tail |
| TSM | ~8.0 | BUY (quality), size down for geopolitical tail |
| LRCX | ~7.5 | BUY-ON-WEAKNESS, start small (above Graham IV) |
| AMAT | ~7.5 | BUY-ON-WEAKNESS, start small (cheaper of the pair) |
| NFLX | ~7.0 | BUY (starter), confirm at earnings |

Portfolio note recorded: **KLAC exited 2026-10-15**, so semicap exposure is open — re-establish via the higher-conviction of LRCX/AMAT (corr ~0.49; don't double semicap beta).

---

## 3. Open Items / Next Session

- [ ] **NFLX + LRCX earnings** — both had imminent prints at deep-dive time (NFLX Q3; LRCX ~Oct 22). Re-pull prices/statements after they report and re-check the growth thesis (NFLX) and the WFE acceleration guide (LRCX) before sizing up.
- [ ] Decide the single semicap expression (LRCX vs AMAT) rather than holding both at full size.
- [ ] Carried from Oct-05: fix `BacktestEngine.total_return_pct` (understates single-symbol returns ~20x); decide on 8-K ingestion; optionally ingest full S&P 500 price history for a true 500-name screen.
- [ ] Carried from Oct-05: `make backfill-financials` for a multi-year ROCE trend (DB holds ~1 full annual row/stock).

---

*Darwin: survive first, compound quality, be lazy. This session was maintenance + codifying the valuation discipline — the watchlist is set, the gate is tighter, and cash stays a position until a name lands in a true green-light cell.*
