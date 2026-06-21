# Analysis & Frontend Integration Plan (Steps 5.5–5.10)

## Step 5.5 — Insider Sentiment Score

### Computed Property on MyStock

```python
# backend/stock/models/stock.py (addition)

@property
def insider_sentiment_3m(self):
    """Net insider buy/sell sentiment over last 3 months.
    
    Returns: float between -1 (all selling) and +1 (all buying)
    Formula: (buy_value - sell_value) / (buy_value + sell_value)
    """
    from datetime import date, timedelta
    cutoff = date.today() - timedelta(days=90)
    trades = self.insider_trades.filter(trade_date__gte=cutoff)
    
    buy_value = sum(t.total_value or 0 for t in trades if t.is_purchase)
    sell_value = sum(t.total_value or 0 for t in trades if t.is_sale)
    total = buy_value + sell_value
    if total == 0:
        return 0
    return (buy_value - sell_value) / total

@property
def insider_cluster_buy(self):
    """True if 3+ unique insiders bought within last 14 days."""
    from datetime import date, timedelta
    cutoff = date.today() - timedelta(days=14)
    buyers = self.insider_trades.filter(
        trade_date__gte=cutoff, transaction_type="P"
    ).values_list("insider_cik", flat=True).distinct()
    return buyers.count() >= 3
```

### Ranking Integration

Add insider sentiment to the existing ranking system:

```python
# In ranking computation
INSIDER_RANKINGS = [
    {"id": "insider_sentiment_3m", "label": "Insider Sentiment (3M)", "direction": "high"},
    {"id": "insider_net_buys_6m", "label": "Net Insider Buys (6M)", "direction": "high"},
]
```

---

## Step 5.6 — Macro Correlation Analysis

### Computation Task

```python
# backend/stock/tasks.py (addition)

@app.task(queue="macro")
def compute_macro_correlations():
    """Compute rolling correlations between all stocks and key macro series."""
    import numpy as np
    from stock.models import MyStock
    from stock.models.macro import MacroSeries, MacroDataPoint, StockMacroCorrelation
    
    key_series = ["DGS10", "T10Y2Y", "CPIAUCSL", "UNRATE", "INDPRO"]
    windows = [90, 180, 365]
    
    for stock in MyStock.objects.all():
        # Get stock daily returns
        prices = list(
            stock.historicals.order_by("on").values_list("on", "close_price")
        )
        if len(prices) < 90:
            continue
        
        stock_dates = [p[0] for p in prices]
        stock_returns = [
            (prices[i][1] - prices[i-1][1]) / prices[i-1][1]
            for i in range(1, len(prices))
        ]
        
        for series_id in key_series:
            series = MacroSeries.objects.filter(series_id=series_id).first()
            if not series:
                continue
            
            macro_points = dict(
                series.data_points.values_list("date", "value")
            )
            
            for window in windows:
                # Align dates and compute Pearson correlation
                # ... numpy correlation computation ...
                
                StockMacroCorrelation.objects.update_or_create(
                    stock=stock, series=series, window_days=window,
                    defaults={"correlation": correlation_value}
                )
```

### API Endpoint

```python
class StockMacroCorrelationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StockMacroCorrelationSerializer
    filterset_fields = ["stock", "series", "window_days"]
    
    def get_queryset(self):
        user_stocks = MyStock.objects.filter(sectors__user=self.request.user)
        return StockMacroCorrelation.objects.filter(stock__in=user_stocks)
```

**URL**: `GET /api/v1/macro-correlations/?stock={id}`

### Statistics Provided

Per stock:
- Correlation with 10Y Treasury (rate sensitivity)
- Correlation with unemployment (consumer sensitivity)
- Correlation with CPI (pricing power indicator)
- Correlation with industrial production (economic sensitivity)
- Scatter plot: stock return vs macro change

---

## Step 5.7 — Earnings Surprise Impact Analysis

### Computation (post-earnings)

