# Data Model

## Entity Relationship Diagram

```
User ──1:N──► MySector ──M:N──► MyStock
User ──1:N──► MyDiary  ──N:1──► MyStock (optional)
User ──1:N──► MyTask   ──M:N──► MyStock
                         └──1:1──► TaskResult (django-celery-results)

MyStock ──1:N──► MyStockHistorical
MyStock ──1:N──► IncomeStatement
MyStock ──1:N──► CashFlow
MyStock ──1:N──► BalanceSheet
MyStock ──1:N──► ValuationRatio
```

## Models

### MySector

Groups stocks into user-defined watchlists/portfolios.

| Field | Type | Description |
|-------|------|-------------|
| user | FK → User | Owner |
| name | CharField(32) | Sector name |
| stocks | M2M → MyStock | Stocks in this sector |

### MyStock

Core stock entity. Stores summary data and provides computed financial models.

| Field | Type | Description |
|-------|------|-------------|
| symbol | CharField(64), unique | Ticker symbol |
| beta | Float | Market beta |
| roa | Float | Return on Assets |
| roe | Float | Return on Equity |
| profit_margin | Float | Profit margin |
| shares_outstanding | Float | Outstanding shares |
| top_ten_institution_ownership | Float | Top 10 institutional ownership % |
| institution_count | Integer | Number of institutional holders |

Key computed properties:

| Property | Logic |
|----------|-------|
| `tax_rate` | Average tax_rate from income statements |
| `latest_close_price` | Most recent historical close price |
| `last_lower` | Days since a lower price (from latest historical) |
| `last_better` | Days since a higher price (from latest historical) |
| `dupont_roe` | ROE via DuPont model: net_margin × turnover × equity_multiplier |
| `roe_dupont_reported_gap` | % difference between reported ROE and DuPont-computed ROE |
| `dupont_model` | Per-period DuPont decomposition (list of dicts) |
| `nav_model` | Net Asset Value per share over time |
| `cross_statements_model` | ROCE, ROIC, capital structure, FCF, tax rate per period |
| `pe`, `pb`, `ps` | Latest valuation ratios |
| `price_to_cash_premium` | Price / cash per share |

### MyStockHistorical

Daily OHLCV price data. This model drives the core "human-friendly" analysis.

| Field | Type | Description |
|-------|------|-------------|
| stock | FK → MyStock | Parent stock |
| on | DateField | Trading date |
| open_price | Float | Open |
| high_price | Float | High |
| low_price | Float | Low |
| close_price | Float | Close |
| adj_close | Float | Adjusted close |
| vol | Float | Volume (thousands) |

Unique constraint: `(stock, on)` with composite index.

Key computed properties:

| Property | Logic |
|----------|-------|
| `last_lower` | Trading days since close was lower than today → measures how much "ground was lost" |
| `last_better` | Trading days since close was higher → measures rebound cycle |
| `next_better` | Future days until price exceeds today's open → recovery time (God's view) |
| `gain_probability` | % of future days where price > today's open |
| `vol_over_share_outstanding` | Volume / shares outstanding × 0.001 |

### StatementBase (Abstract)

Shared base for financial statement models. Provides:
- `_as_of_ratio(attr1, attr2)` — ratio of two fields
- `_as_of_pcnt(attr1, attr2)` — percentage of attr1 relative to attr2
- `_growth_rate(model, attr)` — period-over-period growth
- `_as_of_his_ratio(attr1, model, attr2)` — cross-model ratio lookup
- `close_price` — stock price on the statement date

### IncomeStatement

Quarterly/annual income statement data (~30 stored fields).

Key stored fields: `total_revenue`, `cost_of_revenue`, `gross_profit`, `operating_expense`, `operating_income`, `ebit`, `ebitda`, `net_income`, `tax_rate`, `basic_eps`

Key computed properties (all as % of revenue unless noted):
- Margins: `net_income_to_revenue`, `gross_profit_to_revenue`, `ebit_to_revenue`, `operating_income_to_revenue`
- Costs: `cogs_to_revenue`, `total_expense_to_revenue`, `operating_expense_to_revenue`, `selling_ga_to_revenue`
- Growth: `net_income_growth_rate`, `operating_income_growth_rate`
- Cross-model: `ebit_to_total_asset`, `net_income_to_equity`, `cogs_to_inventory`, `interest_coverage_ratio`

