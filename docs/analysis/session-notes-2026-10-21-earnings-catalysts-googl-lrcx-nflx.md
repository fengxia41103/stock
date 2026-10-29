# Session Notes — Earnings Catalysts & Watchlist Resolution

Date: 2026-10-21 (Wed) | Framework: Pulak Prasad, *Investing from Darwin* + Benjamin Graham valuation

> Both earnings catalysts flagged in the Oct-17 open items (NFLX, LRCX) have now reported. This session resolves the watchlist, downgrades NFLX, greenlights an LRCX starter, and sets a staged GOOGL add plan around its Oct-28 print.

---

## 0. Data Update (this session)

- **Fidelity import** (`import_fidelity_csv`, `Portfolio_Positions_Oct-21-2026.csv`): 16 price records written for 2026-10-21; **0 position changes** (book already matched). Skipped money-market (FDRXX/SPAXX/CORE) + untracked NHX202764.
- **Remaining universe** refreshed via yfinance worker (`MyStockHistoricalYahoo`): 63 of 79 tracked names backfilled to 2026-10-21. **All 79 now have a 2026-10-21 close.** 0 failures.

### Portfolio snapshot (open positions, by market value — total ~$280K equity)

| Sym | MV | Weight |
|-----|------|--------|
| MSFT | $79,676 | 28.4% |
| VOO | $52,188 | 18.6% |
| MA | $23,101 | 8.2% |
| V | $19,016 | 6.8% |
| RCL | $16,432 | 5.9% |
| PDD | $11,307 | 4.0% |
| SBUX | $11,085 | 4.0% |
| **GOOGL** | **$9,738** | **3.5%** |
| LIN | $9,010 | 3.2% |
| PG | $8,751 | 3.1% |
| PLTR | $8,674 | 3.1% |
| TXN | $8,540 | 3.0% |
| TSM | $7,200 | 2.6% |
| PEP | $6,713 | 2.4% |
| MCD | $4,575 | 1.6% |
| SPGI | $4,362 | 1.6% |

Concentration flag: MSFT + VOO ≈ **47%** of equity. Payments cluster (MA+V+SPGI) ≈ 16.6%.

---

## 1. NFLX — thesis-brake confirmed → DOWNGRADE to WATCH (no starter)

Oct-17 rating was "BUY (starter), confirm growth at earnings." It reported **Q3 2026 (Oct-20 after close)**:

- EPS beat ($0.87 vs $0.82), but **Q4 revenue guidance missed**, **2026 ad-revenue target cut $3.0B → $2.7B**, management conceded **view-hours growth is slowing**.
- Analyst read: "fourth quarter in a row guidance came in lighter on at least one metric."
- DB price **$65.04** (−5.3% on the day), down ~11% from the $72.82 deep-dive price — now *below* the ~$73 Graham IV.

**Verdict:** the "confirm growth" condition FAILED. Per the refreshed rule — *a big % drop is not a margin of safety when earnings reveal fundamental deceleration* — the cheaper price is a trap, not an entry. **NFLX → WATCH/avoid.** Revisit only after ≥1–2 quarters of re-accelerating growth. No capital.

## 2. LRCX — thesis confirmed → GREENLIGHT small starter

Oct-17 rating was "BUY-ON-WEAKNESS, start small (above Graham IV); re-check WFE guide after the ~Oct-22 print." **Correction: LRCX reported today, Oct-21** (2 p.m. PT), not Oct-22.

- **Beat on both:** EPS $2.20 vs $2.18, revenue $8.22B vs $8.14B (quarter ended Sep-27-2026). Continues a multi-quarter beat streak.
- DB price **$260.81**, *below* the $272 deep-dive price — cheaper AND thesis-confirmed.