```python
# backend/stock/workers/compute_earnings_impact.py

class EarningsImpactComputer:
    """Compute price reaction to earnings announcements."""
    
    def __init__(self, stock):
        self.stock = stock
    
    def compute_all(self):
        """Compute impact for all past earnings events lacking it."""
        from datetime import timedelta
        events = self.stock.earnings_events.filter(
            reported_eps__isnull=False,
            price_impact__isnull=True,
            report_date__lte=date.today() - timedelta(days=7),  # Wait for 5-day data
        )
        
        for event in events:
            self._compute_single(event)
    
    def _compute_single(self, event):
        """Compute price impact for one earnings event."""
        historicals = self.stock.historicals.filter(
            on__gte=event.report_date - timedelta(days=5),
            on__lte=event.report_date + timedelta(days=10),
        ).order_by("on")
        
        # Find price before (last trading day before report_date)
        before = historicals.filter(on__lt=event.report_date).last()
        # Find price after 1 day
        after_1d = historicals.filter(on__gt=event.report_date).first()
        # Find price after 5 days
        after_records = list(historicals.filter(on__gt=event.report_date)[:5])
        after_5d = after_records[-1] if len(after_records) >= 5 else None
        
        if not (before and after_1d):
            return
        
        # Compute volume ratio
        avg_vol = self.stock.historicals.filter(
            on__lt=event.report_date
        ).order_by("-on")[:20].aggregate(Avg("vol"))["vol__avg"]
        
        earnings_day = historicals.filter(on__gte=event.report_date).first()
        vol_ratio = earnings_day.vol / avg_vol if avg_vol and earnings_day else None
        
        EarningsPriceImpact.objects.update_or_create(
            earnings_event=event,
            defaults={
                "price_before": before.close_price,
                "price_after_1d": after_1d.close_price,
                "price_after_5d": after_5d.close_price if after_5d else after_1d.close_price,
                "gap_pct": (after_1d.open_price / before.close_price - 1) * 100,
                "reaction_1d_pct": (after_1d.close_price / before.close_price - 1) * 100,
                "reaction_5d_pct": (after_5d.close_price / before.close_price - 1) * 100 if after_5d else None,
                "volume_ratio": vol_ratio,
            }
        )
```

### Statistics Provided Per Stock

| Metric | Description |
|--------|-------------|
| Beat rate | % of quarters beating consensus (last 4/8/16) |
| Average surprise % | Typical beat/miss magnitude |
| Avg gap on beat | Average overnight gap when earnings beat |
| Avg gap on miss | Average overnight gap when earnings miss |
| Post-earnings drift (5d) | Average 5-day move after beats vs misses |
| Volume spike ratio | How much extra volume earnings generate |
| Guidance reliability | Does mgmt guide conservatively? (beats/total) |

---

## Step 5.8 — Frontend: "Ownership" Tab in StockDetailView

### New Section in StockDetailView

```jsx
// Add to sections array in StockDetailView/index.jsx:
{
  label: "Ownership",
  items: [
    { url: "insider-trades", text: "Insider Trades" },
    { url: "institutional", text: "Institutional Holdings" },
  ],
}
```

### Insider Trades View

```jsx
// src/views/stock/InsiderTradesView/index.jsx

// Components:
// 1. InsiderSentimentGauge — ECharts gauge showing -1 to +1 sentiment
// 2. InsiderTradesTimeline — Bar chart (green=buy, red=sell) over time
// 3. InsiderTradesTable — DataGrid with sort/filter
// 4. ClusterBuyAlert — Banner when 3+ insiders buy within 14 days

// Data: GET /api/v1/insider-trades/?stock={id}
```

### Institutional Holdings View

```jsx
// src/views/stock/InstitutionalView/index.jsx

// Components:
// 1. TopHoldersPie — Pie chart of top 10 holders
// 2. OwnershipTrendChart — Area chart: institutional % over quarters
// 3. NetPositionChanges — Bar chart: new/increased vs decreased/exited
// 4. HoldingsTable — Full table of institutions
// 5. SmartMoneySignal — Alert when top institutions increase by >10%

// Data: GET /api/v1/holdings/?stock={id}
//       GET /api/v1/holdings-summary/?stock={id}
```

---

## Step 5.9 — Frontend: Macro Overlay on Price Charts

### Price Chart Enhancement

On `PriceView` (historical price chart), add overlay controls:

```jsx
// src/components/stock/PriceChart/MacroOverlay.jsx

// UI: Dropdown/checkboxes above the chart
// Available overlays:
//   □ 10Y Treasury Yield (DGS10)
//   □ Fed Funds Rate
//   □ 2s10s Spread
//   □ High Yield Spread
//   □ CPI YoY Change

// When checked:
// - Fetch macro data: GET /api/v1/macro-data/?series_id=DGS10&date__gte={startDate}
// - Add second Y-axis to ECharts
// - Plot macro series as dashed line on secondary axis
// - Color: distinct from price lines (orange, purple, etc.)
```

### ECharts Configuration

```javascript
// Dual Y-axis config for ECharts
option = {
  yAxis: [
    { type: "value", name: "Price ($)", position: "left" },
    { type: "value", name: "Yield (%)", position: "right" },
  ],
  series: [
    { name: symbol, type: "line", yAxisIndex: 0, data: priceData },
    { name: "10Y Treasury", type: "line", yAxisIndex: 1, data: macroData, lineStyle: { type: "dashed" } },
  ],
};
```

### Dashboard Macro Widget

```jsx
// src/components/dashboard/MacroWidget/index.jsx

// Displays key macro indicators in a card grid:
// - 10Y Treasury (with ↑↓ vs last week)
// - Fed Funds Rate
// - 2s10s Spread (⚠️ if negative = inversion)
// - HY Spread (⚠️ if > 5% = stress)
// - Unemployment Rate
// - CPI (with YoY change)
// - Sahm Rule (⚠️ if > 0.5 = recession signal)

// Data: GET /api/v1/macro-data/?series_id=DGS10 (latest 2 points for delta)
```

---

## Step 5.10 — Frontend: Earnings Markers on Price Chart

