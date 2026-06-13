# API Reference

Base URL: `/api/v1/`

Authentication: All endpoints (except user registration and news) require `ApiKeyAuthentication` header.

## Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/` | Register new user (username, email, password, firstName, lastName) |
| POST | `/auth/login/` | Login → returns `{success, data: {user, key}}` |
| GET | `/auth/logout/` | Logout current session |

### Sectors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sectors/` | List user's sectors |
| GET | `/sectors/:id/` | Sector detail (includes full stock objects) |
| POST | `/sectors/` | Create sector `{name}` |
| PATCH | `/sectors/:id/` | Update sector (triggers data refresh for all stocks) |
| DELETE | `/sectors/:id/` | Delete sector |

Filters: `name`

### Stocks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stocks/` | List stocks in user's sectors |
| GET | `/stocks/:id/` | Stock detail (includes dupont_model, nav_model, cross_statements_model) |
| POST | `/stocks/` | Add stock `{symbol, sectors[]}` — triggers Yahoo data fetch |
| PATCH | `/stocks/:id/` | Update stock — triggers data refresh |
| DELETE | `/stocks/:id/` | Delete stock |

Filters: `symbol`, `id`

Detail-only fields: `tax_rate`, `latest_close_price`, `dupont_model`, `nav_model`, `dupont_roe`, `roe_dupont_reported_gap`, `cross_statements_model`

List fields include: `pe`, `pb`, `ps`, `last_lower`, `last_better`, `price_to_cash_premium`, `last_reporting_date`

### Historical Prices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/historicals/` | Historical price data for user's stocks |

Filters: `on`, `stock`
Ordering: `on`
Extra fields: `symbol`, `stock_id`, `last_lower`, `last_better`, `next_better`, `gain_probability`, `vol_over_share_outstanding`

### Financial Statements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/incomes/` | Income statements |
| GET | `/balances/` | Balance sheets |
| GET | `/cashes/` | Cash flow statements |
| GET | `/ratios/` | Valuation ratios (PE, PB, PEG, PS) |

All filter by: `stock`
All ordered by: `on`

Income statement extra fields: margins (net, gross, operating, EBIT), expense ratios, growth rates, cross-model ratios (ebit_to_total_asset, cogs_to_inventory, interest_coverage_ratio)

Balance sheet extra fields: liquidity ratios (current, quick), leverage (debt_to_equity, equity_multiplier), growth rates (debt, AP, AR, cash, working capital, PPE, equity, shares), per-share values

Cash flow extra fields: FCF ratios, OCF ratios, growth rates, dividend payout

### Rankings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stock-ranks/` | Rank stocks by ROE, DuPont ROE, gap |
| GET | `/balance-ranks/` | Rank by balance sheet metrics (19 metrics) |
| GET | `/cash-ranks/` | Rank by cash flow metrics (6 metrics) |
| GET | `/income-ranks/` | Rank by income metrics (19 metrics) |
| GET | `/valuation-ranks/` | Rank by PE, PB, PS |

Filters: `stats__in` (metric IDs), `symbol__in`

Returns: Array of `{id, name, stats: [{id, symbol, on, val}]}` — one entry per stock (most recent within 180 days), sorted by metric direction (high-to-low or low-to-high depending on metric semantics).

### Diary / Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/diaries/` | List user's diary entries (ordered by last_updated desc) |
| GET | `/diaries/:id/` | Diary detail (includes content field) |
| POST | `/diaries/` | Create diary `{stock, content, judgement}` |
| PATCH | `/diaries/:id/` | Update diary |
| DELETE | `/diaries/:id/` | Delete diary |

Filters: `stock`, `last_updated__range`, `content__contains`
Extra fields: `price` (close on creation date), `is_correct` (prediction accuracy)

### News

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/news/` | List news articles (ordered by pub_time desc) |

Filters: `title`, `topic`, `summary`, `pub_time`
No authentication required.

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/` | List user's background tasks |
| DELETE | `/tasks/:id/` | Delete a task |
| GET | `/task-results/` | List Celery task results |

Filters: `state`, `stocks`, `task_id`

## Response Format

All responses follow Tastypie's standard envelope:

```json
{
  "meta": {
    "limit": 0,
    "next": null,
    "offset": 0,
    "previous": null,
    "total_count": 42
  },
  "objects": [...]
}
```

Detail responses return the object directly without the envelope.

## Authorization Model

- Users can only see/modify their own data (sectors, diaries, tasks)
- Stocks are visible to users who have them in at least one sector
- Financial statements and historicals are scoped to user's visible stocks
- Django model permissions (add/change/delete/view) are auto-assigned on user creation for: MyStock, MySector, MyDiary, MyTask
