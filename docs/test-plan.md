# Test Coverage Plan — Critical Functions

**Date**: 2026-08-02
**Current state**: 34 backend tests, 18 frontend tests (52 total)
**Target**: 100+ tests covering all critical paths

---

## Philosophy

Tests should guard against **regressions in behavior that matters**:
- Financial computations (wrong RSI = wrong trade signal)
- API contract (serializer fields disappearing = frontend breaks)
- Data integrity (position avg_cost miscalculation = wrong P&L)
- Business logic (alert triggers, backtest entry/exit rules)

NOT testing: UI styling, component layout, CSS, third-party library internals.

---

## Backend Test Plan

### Priority 1: Financial Indicators (stock/backtesting/indicators.py)

These are the foundation of technicals, alerts, and backtesting. A bug here affects everything.

| Test | What it guards |
|------|---------------|
| `test_rsi_known_values` | RSI computation matches known manual calculation |
| `test_rsi_all_gains_is_100` | Edge case: monotonically rising prices → RSI = 100 |
| `test_rsi_all_losses_is_0` | Edge case: monotonically falling prices → RSI = 0 |
| `test_rsi_insufficient_data` | Less than period+1 data points → graceful handling |
| `test_sma_matches_manual` | SMA(5) on [10,20,30,40,50] = 30 |
| `test_sma_period_exceeds_data` | Period > len(data) → uses all data |
| `test_ema_more_weight_to_recent` | EMA responds faster than SMA to recent change |
| `test_bollinger_bands_symmetry` | Upper and lower equidistant from middle |
| `test_bollinger_width_increases_with_volatility` | Higher std → wider bands |
| `test_highest_high_lowest_low` | Correct values for known data |

**Effort**: 10 tests, ~60 lines

---

### Priority 2: Portfolio Position Logic (stock/models/portfolio.py + views)

A bug here means wrong P&L reported — directly affects real money decisions.

| Test | What it guards |
|------|---------------|
| `test_buy_creates_position` | First BUY creates a new Position |
| `test_buy_updates_avg_cost` | Second BUY recalculates avg cost correctly |
| `test_sell_reduces_shares` | SELL decreases shares |
| `test_sell_to_zero_closes_position` | Selling all shares sets closed_at |
| `test_avg_cost_formula` | (old_shares×old_avg + new_shares×new_price) / total |
| `test_pnl_calculation` | (current_price - avg_cost) × shares |
| `test_pnl_pct_calculation` | P&L % = (pnl / total_cost) × 100 |
| `test_holdings_excludes_closed` | /holdings/ only returns open positions |
| `test_multiple_positions_same_stock` | Can have multiple opened_at dates |

**Effort**: 9 tests, ~80 lines

---

### Priority 3: Alert Evaluation Logic (stock/tasks.py check_alerts)

A missed alert = missed trading signal.

| Test | What it guards |
|------|---------------|
| `test_rsi_alert_triggers_below_threshold` | RSI 25 < threshold 30 → triggers |
| `test_rsi_alert_does_not_trigger_above` | RSI 45 > threshold 30 → no trigger |
| `test_price_below_alert` | Price $50 < threshold $55 → triggers |
| `test_price_above_alert` | Price $60 > threshold $55 → triggers |
| `test_drop_days_alert` | last_lower 10 ≥ threshold 7 → triggers |
| `test_universal_rsi_scans_all_stocks` | universal_rsi checks every stock in scope |
| `test_universal_alert_dedupes_same_day` | Same stock doesn't trigger twice per day |
| `test_sector_scoped_universal` | Only checks stocks in specified sector |
| `test_alert_not_triggered_when_inactive` | is_active=False → skipped |

**Effort**: 9 tests, ~100 lines

---

### Priority 4: Backtest Engine (stock/backtesting/engine.py)

Validates that backtests produce correct results — bad backtest = false confidence.

| Test | What it guards |
|------|---------------|
| `test_buy_and_hold_returns_match_price_change` | Simple: buy day 1, hold, return = price change |
| `test_darwin_rsi_buys_on_oversold` | Enters position when RSI < threshold |
| `test_darwin_rsi_sells_on_profit_target` | Exits at +20% |
| `test_darwin_rsi_stops_loss` | Exits at -10% |
| `test_darwin_rsi_time_stop` | Exits after max_hold_days |
| `test_engine_handles_empty_data` | No price data → empty report (no crash) |
| `test_engine_respects_max_positions` | Can't hold more than position_size allows |
| `test_benchmark_computed_correctly` | Buy & hold benchmark matches first-to-last price |

**Effort**: 8 tests, ~120 lines

---

### Priority 5: Report & Snapshot (stock/report_service.py, tasks refresh_snapshots)

Wrong report data → wrong investment decisions.

