# Stock Deep Dive Analysis Framework

A systematic method for evaluating a stock using all available data sources.

---

## Step 1: SEC Health Screen (2 minutes)

Run the automated health check first. If it fails, stop here.

```bash
python3 skills/scripts/analyze_sec_health.py TICKER
```

**Pass criteria:**
- Zero red flags
- Altman Z > 2.99 (SAFE)
- OCF/NI > 1.0 (earnings are real)
- Debt/Equity < 2.0

If any fails → investigate why before proceeding.

---

## Step 2: Darwin Kill List (3 minutes)

| # | Check | How to verify |
|---|-------|---------------|
| 1 | Management integrity | Insider trades (Form 4), compensation vs performance |
| 2 | Leverage | Debt/Equity from Step 1, interest coverage |
| 3 | Serial acquirer | 10-K footnotes: count acquisitions in past 5 years |
| 4 | Industry changing fast | Is the product/service the same as 10 years ago? |
| 5 | Turnaround | Has it been profitable consistently for 5+ years? |
| 6 | Aligned interests | Insider ownership %, compensation structure |
| 7 | State-owned | Check ownership structure |
| 8 | Single customer | 10-K revenue concentration footnote |
| 9 | Complex model | Can you explain it in one sentence? |
| 10 | Fraud history | SEC enforcement, restated financials |

**Any trigger → REJECT. Move on.**

---

## Step 3: Moat Identification (5 minutes)

Ask: "Why can't a competitor with $10B replicate this business?"

| Moat Type | Evidence in Filings | Example |
|-----------|--------------------:|---------|
| Network effect | User/transaction growth without proportional cost | V, MA, BKNG |
| Switching cost | Revenue retention >90%, low churn | MSFT, ADP, ISRG |
| Supply constraint | Physical assets, permits, regulatory barriers | CPRT (land), UNP (rail), WM (landfill) |
| Cost advantage | Margins >> peers at same price point | COST, TXN |
| Brand/standard | Pricing power (can raise prices, nobody leaves) | FICO, AAPL, SHW |
| Scale | Revenue/employee or revenue/asset far above peers | GOOGL, MA |

**Must identify at least ONE clear, durable moat source.**

---

## Step 4: Financial Quality (5 minutes)

From your stock app (Financials tabs) or SEC XBRL:

| Metric | Where | Threshold |
|--------|-------|-----------|
| ROCE sustained 5 years | Cross-Statements view | > 15% every year |
| Revenue growth | Income Statement | Consistent, not lumpy |
| Margin trend | Income Statement | Stable or expanding |
| FCF positive | Cash Flow | Every year for 5 years |
| OCF > Net Income | Cash Flow | Proves earnings are real |
| Debt trend | Balance Sheet | Flat or declining |
| Share count | Balance Sheet | Flat or declining (buybacks) |

**Framework:**
```
Revenue growing + Margins expanding + FCF growing = COMPOUNDING
Revenue flat + Margins flat + FCF flat = STABLE (hold)
Revenue declining OR Margins compressing OR FCF shrinking = DETERIORATING (sell)
```

---

## Step 5: Price & Timing (3 minutes)

From your stock app (Price & Trends tab):

| Signal | Meaning | Action |
|--------|---------|--------|
| RSI < 25 | Extremely oversold | Strong buy signal |
| RSI 25-40 | Oversold | Good entry zone |
| RSI 40-60 | Neutral | Fair value, hold |
| RSI > 70 | Overbought | Don't add, consider trim |
| Last Lower > 30 days | Significant drop | Investigate: temporary or structural? |
| Near 52-week low | Maximum pessimism | Best entries if fundamentals intact |
| Near 52-week high | Maximum optimism | Don't chase |

**Graham Margin of Safety check:**
```
Fair Value = TTM EPS × (8.5 + 2g) × 4.4 / Y

Where:
  g = expected growth rate (5-15% for quality companies)
  Y = AAA bond yield (~5.5% in 2026)

Buy if: Price < 80% of Fair Value (20% margin of safety)
Hold if: Price = 80-120% of Fair Value
Trim if: Price > 150% of Fair Value
```

---

## Step 6: Catalyst & Risk Check (3 minutes)

| Check | Source | Action |
|-------|--------|--------|
| Next earnings date | App → Earnings tab | Reduce before, add after dips |
| Insider activity (90 days) | App → Insider Trades tab | Buying = bullish, heavy selling = caution |
| Macro correlation | App → Macro Overlay | Is it rate-sensitive? Recession-sensitive? |
| Analyst consensus | Web search | Provides sentiment baseline |
| Recent news | Yahoo Finance news (auto-fetched) | Any structural change? |

---

## Step 7: Position Decision

```
┌─────────────────────────────────────────┐
│  DECISION MATRIX                         │
│                                          │
│  Health ✅ + Kill List ✅ + Moat ✅       │
│    + Financials COMPOUNDING              │
│    + Price below fair value              │
│    → BUY (size: 5-10% of portfolio)     │
│                                          │
│  Health ✅ + Kill List ✅ + Moat ✅       │
│    + Financials STABLE                   │
│    + Price at fair value                 │
│    → HOLD (don't add, don't sell)       │
│                                          │
│  Health ✅ + Kill List ✅ + Moat ✅       │
│    + Financials COMPOUNDING              │
│    + Price far above fair value          │
│    → HOLD (already own) / WAIT (new)    │
│                                          │
│  Health ⚠️ OR Kill List ❌ OR Moat ❌    │
│    → SELL / DON'T BUY                   │
│                                          │
│  Financials DETERIORATING                │
│    → SELL regardless of other factors    │
└─────────────────────────────────────────┘
```

---

## Step 8: Document (1 minute)

Record your analysis as a diary entry in the app:

```
## TICKER $PRICE — Bull/Bear

Kill List: ✅ Pass / ❌ #N
Moat: [type] — [one sentence]
Financials: COMPOUNDING / STABLE / DETERIORATING
Valuation: Cheap / Fair / Expensive
Action: BUY / HOLD / SELL / WAIT

Key risk: [one sentence]
Catalyst: [next event + date]

$TICKER
```

---

## Complete Example: CPRT

```
Step 1: Health = ✅ Z-Score 6.4, zero debt, OCF/NI 1.16
Step 2: Kill List = ✅ All clear (zero triggers)
Step 3: Moat = Supply constraint (16K owned acres) + Network effect (300K buyers)
Step 4: Financials = STABLE (revenue flat, margins expanding, FCF $1.2B)
Step 5: Price = $29, -20% YTD, near 52-wk low. Fair value ~$40 (analyst target)
Step 6: Risk = Insurance unit volume cyclical decline. Not structural.
Step 7: HOLD (already own). ADD below $25 for margin of safety.
Step 8: Recorded in diary.
```

**Total time: ~20 minutes per stock.**

---

## Tools Required

| Step | Tool |
|------|------|
| 1 | `python3 skills/scripts/analyze_sec_health.py TICKER` |
| 2 | Reading + Darwin knowledge |
| 3 | 10-K + industry research |
| 4 | Stock app → Financials tabs |
| 5 | Stock app → Price & Trends |
| 6 | Stock app → Earnings + Insider + Macro |
| 7 | Decision matrix above |
| 8 | Stock app → Notes → Add diary |

---

*"The goal is not to find the perfect stock. It's to avoid the terrible ones and hold the great ones." — Adapted from Darwin*
