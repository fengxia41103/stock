# Stock Deep-Dive Analysis Framework

## Purpose

Systematic framework for producing investment-grade analysis of individual stocks using Kiro CLI capabilities + app DB data. Based on Pulak Prasad's Darwin investing methodology.

---

## Available Kiro Capabilities for Analysis

| Capability | Use Case |
|------------|----------|
| **App DB** (via `docker compose exec`) | Financials, prices, RSI, insider trades, earnings, macro |
| **Web Search** | Latest news, earnings calls, 10-K/10-Q details, competitive intelligence |
| **Web Fetch** | Read specific SEC filings, analyst reports, press releases |
| **Subagents** | Parallel research on multiple dimensions simultaneously |
| **File tools** | Write structured reports to `docs/analysis/<TICKER>/` |

---

## Analysis Process (10 Dimensions)

### Phase 1: Data Collection (parallel)

Run these simultaneously via subagents or sequential DB queries:

```
1. DB: Price data (RSI, Bollinger, 52-wk range, volume patterns)
2. DB: Financials (ROCE, margins, FCF, debt ratios from cross_statements_model)
3. DB: Insider trades (sentiment score, cluster buys)
4. DB: Earnings (beat rate, surprise magnitude, next date)
5. Web: Latest news + recent earnings call transcript highlights
6. Web: Competitive landscape updates
```

### Phase 2: Framework Application

| Dimension | Method | Source |
|-----------|--------|--------|
| 1. Kill List (10 criteria) | Check each of Darwin's 10 exclusion rules | DB + Web (for management/industry context) |
| 2. ROCE & Trajectory | Compute from DB, plot trend | DB cross_statements_model |
| 3. Moat Analysis | Identify moat type + durability | Web research + industry knowledge |
| 4. Management Quality | Insider behavior + capital allocation | DB insider trades + Web (CEO track record) |
| 5. Financial Fortress | D/E, interest coverage, FCF, Altman Z | DB balance sheet + income |
| 6. Growth Quality | Organic vs acquired, runway | DB revenue growth + Web (TAM analysis) |
| 7. Competitive Position | Market share, threats | Web search (recent competitive dynamics) |
| 8. Valuation (Graham + DCF) | Full Graham screen + IV formula + DCF | DB price + earnings + balance sheet |
| 9. Technical Setup | RSI, support/resistance, volume | DB historicals |
| 10. Catalysts & Risks | Upcoming events, scenarios | DB earnings calendar + Web (news) |

---

## Dimension 8: Graham Valuation — Detailed Method

Apply Benjamin Graham's full framework, not just the formula:

### Graham Quantitative Screen (8 Criteria)

| # | Criterion | Threshold | How to Check |
|---|-----------|-----------|--------------|
| 1 | Adequate size | Revenue > $1B | DB IncomeStatement.total_revenue |
| 2 | Strong financials | Current ratio > 2 | DB BalanceSheet.current_ratio |
| 3 | Earnings stability | Positive earnings every year for 5+ years | DB IncomeStatement (5 years) |
| 4 | Dividend record | Consecutive dividends 10+ years | Web (dividend history) |
| 5 | Earnings growth | 10-year EPS growth > 33% | DB earnings or income statements |
| 6 | Moderate PE | PE < 15 (on 3-year avg earnings) | DB ValuationRatio + earnings |
| 7 | Moderate PB | PB < 1.5 | DB ValuationRatio |
| 8 | Combined | PE × PB < 22.5 | Computed |

**Note**: Most high-quality growth stocks (ISRG, NFLX, MSFT) will FAIL criteria 6/7/8. Graham's strict screen is for deep-value cigar butts. For growth companies, use the **IV formula + margin of safety** approach instead.

### Graham Intrinsic Value Formula

```
V = EPS × (8.5 + 2g) × 4.4 / Y

Where:
  EPS = Trailing twelve months earnings per share
  g   = Reasonably expected 5-year growth rate (%)
  Y   = Current AAA corporate bond yield (%) — use FRED data
  8.5 = PE for zero-growth company (Graham's baseline)
  4.4 = Average AAA yield when Graham wrote the formula
```

**How to apply**:
1. Get TTM EPS from DB (earnings events or income statement)
2. Estimate g conservatively: use LOWER of (analyst consensus, historical 5-yr CAGR, company guidance)
3. Get Y from FRED `BAMLC0A1CAAA` or approximate with `DGS10 + 1%`
4. Compute V
5. **Margin of Safety** = (V - Price) / V × 100%. Want > 25%.

### Graham's Margin of Safety Tiers