| Test | What it guards |
|------|---------------|
| `test_generate_report_structure` | Returns expected keys (basic, graham, darwin, etc.) |
| `test_graham_intrinsic_value_formula` | V = EPS × (8.5 + 2g) × 4.4 / Y |
| `test_graham_score_counts_criteria` | Each passing criterion adds +1 |
| `test_insider_sentiment_all_buys` | All purchases → sentiment = +1.0 |
| `test_insider_sentiment_all_sells` | All sales → sentiment = -1.0 |
| `test_earnings_beat_rate` | 3 beats / 4 quarters = 75% |
| `test_snapshot_refresh_updates_rsi` | After refresh, snapshot.rsi matches computed |

**Effort**: 7 tests, ~80 lines

---

### Priority 6: API Contract Tests (serializer fields, response shapes)

Guards against accidentally removing fields that frontend depends on.

| Test | What it guards |
|------|---------------|
| `test_overview_response_shape` | /stocks/overview/ returns id, symbol, price, daily_return_pct, pe, roe, etc. |
| `test_brief_response_shape` | /stocks/brief/ returns oversold, alerts, earnings, movers, portfolio |
| `test_technicals_response_shape` | /stocks/technicals/ returns rsi, sma50, sma200, verdict |
| `test_portfolio_holdings_shape` | /portfolio/holdings/ returns positions + summary |
| `test_alert_crud` | Create, list, deactivate, triggered events |
| `test_diary_with_position_link` | Create diary with position_id, verify it's returned |
| `test_dividend_projected_income` | /dividends/projected-income/ computes correctly |

**Effort**: 7 tests, ~90 lines

---

## Frontend Test Plan

### Priority 1: Hook Logic (no DOM, pure logic)

| Test | What it guards |
|------|---------------|
| `test_useMarketStatus_weekday_market_hours` | Mock 10AM ET Tuesday → isOpen=true |
| `test_useMarketStatus_weekend` | Mock Saturday → isClosed=true |
| `test_useMarketStatus_extended_hours` | Mock 8AM ET → isExtended=true |
| `test_useMarketStatus_refetchInterval` | Market open → 60000, closed → false |

**Effort**: 4 tests (partially done — enhance existing)

---

### Priority 2: Shared Component Contracts

| Test | What it guards |
|------|---------------|
| `test_ColoredNumber_positive_green` | ✅ Done |
| `test_ColoredNumber_negative_red` | ✅ Done |
| `test_ColoredNumber_null_dash` | ✅ Done |
| `test_ColoredNumber_unit_suffix` | ✅ Done |
| `test_Page_renders_title` | ✅ Done |
| `test_NotFoundView_shows_404` | ✅ Done |
| `test_MultilineChart_renders_svg` | Chart renders with Highcharts (mock data) |
| `test_DropdownMenu_opens_on_click` | Menu items appear when clicked |

**Effort**: 2 new tests

---

### Priority 3: Critical View Behavior

| Test | What it guards |
|------|---------------|
| `test_BriefView_shows_oversold_section` | With oversold data, section renders |
| `test_TechnicalsView_rows_match_data` | Table rows = number of stocks |
| `test_PortfolioView_shows_add_button` | "Add Transaction" button present |
| `test_CompareView_stock_picker_present` | Autocomplete renders |
| `test_CompareView_needs_2_stocks` | Shows "select 2+" message when < 2 |
| `test_AlertsDrawer_shows_messages` | Triggered alerts render in drawer |

**Effort**: 6 tests, ~60 lines

---

## Test Infrastructure Needed

### Backend
- Already have: pytest, factory-boy, conftest with fixtures ✅
- Need: factories for Alert, Position, Transaction, DividendEvent, StockSnapshot

### Frontend
- Already have: Vitest, @testing-library/react, happy-dom ✅
- Need: test utility with Providers wrapper (QueryClient + MemoryRouter) — already in ViewSmokeTests, extract to shared

---

## Execution Order

| Step | Tests | Est. Time |
|------|-------|-----------|
| 1 | Backend: Indicators (10 tests) | 30 min |
| 2 | Backend: Portfolio logic (9 tests) | 45 min |
| 3 | Backend: Alert evaluation (9 tests) | 45 min |
| 4 | Backend: Backtest engine (8 tests) | 60 min |
| 5 | Backend: Report + Snapshot (7 tests) | 30 min |
| 6 | Backend: API contracts (7 tests) | 30 min |
| 7 | Frontend: Hook enhancements (4 tests) | 15 min |
| 8 | Frontend: View behavior (6 tests) | 30 min |

**Total: ~60 new tests in ~5 hours**

---

## Success Criteria

After implementation:
- `make test` passes with **90+ backend tests** (current 34 → +56)
- `npm run test:run` passes with **30+ frontend tests** (current 18 → +12)
- Every critical path has at least one regression guard
- CI can block PRs on test failure (add to `make test` in GH Actions)

---

## What NOT to Test

| Item | Reason |
|------|--------|
| Yahoo Finance API responses | External service, mock it |
| SEC EDGAR XML parsing | Tested by existing data_sources tests |
| Highcharts rendering | Visual library, test data not rendering |
| MUI component internals | Covered by MUI's own tests |
| CSS/styling | Use visual review, not assertions |
| Celery task scheduling | Tested by running app, not unit tests |

---

*Plan created August 2, 2026.*
