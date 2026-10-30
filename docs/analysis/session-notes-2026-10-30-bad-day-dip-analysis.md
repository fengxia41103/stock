# Session Notes — Bad-Day Dip Analysis & Statement Data Fix

Date: 2026-10-30 (Fri) | Framework: Pulak Prasad *Darwin* + Benjamin Graham

> A broad AI-capex selloff. Before judging hold-vs-buy, discovered the
> fundamental data was corrupted, fixed it, then ran the framework on clean
> post-earnings numbers. GOOGL and LRCX theses both CONFIRM; both are buys on
> this dip — staged and small. Analysis, not advice; the trade call is mine.

---

## 0. Data update (this session)

- Prices: `price_daily` -> all 80 names (79 stocks + SPYG) to 2026-10-30, 0 fails.
- Fidelity import (`Portfolio_Positions_Oct-30-2026.csv`): 18 prices, 0 position
  changes (book matches). NHX202764 cash code skipped.
- **Statement data FIX** (commit `6aa41ca`): the `StatementWorker` base class
  stored both yahooquery `3M` and `TTM` rows keyed on `(stock, asOfDate)`, so
  TTM rows OVERWROTE the quarterly rows with 12-month figures. GOOGL's "Q3"
  had shown $471B revenue (the TTM) instead of the true $127.6B quarter; older
  quarters zeroed out. Fixed by filtering `periodType == "3M"` (12M for annual).
  Re-fetched all 77 real stocks (3 ETFs have no statements), 0 failures.

## 1. The day — broad AI-capex selloff, not name-specific

Breadth 2026-10-30: 39/80 down, avg -0.86%. Worst: BFAM -19.3%, AMD -12.0%,
NET -10.9%, AMAT -8.4%, **LRCX -8.0%**, **TSM -6.6%**, KLAC -6.1%. The damage is
thematic semiconductors / AI-capex — the exact fear flagged Oct-21 flaring
again. The group sold off together; no individual thesis broke.

## 2. GOOGL — thesis CONFIRMED; dip is quality-on-weakness → staged ADD

Price $278.23, -19% vs cost, 1.7% weight (most under-weight high-conviction name).

Clean Q3 (2026-09-30) numbers:
- Revenue $127.6B, **+24.7% YoY**, +6.5% QoQ — ACCELERATING. Growth thesis intact.
- NI $26.5B / 20.7% margin (normalized). Q2's $112B was the one-time gain, stripped.
- **Clean trailing PE ~14.3** (TTM EPS $19.39) — NOT the denorm's 26.7. Even
  stripping the one-timer ~18-20x. Cheap for +24.7% growth.
- **Capex nearly doubled YoY: -$24B -> -$51B/qtr, now > OCF -> FCF negative
  (-$9.1B Q3).** This IS the capex scare, now quantified. Per the Cash-Flow
  Health Gate, negative FCF is acceptable ONLY with a capex-payback thesis —
  i.e. the AI-infrastructure bet. The crux and a genuine judgment call.

Verdict: Darwin PASS, growth confirmed, dip pre-authorized by the Oct-21 plan.
**Action: begin staged add toward 5-6% (from 1.7%), first tranche. Don't lump
full size into a one-day panic. Watch FCF turning back positive as the payback
signal; thesis-break = Search structurally eroded or capex with no return.**

## 3. LRCX — earnings-confirmed; EXECUTE the long-pending starter

Still NOT held. $233.92, -8% today, near late-Oct lows.

Clean Q3 numbers:
- Revenue $8.22B, **+54.4% YoY**, rising every quarter (matches Oct-21 diary).
- **Cash-Flow Gate PASSES CLEANLY:** OCF/NI 1.27, FCF/OCF 0.93, NI margin 33.5%.
  Earnings fully cash-backed — the inverse of a value trap; cleanest in the book.
- **Clean trailing PE ~34.7** (TTM EPS $6.75), NOT denorm's 77. Fair-to-full for
  +54% growth; expensive on strict Graham, justified by growth = "above IV,
  start small."

Verdict: Darwin PASS, earnings-confirmed, best cash quality in shortlist.
**Action: EXECUTE the small starter greenlit Oct-21 (now 9 days unexecuted); the
dip improved the entry. Keep genuinely small until the AI-capex-acceleration
question resolves over 1-2 quarters; room to add lower.**

## 4. TSM / AMAT / everything else

- TSM (held, 1.4%): -6.6% today, same AI/semi theme. Hold; accumulate only on
  further weakness per the geopolitical-tail down-sizing rule. (Note: reports in
  TWD scale — don't mix units in valuation math.)
- AMAT (watch): -8.4%; LRCX remains the chosen single semicap expression.
- SBUX (held, 2.4%): $104.25, at the $105-108 trim zone — SEPARATE decision,
  not touched during a panic day. Still unactioned; resolve on a calm session.

## 5. Decision summary (hold vs buy the dip)

Both GOOGL and LRCX pass the gate on clean data -> **buy the dip, staged + small**,
not all-in today. GOOGL = higher conviction (cheap, accelerating, no tail; one
real risk = capex payback). LRCX = execute the greenlit starter. The one
unresolved macro risk (AI-capex peaking) argues for small tranches, not skipping.

## 6. Open items / next

- [ ] Execute GOOGL first tranche (toward 5-6%) and LRCX starter — pre-committed levels.
- [ ] Resolve SBUX trim trigger on a calm day.
- [ ] Recompute denormalized d_pe/d_ps/d_pb — they used corrupted data; now stale
      vs the clean statements (GOOGL denorm 26.7 vs clean 14.3; LRCX 77 vs 34.7).
- [ ] Carried: load advisor's real allocation targets; allocation-backtester spec
      awaiting decisions; GOOGL FCF to watch for capex-payback turn.

---

*Darwin: survive first, compound quality, be lazy. The data was lying; fixing it
changed the valuation read (GOOGL PE 27->14). Both names confirm on clean
numbers — act, but stage into a thematic panic rather than lump.*