### CashFlow

Quarterly/annual cash flow statement (~20 stored fields).

Key stored fields: `beginning_cash`, `ending_cash`, `free_cash_flow`, `operating_cash_flow`, `capex`, `dividend_paid`, `net_income`, `da`

Key computed properties:
- `cash_change_pcnt` — (ending - beginning) / beginning × 100
- `fcf_over_ocf` — Free cash flow as % of operating cash flow
- `fcf_over_net_income` — FCF as % of net income
- `ocf_over_net_income` — Operating cash flow as % of net income
- `dividend_payout_ratio` — Dividends / net income
- `operating_cash_flow_growth` — Period-over-period OCF growth

### BalanceSheet

Quarterly/annual balance sheet (~56 stored fields).

Key stored fields: `total_assets`, `current_assets`, `cash_and_cash_equivalent`, `receivables`, `inventory`, `net_ppe`, `goodwill`, `current_liabilities`, `long_term_debt`, `total_debt`, `stockholders_equity`, `retained_earnings`, `working_capital`, `invested_capital`, `share_issued`

Key computed properties:
- Ratios: `current_ratio`, `quick_ratio` (with 50% AR haircut), `debt_to_equity_ratio`, `equity_multiplier`, `capital_structure`
- As-of-%: `liability_to_asset`, `current_asset_to_total_asset`, `retained_earnings_to_equity`, `inventory_to_current_asset`
- Growth rates: `debt_growth_rate`, `ap_growth_rate`, `ar_growth_rate`, `all_cash_growth_rate`, `working_capital_growth_rate`, `invested_capital_growth_rate`, `net_ppe_growth_rate`, `equity_growth_rate`, `share_issued_growth_rate`
- Per-share: `tangible_book_value_per_share`, `cash_and_cash_equivalent_per_share`, `price_to_cash_premium`

### ValuationRatio

Pre-computed valuation multiples from Yahoo Finance.

| Field | Type |
|-------|------|
| stock | FK → MyStock |
| on | DateField |
| forward_pe | Float |
| pe | Float |
| pb | Float |
| peg | Float |
| ps | Float |

### MyDiary

User journal entries with bull/bear predictions.

| Field | Type | Description |
|-------|------|-------------|
| user | FK → User | Owner |
| stock | FK → MyStock (optional) | Associated stock (defaults to SPY) |
| content | TextField | Markdown notes |
| judgement | Integer | 1=bull, 2=bear |
| created | DateTimeField (auto) | Creation time |
| last_updated | DateTimeField (auto) | Last update |

Computed:
- `price` — Close price on diary creation date
- `is_correct` — Whether bull/bear prediction matches price movement

### MyNews

News articles fetched by topic.

| Field | Type |
|-------|------|
| source | CharField(64) |
| topic | CharField(32) |
| title | CharField(512) |
| link | URLField |
| pub_time | DateTimeField |
| summary | TextField |

Unique constraint: `(source, topic, link)`

### MyTask

Tracks Celery task execution with user ownership.

| Field | Type | Description |
|-------|------|-------------|
| id | UUIDField (PK) | Celery task ID |
| user | FK → User | Requesting user |
| result | OneToOne → TaskResult | Linked celery result |
| state | CharField(128) | Task state |
| stocks | M2M → MyStock | Target stocks |

## Design Decisions

1. **Heavy use of computed properties**: Financial ratios and analysis metrics are computed on-the-fly from stored raw data rather than pre-computed. This ensures consistency but impacts read performance for large datasets.

2. **Cross-model lookups in properties**: Properties like `ebit_to_total_asset` query across IncomeStatement and BalanceSheet, using date-based alignment (`on__lte`) since reporting dates don't always align.

3. **User data isolation**: All querysets are filtered by user ownership through the sector relationship. A stock is only visible to users whose sectors contain it.

4. **Soft indicators over hard numbers**: The `last_lower`, `last_better`, `next_better`, and `gain_probability` properties convert price movements into time-based human-readable gauges.
