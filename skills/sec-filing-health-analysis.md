# SEC Filing Analysis — Company Health Assessment

How to determine company health from 10-K/10-Q filings.

---

## 10-K Structure

| Section | What It Tells You | Priority |
|---------|-------------------|----------|
| **Item 1: Business** | Operations, competitive landscape | Medium |
| **Item 1A: Risk Factors** | What management fears (compare YoY changes) | High |
| **Item 7: MD&A** | Management's own explanation of performance | **Highest** |
| **Item 8: Financial Statements** | The actual numbers | High |
| **Footnotes** | Where fraud/manipulation hides | **Highest** |
| **Auditor's Report** | Clean vs qualified opinion | Quick check |

---

## 5-Statement Health Check

### 1. Income Statement — Is it profitable?

| Check | Healthy | Red Flag |
|-------|---------|----------|
| Revenue growth | Consistent 5-15%/yr | Declining or lumpy |
| Gross margin | Stable or expanding | Compressing (losing pricing power) |
| Operating margin | > 15% | Below 5% or negative |
| Net income | Growing with revenue | Growing faster than revenue (tricks) |
| EPS vs revenue growth | Similar pace | EPS only from buybacks |

### 2. Balance Sheet — Can it survive?

| Check | Healthy | Red Flag |
|-------|---------|----------|
| Current ratio | > 1.5 | < 1.0 (can't pay bills) |
| Debt/Equity | < 1.0 | > 2.0 (overleveraged) |
| Goodwill / Total assets | < 20% | > 40% (overpaid acquisitions) |
| Cash trend | Growing | Shrinking while debt grows |
| Inventory vs revenue growth | In line | Inventory growing faster (can't sell) |

### 3. Cash Flow — Is profit real?

| Check | Healthy | Red Flag |
|-------|---------|----------|
| Operating CF vs Net Income | OCF ≥ Net Income | OCF << NI (earnings are fake) |
| Free Cash Flow | Positive, growing | Negative 3+ years |
| CapEx / Revenue | Stable | Spiking unexplained |
| Stock-based comp / Revenue | < 5% | > 15% (shareholder dilution) |

### 4. Key Ratios

| Ratio | Formula | Healthy |
|-------|---------|---------|
| ROCE | EBIT / (Total Assets − Current Liabilities) | > 15% for 5 years |
| FCF Yield | FCF / Market Cap | > 4% |
| Interest Coverage | EBIT / Interest Expense | > 5x |
| Debt/EBITDA | Total Debt / EBITDA | < 3x |
| OCF/NI | Operating Cash Flow / Net Income | > 1.0 |

### 5. Footnotes — Where fraud hides

| Look For | Implication |
|----------|-------------|
| Revenue recognition policy change | Pulling forward revenue |
| Related party transactions | Self-dealing by insiders |
| Off-balance-sheet obligations | Hidden debt |
| Accounting estimate changes | Earnings smoothing |
| Litigation section growing | Future cash drain |
| "Going concern" language | Auditor doubts survival |

---

## Red Flags Checklist

### Immediate Disqualifiers

- [ ] Auditor change (especially mid-year)
- [ ] Qualified or adverse audit opinion
- [ ] Restated financials
- [ ] CFO/controller resignation
- [ ] "Material weakness" in internal controls
- [ ] Revenue growing while cash flow shrinks

### Warning Signs

- [ ] Accounts receivable growing faster than revenue (channel stuffing)
- [ ] Inventory growing faster than revenue (product not selling)
- [ ] Frequent "one-time" charges (every year = structural problem)
- [ ] Rising days sales outstanding (customers not paying)
- [ ] Capitalizing costs that should be expensed (inflating assets)
- [ ] Buying back stock while issuing more via SBC (dilution treadmill)
- [ ] Related party transactions with insiders
- [ ] Segment disclosures becoming less detailed (hiding weakness)
- [ ] Dramatic increase in risk factor length/new risks added

---

## Quick 10-Minute Health Scan

For any stock, pull up latest 10-K and answer:

```
1. Is OCF > Net Income?              → Yes = real earnings
2. Is Debt/Equity < 2?              → Yes = survivable
3. Is ROCE > 15% for 5 years?       → Yes = quality business
4. Is auditor opinion clean?         → Yes = trustworthy numbers
5. Are AR/inventory in line with revenue? → Yes = no manipulation

All 5 ✅ = Passes health screen
Any ❌  = Investigate deeper or reject
```

---

## Cross-Reference with Darwin Kill List

| Filing Red Flag | Triggers Kill List # |
|-----------------|---------------------|
| Debt/Equity > 3x | **#2 High leverage** |
| Frequent large acquisitions in footnotes | **#3 Serial acquirer** |
| Revenue concentration footnote (one customer >30%) | **#8 Single customer** |
| Complex segment reporting, SPEs, VIEs | **#9 Complex/opaque** |
| SEC enforcement action, restated financials | **#10 Fraud history** |
| Management self-dealing, excessive comp | **#1 Dishonest** / **#6 Misaligned** |

---

## Earnings Quality Tests

### Accruals Test

```
Accruals = Net Income − Operating Cash Flow

High positive accruals = earnings driven by accounting, not cash
Rule: |Accruals / Total Assets| should be < 5%
```

### Beneish M-Score (fraud probability)

8-variable model that flags manipulation:
- Days Sales in Receivables Index (DSRI)
- Gross Margin Index (GMI)
- Asset Quality Index (AQI)
- Sales Growth Index (SGI)
- Depreciation Index (DEPI)
- SG&A Index (SGAI)
- Leverage Index (LVGI)
- Total Accruals to Total Assets (TATA)

```
M-Score > -1.78 = likely manipulator
M-Score < -1.78 = likely non-manipulator
```

### Altman Z-Score (bankruptcy risk)

```
Z = 1.2(WC/TA) + 1.4(RE/TA) + 3.3(EBIT/TA) + 0.6(Equity/Debt) + 1.0(Sales/TA)

Z > 2.99  = Safe
Z 1.8-2.99 = Gray zone
Z < 1.8   = Distress
```

---

## Mapping to Your Stock App

| What You Need | Where It Is |
|---------------|-------------|
| Revenue/margins/growth | Financials → Income Statement |
| Current ratio, debt/equity | Financials → Balance Sheet |
| FCF, OCF/NI | Financials → Cash Flow |
| ROCE/ROIC | Valuation → Cross-Statements |
| Insider selling patterns | Ownership → Insider Trades |
| Earnings reliability | Valuation → Earnings (beat rate) |
| Actual 10-K text/footnotes | `python3 skills/scripts/download_sec_filings.py` |

---

*"The numbers in financial statements are opinions. The cash in the bank account is a fact." — Source unknown*