### Price Chart Enhancement

On `PriceView`, overlay vertical markers at earnings dates:

```jsx
// src/components/stock/PriceChart/EarningsMarkers.jsx

// Fetch: GET /api/v1/earnings/?stock={id}
// For each earnings event within the chart date range:
//   - Draw vertical dashed line at report_date
//   - Color: green (beat), red (miss), gray (upcoming)
//   - Tooltip on hover: "Q2 2026: EPS $3.21 vs est $3.05 (+5.2%)"
//   - Small label above line: "+5%" or "-3%"
```

### ECharts markLine Configuration

```javascript
// Add to existing price chart options:
series[0].markLine = {
  data: earningsEvents.map(e => ({
    xAxis: e.report_date,
    lineStyle: { color: e.surprise_pct > 0 ? "#4caf50" : "#f44336", type: "dashed" },
    label: { formatter: `${e.surprise_pct > 0 ? "+" : ""}${e.surprise_pct.toFixed(1)}%` },
  })),
};
```

### Earnings Badge on Stock Header

```jsx
// In StockDetailView header, next to symbol:
// If next earnings < 14 days away:
//   ⏰ Earnings in {N} days ({date} {AMC/BMO})
// If < 7 days:
//   ⚠️ Earnings in {N} days — reduce position size
```

---

## Implementation Order & Dependencies

```
Step 5.1 (SEC Insider) ─────┐
Step 5.2 (SEC Holdings) ────┤
Step 5.3 (FRED Macro) ──────┼── Can all be implemented in parallel
Step 5.4 (Alpha Earnings) ──┘
                            │
                            ▼
Step 5.5 (Insider Score) ───── Requires 5.1
Step 5.6 (Macro Corr) ─────── Requires 5.3
Step 5.7 (Earnings Impact) ── Requires 5.4
                            │
                            ▼
Step 5.8 (Ownership Tab) ──── Requires 5.1 + 5.2
Step 5.9 (Macro Overlay) ──── Requires 5.3
Step 5.10 (Earnings Marks) ── Requires 5.4
```

## DevOps Workflow

Each step follows the established pattern:

```
1. git checkout feat-ai-revive-this-stack && git pull
2. git checkout -b feat-step-5.{N}-{description}
3. Implement: model → migration → worker → task → API → frontend
4. Test: pytest + manual API verification + frontend rendering
5. PAUSE — ask human to confirm
6. git push -u origin feat-step-5.{N}-{description}
7. Create PR targeting feat-ai-revive-this-stack
8. Merge and continue
```

## Frontend Route Changes

### StockDetailView sections (updated)

```javascript
const sections = [
  {
    label: "Price & Trends",
    items: [
      { url: "historical/price", text: "Daily Prices" },
      // ... existing items ...
    ],
  },
  {
    label: "Tech Indicators",
    items: [ /* existing */ ],
  },
  {
    label: "Financials",
    items: [ /* existing */ ],
  },
  {
    label: "Valuation",
    items: [
      { url: "dupont", text: "Dupont ROE" },
      { url: "dcf", text: "DCF" },
      { url: "ratios", text: "Ratios" },
      { url: "nav", text: "NAV" },
      { url: "earnings", text: "Earnings" },  // NEW (Step 5.4)
    ],
  },
  {
    label: "Ownership",  // NEW SECTION (Steps 5.1, 5.2)
    items: [
      { url: "insider-trades", text: "Insider Trades" },
      { url: "institutional", text: "Institutional" },
    ],
  },
];
```

### New Routes

```javascript
// In router configuration:
{ path: "stocks/:id/earnings", element: <EarningsView /> },
{ path: "stocks/:id/insider-trades", element: <InsiderTradesView /> },
{ path: "stocks/:id/institutional", element: <InstitutionalView /> },
```

### Dashboard Additions

```javascript
// TodayDashboardView — add two new widgets:
// 1. MacroWidget — FRED key indicators
// 2. UpcomingEarningsWidget — next 14 days earnings calendar
```

---

## Summary: What Each Data Source Adds to the App

| Source | New Models | New API Endpoints | New Frontend Views | Key Statistics |
|--------|-----------|------------------|-------------------|----------------|
| SEC EDGAR | InsiderTrade, InstitutionalHolding, InstitutionalSummary, TickerCIKMapping | /insider-trades/, /holdings/, /holdings-summary/ | Insider Trades tab, Institutional tab | Insider sentiment score, cluster buy alerts, smart money flow |
| FRED | MacroSeries, MacroDataPoint, StockMacroCorrelation | /macro-series/, /macro-data/, /macro-correlations/ | Dashboard macro widget, price chart overlay, sector correlation heatmap | Rate sensitivity, inflation correlation, recession probability |
| Alpha Vantage | EarningsEvent, EarningsPriceImpact | /earnings/, /earnings/upcoming/ | Earnings view, price chart markers, dashboard earnings widget, stock header badge | Beat rate, surprise magnitude, post-earnings drift, gap analysis |
