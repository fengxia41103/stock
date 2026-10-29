# Alpha Vantage Integration Plan (Step 5.4)

## Why Alpha Vantage

Your Darwin analysis + short-term box trading strategy needs:
- **Earnings calendar**: Know WHEN earnings happen (critical for "don't hold heavy through earnings" rule)
- **Consensus estimates**: EPS surprise = the #1 single-day catalyst for your Darwin stocks
- **Pre-computed technicals**: Validate your own computations + add indicators not yet implemented

## API Details

- Base URL: `https://www.alphavantage.co/query`
- Auth: Free API key (25 requests/day on free tier, 75 on premium $50/month)
- Python: raw `requests` (avoid `alpha-vantage` package — it adds unnecessary abstraction)
- Response: JSON

## Rate Limit Strategy

Free tier = 25 calls/day. With 24 Darwin stocks + macro:
- Earnings calendar: 1 call covers ALL stocks (bulk endpoint)
- Earnings surprise per stock: 24 calls
- Total: ~25 calls/day → fits free tier if we run one category per day

Schedule rotation:
```
Monday:    Earnings calendar (1 call)
Tuesday:   Earnings surprise for stocks 1-12 (12 calls)
Wednesday: Earnings surprise for stocks 13-24 (12 calls)
Thursday:  Company overview refresh for stocks needing update (as needed)
```

## Data Model

```python
# backend/stock/models/earnings.py

class EarningsEvent(models.Model):
    """Earnings calendar entry — upcoming or historical."""
    stock = models.ForeignKey(MyStock, on_delete=models.CASCADE, related_name="earnings_events")
    
    # Calendar info
    report_date = models.DateField()           # Actual or expected earnings date
    fiscal_date_ending = models.DateField()    # End of fiscal quarter
    
    # Timing
    report_time = models.CharField(max_length=16, null=True)  # "BMO" (before market open), "AMC" (after close)
    
    # Estimates vs Actuals (null if upcoming/not yet reported)
    estimated_eps = models.FloatField(null=True)    # Consensus EPS estimate
    reported_eps = models.FloatField(null=True)     # Actual reported EPS
    surprise = models.FloatField(null=True)         # reported - estimated
    surprise_pct = models.FloatField(null=True)     # (reported - estimated) / |estimated| * 100
    
    # Revenue (if available)
    estimated_revenue = models.FloatField(null=True)   # In billions
    reported_revenue = models.FloatField(null=True)    # In billions
    revenue_surprise_pct = models.FloatField(null=True)
    
    class Meta:
        unique_together = ("stock", "report_date")
        indexes = [
            models.Index(fields=["stock", "-report_date"]),
            models.Index(fields=["report_date"]),  # For "upcoming earnings" queries
        ]
        ordering = ["-report_date"]

    @property
    def is_upcoming(self):
        from datetime import date
        return self.report_date >= date.today()

    @property
    def is_beat(self):
        if self.surprise_pct is None:
            return None
        return self.surprise_pct > 0

    @property
    def is_miss(self):
        if self.surprise_pct is None:
            return None
        return self.surprise_pct < 0
```

## Worker

```python
# backend/stock/workers/get_earnings.py

import os
import requests
from datetime import date
from stock.models import MyStock
from stock.models.earnings import EarningsEvent

AV_API_KEY = os.environ.get("ALPHA_VANTAGE_API_KEY", "")
AV_BASE = "https://www.alphavantage.co/query"


class EarningsCalendarWorker:
    """Fetch upcoming earnings calendar for all stocks (single API call)."""

    def get(self):
        """Fetch 3-month earnings calendar (CSV endpoint, 1 API call)."""
        url = f"{AV_BASE}?function=EARNINGS_CALENDAR&horizon=3month&apikey={AV_API_KEY}"
        resp = requests.get(url)
        # Returns CSV with: symbol, name, reportDate, fiscalDateEnding, estimate, currency
        
        tracked_symbols = set(MyStock.objects.values_list("symbol", flat=True))
        
        import csv
        import io
        reader = csv.DictReader(io.StringIO(resp.text))
        for row in reader:
            if row["symbol"] not in tracked_symbols:
                continue
            
            stock = MyStock.objects.get(symbol=row["symbol"])
            EarningsEvent.objects.update_or_create(
                stock=stock,
                report_date=row["reportDate"],
                defaults={
                    "fiscal_date_ending": row["fiscalDateEnding"],
                    "estimated_eps": float(row["estimate"]) if row["estimate"] else None,
                }
            )


class EarningsSurpriseWorker:
    """Fetch historical earnings surprises for a single stock."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        """Fetch last 4 quarters of earnings data."""
        url = (
            f"{AV_BASE}?function=EARNINGS&symbol={self.stock.symbol}&apikey={AV_API_KEY}"
        )
        resp = requests.get(url)
        data = resp.json()

        for q in data.get("quarterlyEarnings", []):
            report_date = q.get("reportedDate")
            if not report_date:
                continue

            EarningsEvent.objects.update_or_create(
                stock=self.stock,
                report_date=report_date,
                defaults={
                    "fiscal_date_ending": q.get("fiscalDateEnding"),
                    "report_time": None,
                    "estimated_eps": _float(q.get("estimatedEPS")),
                    "reported_eps": _float(q.get("reportedEPS")),
                    "surprise": _float(q.get("surprise")),
                    "surprise_pct": _float(q.get("surprisePercentage")),
                }
            )


def _float(val):
    try:
        return float(val) if val and val != "None" else None
    except (ValueError, TypeError):
        return None
```

