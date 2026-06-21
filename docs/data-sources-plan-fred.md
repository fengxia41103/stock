# FRED Integration Plan (Step 5.3)

## Why FRED

Your Darwin analysis framework references "rate sensitivity," "economic cycle positioning," and "sector rotation." FRED provides the authoritative macro data to quantify these.

Key use cases:
- **Live risk-free rate** for DCF model (currently hardcoded at 1.242%)
- **Recession probability** indicators for sector rotation timing
- **Yield curve** shape for financial stock analysis
- **CPI/inflation** for assessing pricing power (critical for PEP, PG, COST, SHW)
- **Employment data** for consumer-facing stocks

## API Details

- Base URL: `https://api.stlouisfed.org/fred/`
- Auth: Free API key from https://fred.stlouisfed.org/docs/api/api_key.html
- Rate limit: None documented (generous)
- Python library: `fredapi>=0.5.2`
- Response format: JSON or XML

## Data Model

```python
# backend/stock/models/macro.py

class MacroSeries(models.Model):
    """FRED economic time series metadata."""
    series_id = models.CharField(max_length=32, unique=True)  # e.g. "DGS10", "UNRATE"
    title = models.CharField(max_length=256)
    frequency = models.CharField(max_length=16)  # Daily, Weekly, Monthly, Quarterly
    units = models.CharField(max_length=128)
    last_updated = models.DateTimeField(null=True)
    
    # Categorization
    category = models.CharField(max_length=64)  # rates, employment, inflation, gdp, housing
    
    class Meta:
        ordering = ["category", "series_id"]

    def __str__(self):
        return f"{self.series_id}: {self.title}"


class MacroDataPoint(models.Model):
    """Individual FRED observation."""
    series = models.ForeignKey(MacroSeries, on_delete=models.CASCADE, related_name="data_points")
    date = models.DateField()
    value = models.FloatField()
    
    class Meta:
        unique_together = ("series", "date")
        indexes = [
            models.Index(fields=["series", "-date"]),
        ]
        ordering = ["-date"]
```

## Series to Track

Selected for relevance to Darwin stock analysis:

### Interest Rates (category: "rates")

| Series ID | Name | Frequency | Use Case |
|-----------|------|-----------|----------|
| `DGS10` | 10-Year Treasury Yield | Daily | DCF risk-free rate |
| `DGS2` | 2-Year Treasury Yield | Daily | Yield curve (2s10s spread) |
| `FEDFUNDS` | Federal Funds Rate | Monthly | Rate sensitivity |
| `BAMLH0A0HYM2` | High Yield Spread (ICE BofA) | Daily | Credit risk indicator |

### Employment (category: "employment")

| Series ID | Name | Frequency | Use Case |
|-----------|------|-----------|----------|
| `UNRATE` | Unemployment Rate | Monthly | Consumer spending proxy |
| `PAYEMS` | Total Nonfarm Payrolls | Monthly | Economic health |
| `ICSA` | Initial Jobless Claims | Weekly | Leading indicator |

### Inflation (category: "inflation")

| Series ID | Name | Frequency | Use Case |
|-----------|------|-----------|----------|
| `CPIAUCSL` | CPI All Urban | Monthly | Inflation trend |
| `CPILFESL` | Core CPI (ex food/energy) | Monthly | Underlying inflation |
| `T5YIE` | 5-Year Breakeven Inflation | Daily | Market inflation expectations |

### Economic Activity (category: "gdp")

| Series ID | Name | Frequency | Use Case |
|-----------|------|-----------|----------|
| `GDP` | Gross Domestic Product | Quarterly | Macro cycle |
| `INDPRO` | Industrial Production | Monthly | Manufacturing proxy (UNP, FAST) |
| `RSAFS` | Retail Sales | Monthly | Consumer spend (COST, PEP, PG) |

### Recession Indicators (category: "recession")

| Series ID | Name | Frequency | Use Case |
|-----------|------|-----------|----------|
| `T10Y2Y` | 10Y-2Y Spread | Daily | Yield curve inversion signal |
| `SAHM` | Sahm Rule Recession Indicator | Monthly | Real-time recession probability |
| `USREC` | NBER Recession | Monthly | Official recession dating |

### Housing (category: "housing")

| Series ID | Name | Frequency | Use Case |
|-----------|------|-----------|----------|
| `HOUST` | Housing Starts | Monthly | SHW (paint) demand proxy |
| `MORTGAGE30US` | 30-Year Mortgage Rate | Weekly | Housing affordability |

---

## Worker

