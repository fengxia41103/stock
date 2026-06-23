# Benjamin Graham — Value Investing Framework

Based on *The Intelligent Investor* (1949) and *Security Analysis* (1934)

---

## Core Philosophy

**"An investment operation is one which, upon thorough analysis, promises safety of principal and an adequate return."**

Three pillars:

1. **Margin of Safety** — only buy when price is well below intrinsic value
2. **Mr. Market** — treat the market as an emotional counterparty, not a guide
3. **Investor vs Speculator** — investing requires analysis and discipline; speculation is guessing

---

## Pillar 1: Margin of Safety

The central concept. The gap between intrinsic value and purchase price.

```
Intrinsic Value:  $100
Your Buy Price:   $60
Margin of Safety: $40 (40%)

Even if you're wrong by 30% on value estimate:
  Actual value: $70
  Your cost: $60
  Still safe.
```

**Why it matters:**
- Protects against analytical errors
- Protects against unforeseen bad news
- Creates asymmetric risk/reward (limited downside, open upside)

---

## Pillar 2: Mr. Market

Imagine the market as a business partner named Mr. Market who shows up daily offering to buy your shares or sell you his.

- Some days he's euphoric → offers absurdly high prices
- Some days he's panicked → offers absurdly low prices
- **You are never obligated to trade**

**Lesson:** Use Mr. Market's prices to your advantage. Buy when he's depressed, sell (or ignore) when he's euphoric. Never let his mood influence your judgment of value.

---

## Pillar 3: Defensive vs Enterprising Investor

### Defensive (passive) Investor

For people who want safety with minimal effort:

- Hold 25-75% in bonds, rest in stocks
- Buy only large, prominent, conservatively financed companies
- Long history of continuous dividends (20+ years)
- PE < 15x on average earnings of last 3 years
- Price < 1.5x book value
- Diversify across 10-30 stocks

### Enterprising (active) Investor

For those willing to do deep work:

- Seek "special situations" and undervalued securities
- Apply stricter quantitative criteria
- Look for "net-net" opportunities (price < liquidation value)
- Willing to hold unloved/unpopular stocks

---

## Graham's Quantitative Screening Criteria

| # | Criterion | Threshold |
|---|-----------|-----------|
| 1 | Adequate size | Revenue > $100M (adjusted for inflation) |
| 2 | Strong financial condition | Current ratio > 2x |
| 3 | Earnings stability | Positive earnings each of past 10 years |
| 4 | Dividend record | Uninterrupted payments for 20+ years |
| 5 | Earnings growth | Minimum 33% increase over 10 years (3%/yr) |
| 6 | Moderate PE ratio | < 15x average earnings of past 3 years |
| 7 | Moderate price-to-assets | P/B < 1.5x (or PE × P/B < 22.5) |
| 8 | Low debt | Total debt < net current assets |

**Combined rule:** PE × P/B should not exceed 22.5

```
Example: PE = 12, P/B = 1.5 → 12 × 1.5 = 18 ✓ (< 22.5)
Example: PE = 20, P/B = 2.0 → 20 × 2.0 = 40 ✗ (too expensive)
```

---

## Net-Net Strategy (Ultimate Margin of Safety)

Graham's most extreme value strategy:

```
Buy when: Market Cap < 2/3 × (Current Assets − ALL Liabilities)

This means you're buying the business for less than its
liquidation value. Even if it shuts down tomorrow, you profit.
```

Rare in modern markets but the principle applies directionally.

---

## Graham's Formula for Intrinsic Value

```
V = EPS × (8.5 + 2g)

Where:
  V = intrinsic value
  EPS = trailing twelve months earnings per share
  8.5 = PE assigned to a zero-growth company
  g = expected annual growth rate (next 7-10 years)

Example (V = Visa):
  EPS = $12.44
  g = 12% (conservative for Visa)
  V = 12.44 × (8.5 + 24) = 12.44 × 32.5 = $404

  Current price $327 → 19% margin of safety ✓
```

Revised formula (accounting for interest rates):

```
V = EPS × (8.5 + 2g) × 4.4 / Y

Where Y = current yield on AAA corporate bonds (currently ~5.5%)

V = 12.44 × 32.5 × 4.4 / 5.5 = $323

Current price $327 → 0% margin — fairly valued at current rates.
```

---

## Graham vs Pulak Prasad (Darwin)

| Dimension | Graham | Darwin (Prasad) |
|-----------|--------|-----------------|
| **What to buy** | Cheap stocks (P < V) | Quality businesses (high ROCE + moat) |
| **Key metric** | Price/Book, PE | ROCE sustained > 15% for 5+ years |
| **Margin of safety** | Price discount to value | Business quality (moat durability) |
| **When to sell** | Price reaches intrinsic value | Never (unless moat permanently breaks) |
| **Portfolio** | Diversified (20-30) | Concentrated (10-15 compounders) |
| **Holding period** | Until value realized (1-3 yrs) | Indefinite (decades) |
| **Risk control** | Quantitative screening | Kill List (exclusion) |
| **Best for** | Undervalued/cyclical/turnaround | Monopolies/duopolies/toll-booths |

### How Buffett Evolved

```
Early Buffett (1950s-1970s) = Pure Graham
  "Buy a dollar for 50 cents" — cigar butt investing
  Example: Buying bankrupt companies for less than cash on hand

Later Buffett (1980s-present) = Graham + Munger + Quality
  "Buy a wonderful company at a fair price rather than
   a fair company at a wonderful price"
  Example: Coca-Cola, Apple, Moody's

Your Portfolio Now = Darwin/Late Buffett approach
  V, MA, MSFT, GOOGL = toll-booth businesses held indefinitely
```

---

## When to Use Graham vs Darwin

| Situation | Use Graham | Use Darwin |
|-----------|-----------|------------|
| Market crash (everything cheap) | ✅ Buy quality at huge discounts | ✅ Add to compounders |
| Cyclical stock at bottom | ✅ Deep value | ❌ Ignore (cycles ≠ moats) |
| Monopoly at fair price | ❌ Not "cheap" enough | ✅ Buy and hold forever |
| Turnaround play | ✅ If price < liquidation value | ❌ Kill List #5 |
| High-ROCE at 30x PE | ❌ Too expensive for Graham | ✅ If moat justifies it |

---

## Practical Application to Your Portfolio

Stocks passing **both** Graham AND Darwin:

| Stock | PE | P/B | PE×P/B | ROCE | Verdict |
|-------|-----|-----|--------|------|---------|
| V | 26x | — | — | 60% | Darwin ✓, Graham borderline (PE > 15) |
| MSFT | ~22x | — | — | 35% | Darwin ✓, Graham borderline |
| PDD | 10x | — | — | 25% | Graham ✓ (cheap), Darwin ⚠️ (China risk) |
| BKNG | ~20x | — | — | 40-60% | Both ✓ |

**In practice:** Your Darwin stocks (V, MA, MSFT) rarely pass strict Graham screens because quality commands a premium. That's OK — Graham protects against loss, Darwin maximizes compounding. Use Graham's margin of safety *concept* even when buying Darwin stocks (buy at fair price, not any price).

---

*"The investor's chief problem — and even his worst enemy — is likely to be himself." — Benjamin Graham*
