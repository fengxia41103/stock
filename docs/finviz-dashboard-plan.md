# Finviz-Style Dashboard Plan

## Goal

Add a Finviz-inspired overview dashboard to the stock app, leveraging existing data (33 stocks, 287K historicals, financials, insider trades, earnings, macro).

---

## Phase 1 — Sector Treemap (Map Page)

**What**: A treemap where each rectangle = one stock, sized by market cap (or equal), colored by daily return (green=up, red=down).

**Data needed**: Already have — `latest_close_price`, `shares_outstanding` (for sizing), daily return computed from last 2 historicals.

**Implementation**:
```
Frontend: src/views/dashboard/MapView/index.jsx
- ECharts treemap component
- Group by sector (MySector)
- Each stock tile: symbol, return %, price
- Color scale: -3% (red) → 0 (gray) → +3% (green)
- Click → navigates to stock detail
```

**API**: Use existing `/stocks/` endpoint (has shares_outstanding) + `/historicals/?ordering=-on&page_size=2` per stock for return calc. Or add a new lightweight endpoint:

```python
# GET /api/v1/stocks/overview/
# Returns: [{symbol, price, daily_return_pct, market_cap, sector}]
```

**Effort**: Small (1 new endpoint + 1 frontend view + route)

---

## Phase 2 — Stock Screener

**What**: A filterable, sortable DataGrid of all stocks with key metrics.

**Columns**:
| Column | Source | Sortable | Filterable |
|--------|--------|----------|------------|
| Symbol | MyStock.symbol | ✅ | ✅ (text) |
| Price | latest_close_price | ✅ | ✅ (range) |
| Daily Δ% | computed | ✅ | ✅ |
| P/E | d_pe | ✅ | ✅ |
| P/B | d_pb | ✅ | ✅ |
| ROE | roe | ✅ | ✅ |
| Beta | beta | ✅ | ✅ |
| Insider Sentiment | insider_sentiment_3m | ✅ | ✅ |
| Beat Rate | earnings_beat_rate | ✅ | ✅ |
| Last Lower (days) | d_last_lower | ✅ | ✅ |
| Sector | sector name | — | ✅ (dropdown) |

**Implementation**:
```
Frontend: src/views/dashboard/ScreenerView/index.jsx
- MUI DataGrid (already in deps) or simple <table> with sort/filter
- Fetches /api/v1/stocks/ (already returns all needed fields)
- Color: green/red for return, sentiment
- Click row → navigate to stock detail
```

**Effort**: Medium (1 frontend view, no backend changes needed)

---

## Phase 3 — Charts Grid

**What**: A grid page showing mini price charts for all stocks at a glance (like Finviz's charts page).

**Implementation**:
```
Frontend: src/views/dashboard/ChartsGridView/index.jsx
- Grid of cards, each with:
  - Symbol + price
  - 30-day sparkline (RecentPriceSparkline already exists)
  - Daily return chip
- 4 columns on desktop, 2 on mobile
```

**Effort**: Small (reuses existing `RecentPriceSparkline` component)

---

## Phase 4 — Enhanced News Feed

**What**: News feed with sentiment tagging, grouped by stock relevance.

**Current state**: `MyNews` model exists, `MyNewsWorker` uses `newscatcher` (currently disabled).

**Options**:
1. Re-enable newscatcher (free, general news)
2. Use Yahoo Finance news (comes with yfinance, per-stock)
3. Use Alpha Vantage NEWS_SENTIMENT endpoint (limited by 25/day)

**Recommended**: Use yfinance news (already a dependency, no extra API key):
```python
# In get_summary.py or new worker:
s = Ticker(symbol)
news = s.news  # Returns list of {title, link, publisher, providerPublishTime}
```

**Implementation**:
```
Backend: Add stock FK to MyNews, populate from yfinance
Frontend: src/views/news/NewsListView/ (already exists, just needs data)
```

**Effort**: Medium

---

## Phase 5 — Futures/Macro Overview Page

**What**: Dedicated page showing all FRED macro indicators with trend charts (like Finviz futures page).

**Data**: Already have 17 FRED series with 2,942 data points.

**Implementation**:
```
Frontend: src/views/dashboard/MacroOverviewView/index.jsx
- Card grid: one card per series
- Each card: current value, Δ vs last week, mini sparkline
- Group by category (rates, employment, inflation, gdp, recession, housing)
```

**Effort**: Small (data exists, just layout)

---

## Route Plan

```javascript
// New routes under / (MainLayout)
{ path: "map", element: <MapView /> },          // Sector treemap
{ path: "screener", element: <ScreenerView /> }, // Stock screener
{ path: "charts", element: <ChartsGridView /> }, // Mini chart grid
{ path: "macro", element: <MacroOverviewView /> }, // FRED dashboard
```

**Nav additions** (sidebar):
```javascript
{ icon: MapIcon, label: "Map", path: "/map" },
{ icon: FilterListIcon, label: "Screener", path: "/screener" },
{ icon: GridViewIcon, label: "Charts", path: "/charts" },
{ icon: ShowChartIcon, label: "Macro", path: "/macro" },
```

---

## Priority Order

| Phase | Impact | Effort | Dependencies |
|-------|--------|--------|--------------|
| 1. Treemap | ⭐⭐⭐ | Small | None |
| 2. Screener | ⭐⭐⭐ | Medium | None |
| 3. Charts Grid | ⭐⭐ | Small | None |
| 5. Macro Overview | ⭐⭐ | Small | FRED data (done) |
| 4. News Feed | ⭐ | Medium | yfinance news parse |

---

## Backend Changes Needed

Only **one new endpoint** for the treemap:

```python
# GET /api/v1/stocks/overview/
@action(detail=False, methods=["get"])
def overview(self, request):
    """Lightweight overview for treemap/screener."""
    stocks = MyStock.objects.filter(sectors__user=request.user).distinct()
    result = []
    for s in stocks:
        hist = s.historicals.order_by("-on")[:2]
        daily_return = None
        price = None
        if len(hist) >= 2:
            price = hist[0].close_price
            daily_return = (hist[0].close_price - hist[1].close_price) / hist[1].close_price * 100
        elif len(hist) == 1:
            price = hist[0].close_price

        sectors = list(s.sectors.filter(user=request.user).values_list("name", flat=True))
        result.append({
            "id": s.id,
            "symbol": s.symbol,
            "name": s.name,
            "price": price,
            "daily_return_pct": daily_return,
            "market_cap": (s.shares_outstanding or 0) * (price or 0),
            "sector": sectors[0] if sectors else None,
            "pe": s.d_pe,
            "roe": s.roe,
            "insider_sentiment": s.insider_sentiment_3m,
        })
    return Response(result)
```

---

## Estimated Total Effort

| Item | Lines of code |
|------|--------------|
| Backend (overview endpoint) | ~30 |
| MapView (treemap) | ~80 |
| ScreenerView (DataGrid) | ~100 |
| ChartsGridView | ~60 |
| MacroOverviewView | ~80 |
| Routes + Nav | ~20 |
| **Total** | **~370** |

All can be done in one session.