```python
# backend/stock/workers/get_fred.py

import os
from datetime import date, timedelta
from fredapi import Fred
from stock.models.macro import MacroSeries, MacroDataPoint

FRED_API_KEY = os.environ.get("FRED_API_KEY", "")

# All series to track
SERIES_CONFIG = {
    "rates": ["DGS10", "DGS2", "FEDFUNDS", "BAMLH0A0HYM2"],
    "employment": ["UNRATE", "PAYEMS", "ICSA"],
    "inflation": ["CPIAUCSL", "CPILFESL", "T5YIE"],
    "gdp": ["GDP", "INDPRO", "RSAFS"],
    "recession": ["T10Y2Y", "SAHM", "USREC"],
    "housing": ["HOUST", "MORTGAGE30US"],
}


class FredWorker:
    """Fetch FRED economic data series."""

    def __init__(self):
        self.fred = Fred(api_key=FRED_API_KEY)

    def get_all(self):
        """Fetch all configured series."""
        for category, series_ids in SERIES_CONFIG.items():
            for series_id in series_ids:
                self._fetch_series(series_id, category)

    def get_series(self, series_id, category="misc"):
        """Fetch a single series."""
        self._fetch_series(series_id, category)

    def _fetch_series(self, series_id, category):
        """Fetch data for one series, storing metadata + observations."""
        try:
            info = self.fred.get_series_info(series_id)
            series_obj, _ = MacroSeries.objects.update_or_create(
                series_id=series_id,
                defaults={
                    "title": info.get("title", series_id),
                    "frequency": info.get("frequency", ""),
                    "units": info.get("units", ""),
                    "category": category,
                    "last_updated": info.get("last_updated"),
                }
            )

            # Fetch last 2 years of data (or since last stored point)
            last_point = series_obj.data_points.order_by("-date").first()
            start = last_point.date if last_point else date.today() - timedelta(days=730)

            data = self.fred.get_series(series_id, observation_start=start)
            
            points_to_create = []
            for dt, val in data.items():
                if val is not None and not (hasattr(val, '__class__') and val != val):  # NaN check
                    points_to_create.append(
                        MacroDataPoint(series=series_obj, date=dt.date(), value=float(val))
                    )

            MacroDataPoint.objects.bulk_create(
                points_to_create, ignore_conflicts=True, batch_size=500
            )

        except Exception as e:
            print(f"[FRED] Failed to fetch {series_id}: {e}")
```

## API Endpoints

```python
# backend/stock/api/views.py (additions)

class MacroSeriesViewSet(viewsets.ReadOnlyModelViewSet):
    """List available FRED series."""
    serializer_class = MacroSeriesSerializer
    queryset = MacroSeries.objects.all()
    filterset_fields = ["category", "series_id"]


class MacroDataPointViewSet(viewsets.ReadOnlyModelViewSet):
    """Get observations for a series."""
    serializer_class = MacroDataPointSerializer
    filterset_fields = ["series"]
    ordering = ["-date"]

    def get_queryset(self):
        qs = MacroDataPoint.objects.all()
        series_id = self.request.query_params.get("series_id")
        if series_id:
            qs = qs.filter(series__series_id=series_id)
        return qs
```

**URLs**:
- `GET /api/v1/macro-series/` — list all series metadata
- `GET /api/v1/macro-data/?series_id=DGS10` — get observations
- `GET /api/v1/macro-data/?series_id=DGS10&date__gte=2025-01-01` — filtered by date

## Celery Task

```python
@app.task(queue="macro")
def fred_weekly():
    """Refresh all FRED macro series."""
    FredWorker().get_all()
```

Schedule: Weekly on Sunday at 6 AM (macro data rarely updates more often).

## Computed Analysis

### Stock–Macro Correlation

```python
# backend/stock/models/macro.py (addition)

class StockMacroCorrelation(models.Model):
    """Rolling correlation between a stock's return and a macro series."""
    stock = models.ForeignKey(MyStock, on_delete=models.CASCADE, related_name="macro_correlations")
    series = models.ForeignKey(MacroSeries, on_delete=models.CASCADE)
    window_days = models.IntegerField()        # 30, 90, 180, 365
    correlation = models.FloatField()          # Pearson r, -1 to +1
    computed_at = models.DateField(auto_now=True)
    
    class Meta:
        unique_together = ("stock", "series", "window_days")
```

Computation: After `fred_weekly()` completes, compute rolling correlations between each stock's daily returns and macro series changes:

```python
def compute_macro_correlations(symbol):
    """Compute correlation of stock returns vs macro series changes."""
    stock = MyStock.objects.get(symbol=symbol)
    returns = stock.historicals.order_by("on").values_list("on", "close_price")
    # ... numpy correlation computation for each window ...
```

### DCF Risk-Free Rate Auto-Update

Replace the hardcoded `1.242%` default with live 10-Year Treasury yield:

```python
def get_risk_free_rate():
    """Get latest 10-Year Treasury yield from FRED data."""
    point = MacroDataPoint.objects.filter(
        series__series_id="DGS10"
    ).order_by("-date").first()
    return point.value / 100 if point else 0.04  # Default 4% if no data
```

## Frontend Integration

### Dashboard Macro Widget

New component on the Today/Dashboard view:

```
┌─────────────────────────────────────────────────────┐
│  Macro Environment                                   │
│                                                      │
│  10Y Treasury: 4.32% ↑   Fed Funds: 5.25%          │
│  2s10s Spread: -0.15% ⚠️  HY Spread: 3.8%          │
│  Unemployment: 3.9%       CPI: 3.2% ↓              │
│  Sahm Rule: 0.2 (no recession signal)              │
└─────────────────────────────────────────────────────┘
```

### Price Chart Overlay

On the stock historical price view, allow overlaying macro series:

```
Toggle checkboxes:
☐ 10Y Treasury (right Y axis)
☐ Fed Funds Rate
☐ CPI YoY
☐ 2s10s Spread
☐ High Yield Spread

When checked, overlay as a secondary line on the price chart (dual Y axis).
User can visually correlate rate changes with stock price moves.
```

### Correlation Heatmap (Sector View)

On sector detail, show a heatmap:

```
               DGS10   UNRATE   CPI    INDPRO
MSFT           -0.3    +0.1    -0.2    +0.4
AAPL           -0.2    +0.1    -0.1    +0.3
V              -0.1    -0.3    +0.1    +0.5
COST           +0.1    -0.2    +0.3    +0.2
...
```

Color: green for positive correlation, red for negative. Helps identify which stocks are rate-sensitive vs. inflation beneficiaries.