| MoS | Interpretation | Action |
|-----|---------------|--------|
| > 40% | Deep value, very attractive | Strong buy signal |
| 25-40% | Adequate safety | Buy if other factors confirm |
| 10-25% | Thin margin | Only buy if moat is exceptional |
| < 10% | No safety | Don't buy regardless of quality |
| Negative | Overvalued by Graham | Avoid or short-term only |

### Reconciling Graham + Darwin

Graham says "buy cheap." Darwin says "buy quality." The synthesis:

```
Graham PASS + Darwin PASS  → Best possible investment (rare)
Graham FAIL + Darwin PASS  → Acceptable if MoS > 15% (most quality stocks)
Graham PASS + Darwin FAIL  → Value trap — cheap for a reason
Graham FAIL + Darwin FAIL  → Avoid completely
```

For stocks that fail Graham's strict PE/PB thresholds but pass Darwin's quality tests (ROCE>15%, moat, management), use the **IV formula with conservative growth** as the valuation anchor. If price is >25% below Graham IV, the stock is "cheap enough for a quality buyer" even if it's not a classic Graham bargain.

### DCF Scenario Analysis

Complement Graham IV with 3 DCF scenarios:

| Scenario | Growth Assumption | Terminal Rate | Purpose |
|----------|------------------|--------------|---------|
| Bear | Management's LOWEST guidance or 50% of current | 2.5% | Floor price if things go wrong |
| Base | Consensus / historical avg | 3.5% | Most likely outcome |
| Bull | Management's high guidance | 4.5% | Upside if execution perfect |

**Probability-weight**: Bear 20% + Base 50% + Bull 30% = Expected value.
If current price < Expected value by >20%, valuation confirms buy.

### Phase 3: Synthesis

- Score each dimension 1-10
- Produce probability-weighted expected value
- Generate position sizing recommendation
- Write to `docs/analysis/<TICKER>/<ticker>-deep-analysis-<date>.md`

---

## Report Template

```markdown
# {TICKER} — Deep Investment Analysis
Date: {date} | Price: ${price} | 52-wk High: ${high} | Down: {pct}%

## Executive Summary
{2-3 sentences: verdict + key insight}

## 1. Financial Health
{Table: Revenue, margins, FCF, debt, ROCE — from DB}

## 2. Darwin Kill List
{Table: 10 criteria, pass/fail/caveat}

## 3. Moat Analysis
{Type, evidence, durability rating}

## 4. Product & Competitive Position
{Market share, threats, advantages}

## 5. Management & Insider Activity
{Insider trades from DB, capital allocation quality}

## 6. Valuation
{PE vs history, Graham IV, DCF scenarios}

## 7. Technical Setup
{RSI, key levels, volume patterns}

## 8. Catalysts & Risks
{Upcoming events, probability-weighted scenarios}

## 9. Recommendation
{Rating, score table, execution plan}

## 10. Position Sizing
{Current weight if owned, target, action}
```

---

## Scoring Rubric

| Score | Meaning |
|-------|---------|
| 9-10 | Exceptional — top 5% quality |
| 7-8 | Strong — clear advantages, minor concerns |
| 5-6 | Average — no edge vs alternatives |
| 3-4 | Weak — material concerns |
| 1-2 | Disqualifying — avoid |

**Overall ≥ 7.5**: Strong candidate for long-term holding
**Overall 6-7.5**: Acceptable for short-term / box trading only
**Overall < 6**: Pass

---

## Automation Commands

### Run full analysis on a single stock:
```
Analyze [TICKER] using the deep-dive framework
```

### Run comparative analysis on portfolio:
```
Score all stocks in my [sector] portfolio using Darwin framework
```

### Quick technical scan:
```
Check all my stocks for oversold/overbought conditions
```

### Update existing analysis:
```
Update [TICKER] analysis with today's market data
```

---

## Key Principles

1. **DB first, web second** — always check what data we already have before searching
2. **Quantify everything** — no claim without a number from DB or cited source
3. **Critical review built-in** — every analysis should challenge its own conclusions
4. **Position sizing > stock picking** — even a great stock is bad at wrong size
5. **Date everything** — markets change; analysis has a shelf life
6. **Store in repo** — all analysis goes to `docs/analysis/<TICKER>/` for future reference

---

## Integration with App

The stock app provides these computed values per stock:
- `cross_statements_model`: ROCE, ROIC, FCF, capital structure per period
- `dupont_model`: ROE decomposition (margin × turnover × leverage)
- `insider_sentiment_3m`: -1 to +1 net buy/sell score
- `earnings_beat_rate`: % of last 8 quarters beating consensus
- Historical RSI/Bollinger from raw price data
- Macro correlations (stock vs 10Y Treasury, CPI, etc.)

All accessible via:
```bash
docker compose exec -T web python -c "
import django, os
os.environ['DJANGO_SETTINGS_MODULE'] = 'fin.settings'
django.setup()
# ... query models
"
```