**Verdict:** cleanest actionable setup. Highest ROCE in the shortlist (~52%), fortress balance sheet, no goodwill, Darwin PASS, WFE up-cycle now earnings-confirmed. KLAC exit (Oct-15) left the semicap slot open; LRCX is the chosen single semicap expression over AMAT (corr ~0.49 — don't double semicap beta). **Action: initiate a small LRCX starter, room to add on further weakness.**

### After-hours reaction (same day, ~5 p.m. ET) — stock DROPPED ~5–6%

Despite the beat, LRCX fell to ~**$243–247** after hours (from the $260.81 regular close). Reasons — a sentiment/expectations reaction, **not a thesis break**:

1. **Beat was razor-thin** — EPS $2.20 vs $2.18 (+0.9%); reportedly **missed the "whisper number."** Too small to justify a stretched valuation.
2. **Guidance only in-line, not a raise** — Dec-quarter guide ~$8.6B rev / ~$2.33 EPS midpoint, "roughly in line." For a stock priced on AI-capex *acceleration*, in-line = deceleration of the beat-and-raise cadence.
3. **Context: already −24% over the prior two weeks** on "AI-capex peaking" fears. An in-line guide neither confirmed nor refuted that fear, so the de-rating stands.

**Fundamentals were actually strong:** record revenue/profit, operating margin **40%** (up from 34.4%), **FCF margin 39.4%** (up from 29.9%), inventory days down 106 from 120. No Kill-List trigger, moat intact, FCF conversion *improved*.

**New risk flag:** "AI-capex peaking" is now a live, market-wide debate; LRCX's in-line guide left it unresolved. This is a reason to keep the starter **genuinely small** and let the acceleration question resolve over 1–2 quarters before sizing up — not a reason to skip it.

**Net on timing:** the drop *improves* the entry (~10% below the $272 deep-dive price) — the classic Darwin "quality on temporary weakness." Prefer to initiate **after the dust settles (next regular session / post-call)** rather than chasing tonight's after-hours print.

## 3. GOOGL — already held, under-weight for conviction → staged ADD around Oct-28

**Position (DB):** 29.090 sh @ $343.75 avg | price $334.76 | MV ~$9,738 | **−2.6%** vs cost | **3.5%** of equity.

Oct-15 deep-dive: **8.0/10, "BUY — best quality/value on the watchlist," a core holding to size *larger* than TSM** (no catastrophic tail). Thesis intact; the −2.6% is noise, not a signal.

### Graham IV refresh at today's price
Normalized annual EPS ~$9.11 (one-time paper gain stripped), Y = 6.30% AAA. IV is price-independent; only MoS changes:

| g | Graham IV | MoS @ $348.59 (deep-dive) | MoS @ $334.76 (now) | MoS @ $343.75 (cost) |
|---|-----------|---------------------------|---------------------|----------------------|
| 14% | $232 | −33% | −31% | −32% |
| 18% | $283 | −19% | −15% | −18% |
| 20% | $309 | −12% | **−8%** | −10% |
| 22% | $334 | −4% | **−0.2%** | −3% |

Read: on strict Graham it still screens expensive (needs ~22% growth to clear price), consistent with the deep-dive's "cheap mega-cap on PEG ~0.92, not a classic Graham bargain." But the entry **improved ~4%** since the deep-dive and GOOGL is now **−18% from its 52-wk high** (~$408) vs −13% then — the technical reservation ("no dip on offer") has partly resolved.

### Sizing logic
At 3.5%, GOOGL is the **most under-weight high-conviction name** in the book — smaller than RCL (5.9%) and barely above the two do-not-add laggards (PDD/SBUX ~4%). The deep-dive said size it larger than TSM (2.6%). Clear room to add without creating concentration (unlike adding to MSFT at 28%).

### The binary: Q3 earnings **Oct-28** (after close, ~7 days out)
Capex-sensitive. Last quarter Alphabet *raised* capex guidance and the stock fell ~6%. Both documented brakes (AI-capex → FCF conversion ~22%; antitrust overhang) are earnings-sensitive. Same patience discipline just applied to NFLX/LRCX: **don't lump full size into a known binary.**

**Plan:**
- Already anchored (hold a base), so no need to rush a partial in to establish the position.
- **Preferred: wait for Oct-28.** Confirm → add into validated thesis; another capex scare + dip → add cheaper. Either way, adding to an existing holding, not timing an initiation.
- Target: bring GOOGL from ~3.5% toward **~5–6%** (roughly double, over 1–2 tranches). Do **not** let the −2.6% drive the decision.
- Thesis-break sell rule (unchanged): AI structurally erodes Search faster than Cloud/YouTube offset, OR antitrust remedies materially break the model — not a soft ad quarter or continued capex.

---

## 4. Everything else — stay lazy, no changes

- **TSM $431.89** (+2.9% day): quality, fair price, size down for geopolitical tail. Accumulate on weakness, no catalyst today.
- **AMAT $408.94:** not chosen (LRCX is the semicap slot). WATCH.
- **PDD $78.72 / SBUX $99.08:** both still fail the Darwin gate (value trap / negative-equity turnaround). Do-not-add stands. SBUX near but not at the $105–108 trim zone.
- **MSFT $532.95** (28% weight): no action; Darwin "do nothing." Watch concentration.
- Cash stays a position until a name lands in a true green-light cell.

---

## 5. Open Items / Next Session

- [ ] **Execute LRCX starter** — small; semicap slot; thesis earnings-confirmed. Stock dropped ~5–6% after hours (~$243–247) on in-line guide / thin beat amid "AI-capex peaking" fears — **better entry; wait for the dust to settle post-call (next regular session) rather than chasing after-hours.** Keep it small until the AI-capex-acceleration question resolves over 1–2 quarters.
- [ ] **GOOGL: add after Oct-28 print** (or on a capex-scare dip) toward ~5–6% weight, staged.
- [ ] Re-pull LRCX + NFLX financial statements now that both reported; refresh their fundamental rows.
- [ ] **Watch Oct-28:** GOOGL Q3 — capex guide + Cloud growth are the swing factors.
- [ ] Reconsider MSFT/VOO concentration (~47% combined) on any future rebalance.
- [ ] Carried: fix `BacktestEngine.total_return_pct` (~20x understated on single-symbol runs); `make backfill-financials` for multi-year ROCE; decide 8-K ingestion; optional full-S&P-500 price ingest.

---

*Darwin: survive first, compound quality, be lazy. NFLX failed its growth confirmation → out. LRCX passed → act small. GOOGL is intact and under-sized → add, but stage it around the Oct-28 catalyst rather than lumping in ahead of a capex-sensitive print.*