## API Endpoints

```python
class EarningsEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EarningsEventSerializer
    filterset_fields = ["stock", "report_date"]
    ordering = ["-report_date"]

    def get_queryset(self):
        user_stocks = MyStock.objects.filter(sectors__user=self.request.user)
        return EarningsEvent.objects.filter(stock__in=user_stocks)

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        """Next 30 days of earnings for user's stocks."""
        from datetime import date, timedelta
        user_stocks = MyStock.objects.filter(sectors__user=request.user)
        events = EarningsEvent.objects.filter(
            stock__in=user_stocks,
            report_date__gte=date.today(),
            report_date__lte=date.today() + timedelta(days=30),
        ).select_related("stock")
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
```

**URLs**:
- `GET /api/v1/earnings/?stock={id}` — all earnings for a stock
- `GET /api/v1/earnings/upcoming/` — next 30 days across all user stocks

## Celery Tasks

```python
@app.task(queue="alpha")
def earnings_calendar_daily():
    """Fetch 3-month earnings calendar (1 API call)."""
    EarningsCalendarWorker().get()

@app.task(queue="alpha", rate_limit="5/m")
def __earnings_surprise_consumer(symbol):
    EarningsSurpriseWorker(symbol).get()

@app.task(queue="alpha")
def earnings_surprise_batch(symbols):
    """Fetch surprise data for a batch of symbols."""
    from celery import chain
    tasks = chain(
        __earnings_surprise_consumer.s(sym) for sym in symbols
    )
    tasks.apply_async()
```

## Frontend Integration

### Earnings Badge on Stock Card

On `ListStockCard` and `StockDetailView` header, show:

```
MSFT  $379  ⏰ Earnings in 12 days (Jul 22 AMC)
```

Yellow warning badge when earnings < 7 days away → reinforces "don't hold heavy through earnings."

### Earnings History View (new sub-tab under Valuation)

```jsx
// src/views/stock/EarningsView/index.jsx

// Displays:
// 1. Bar chart: EPS surprise % per quarter (green=beat, red=miss)
// 2. Revenue surprise % per quarter
// 3. Stock price reaction: 1-day / 5-day move after earnings
// 4. Table: date, estimate, actual, surprise%, price_before, price_after, reaction%
// 5. "Beat streak": consecutive quarters of EPS beats
```

### Price Chart Earnings Markers

On the stock historical price view, add vertical dashed lines at each earnings date:

```
Price Chart with Earnings Markers:

$400 ─────────────────────────────────────────
     │          │              │
     │     📈+8% │         📉-3% │
     │   (beat)  │        (miss) │
$350 ─────────────────────────────────────────
     Jan        Apr            Jul

Vertical line color: green (beat), red (miss), gray (upcoming)
Tooltip: "Q2 2026: EPS $3.21 vs est $3.05 (+5.2%)"
```

### Dashboard: Upcoming Earnings Widget

On the Today/Dashboard view:

```
┌─────────────────────────────────────────────────────┐
│  📅 Upcoming Earnings (next 2 weeks)                 │
│                                                      │
│  Jul 22  MSFT  AMC  est $3.05    ⚡ 12 of 16 beats │
│  Jul 24  GOOGL BMO  est $2.12    ⚡ 14 of 16 beats │
│  Jul 25  V     AMC  est $2.80    ⚡ 15 of 16 beats │
│  Aug 01  AAPL  AMC  est $1.41    ⚡ 13 of 16 beats │
│                                                      │
│  ⚠️ Reduce position size 3 days before earnings     │
└─────────────────────────────────────────────────────┘
```

## Computed Analysis

### Earnings Surprise Impact Score

```python
# backend/stock/models/earnings.py (addition)

class EarningsPriceImpact(models.Model):
    """Price reaction to earnings announcement."""
    earnings_event = models.OneToOneField(EarningsEvent, on_delete=models.CASCADE, related_name="price_impact")
    
    # Price before/after
    price_before = models.FloatField()         # Close price day before earnings
    price_after_1d = models.FloatField()       # Close price 1 day after
    price_after_5d = models.FloatField()       # Close price 5 days after
    
    # Computed reactions
    gap_pct = models.FloatField()              # Open after / close before - 1 (overnight gap)
    reaction_1d_pct = models.FloatField()      # 1-day total return
    reaction_5d_pct = models.FloatField()      # 5-day total return
    
    # Context
    volume_ratio = models.FloatField(null=True)  # Volume on earnings day / avg 20-day volume
```

Computed after each earnings date passes:
- Look up historical price on earnings_date - 1, earnings_date, earnings_date + 5
- Calculate gap, 1-day, 5-day reactions
- Calculate volume ratio (measures how much attention the earnings got)

### Beat/Miss Pattern Analysis

Per stock, compute:
- **Beat rate**: % of quarters that beat consensus (last 4, 8, 16 quarters)
- **Average surprise magnitude**: typical beat/miss size
- **Post-earnings drift**: average 5-day move after beats vs misses
- **Guidance reliability**: does management guide conservatively?

```python
@property
def earnings_beat_rate(self):
    """% of last 16 quarters that beat EPS estimate."""
    events = self.earnings_events.filter(surprise_pct__isnull=False).order_by("-report_date")[:16]
    if not events:
        return None
    beats = sum(1 for e in events if e.surprise_pct > 0)
    return beats / len(events) * 100
```
