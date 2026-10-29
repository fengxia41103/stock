# SEC EDGAR Integration Plan (Steps 5.1–5.2)

## Why SEC EDGAR

Yahoo Finance provides summary financials but lacks:
- **Insider transactions** (Form 4): CEO/CFO buying/selling signals
- **Institutional holdings** (13F): Smart money flow quarterly snapshots
- **Authoritative filings**: The actual source-of-truth for all US public companies

All SEC EDGAR data is **completely free** with no API key required — just a User-Agent header identifying your app.

## API Details

Base URL: `https://data.sec.gov/`

| Endpoint | Data | Rate Limit |
|----------|------|------------|
| `/submissions/CIK{cik}.json` | Company filings index | 10 req/sec |
| `/api/xbrl/companyfacts/CIK{cik}.json` | Structured XBRL financials | 10 req/sec |
| `https://efts.sec.gov/LATEST/search-index?q=...` | Full-text search | 10 req/sec |

Insider trades (Form 4) are available via:
- `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={ticker}&type=4&dateb=&owner=include&count=40`
- Or parsed from SGML/XML in the filing itself

For this plan, we'll use the **SEC EDGAR API** directly (raw HTTP requests with proper headers) rather than a third-party wrapper, to minimize dependencies and ensure long-term stability.

---

## Step 5.1 — Insider Trades (Form 4)

### Data Model

```python
# backend/stock/models/insider_trade.py

class InsiderTrade(models.Model):
    """SEC Form 4 insider transaction."""
    stock = models.ForeignKey(MyStock, on_delete=models.CASCADE, related_name="insider_trades")
    filed_on = models.DateField()              # Filing date
    trade_date = models.DateField()            # Actual transaction date
    
    # Insider identity
    insider_name = models.CharField(max_length=256)
    insider_title = models.CharField(max_length=128)  # CEO, CFO, Director, 10% Owner
    insider_cik = models.CharField(max_length=20)
    
    # Transaction details
    transaction_type = models.CharField(max_length=2)  # P=Purchase, S=Sale, A=Award, etc.
    shares = models.FloatField()               # Number of shares
    price_per_share = models.FloatField(null=True)      # Price per share (null for awards)
    total_value = models.FloatField(null=True)          # shares × price
    shares_owned_after = models.FloatField(null=True)   # Holdings post-transaction
    
    # Ownership type
    is_direct = models.BooleanField(default=True)  # Direct vs indirect ownership
    
    class Meta:
        unique_together = ("stock", "trade_date", "insider_cik", "transaction_type", "shares")
        indexes = [
            models.Index(fields=["stock", "-trade_date"]),
            models.Index(fields=["stock", "transaction_type"]),
        ]
        ordering = ["-trade_date"]

    @property
    def is_purchase(self):
        return self.transaction_type == "P"

    @property
    def is_sale(self):
        return self.transaction_type in ("S", "S-Sale")
```

### Worker

```python
# backend/stock/workers/get_insider_trades.py

import requests
import xml.etree.ElementTree as ET
from datetime import date, timedelta
from stock.models import MyStock
from stock.models.insider_trade import InsiderTrade

SEC_BASE = "https://www.sec.gov"
HEADERS = {
    "User-Agent": os.environ.get("SEC_EDGAR_USER_AGENT", "StockApp/1.0 (dev@example.com)"),
    "Accept-Encoding": "gzip, deflate",
}

class InsiderTradeWorker:
    """Fetch Form 4 insider trades from SEC EDGAR."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        # Step 1: Get CIK from ticker
        cik = self._get_cik(self.stock.symbol)
        if not cik:
            return

        # Step 2: Get recent Form 4 filings
        filings = self._get_form4_filings(cik, count=40)

        # Step 3: Parse each filing for transactions
        for filing_url in filings:
            self._parse_form4(filing_url)

    def _get_cik(self, ticker):
        """Map ticker → CIK using SEC's tickers.json."""
        resp = requests.get(
            "https://www.sec.gov/files/company_tickers.json",
            headers=HEADERS
        )
        data = resp.json()
        for entry in data.values():
            if entry["ticker"].upper() == ticker.upper():
                return str(entry["cik_str"]).zfill(10)
        return None

    def _get_form4_filings(self, cik, count=40):
        """Get URLs of recent Form 4 filings."""
        url = f"https://data.sec.gov/submissions/CIK{cik}.json"
        resp = requests.get(url, headers=HEADERS)
        data = resp.json()
        
        filings = data.get("filings", {}).get("recent", {})
        urls = []
        for i, form_type in enumerate(filings.get("form", [])):
            if form_type == "4":
                accession = filings["accessionNumber"][i].replace("-", "")
                primary_doc = filings["primaryDocument"][i]
                urls.append(f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession}/{primary_doc}")
                if len(urls) >= count:
                    break
        return urls

    def _parse_form4(self, url):
        """Parse a Form 4 XML filing into InsiderTrade records."""
        resp = requests.get(url, headers=HEADERS)
        # Parse XML, extract transactions
        # ... (XML parsing logic for ownershipDocument)
        # Create InsiderTrade records with get_or_create
```

### API Endpoint

```python
# backend/stock/api/views.py (addition)

class InsiderTradeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InsiderTradeSerializer
    filterset_fields = ["stock", "transaction_type", "insider_title"]
    ordering_fields = ["trade_date", "total_value"]
    ordering = ["-trade_date"]

    def get_queryset(self):
        user_stocks = MyStock.objects.filter(sectors__user=self.request.user)
        return InsiderTrade.objects.filter(stock__in=user_stocks)
```

**URL**: `GET /api/v1/insider-trades/?stock={id}`

### Celery Task

```python
# In tasks.py

@app.task(queue="edgar", rate_limit="10/m")
def __insider_trade_consumer(symbol):
    InsiderTradeWorker(symbol).get()

@app.task(queue="edgar")
def insider_daily():
    """Fetch insider trades for all stocks."""
    from celery import group
    tasks = group(
        __insider_trade_consumer.s(stock.symbol) for stock in MyStock.objects.all()
    )
    tasks.apply_async()
```

### Frontend: Insider Trades Tab

New tab in `StockDetailView` under a new **"Ownership"** section:

```jsx
// src/views/stock/InsiderTradesView/index.jsx
// Displays:
// 1. Timeline chart: green bars (purchases) / red bars (sales) over time
// 2. Net insider sentiment: sum(purchases) - sum(sales) over 3/6/12 months
// 3. Table: date, insider name, title, type, shares, price, value
// 4. "Cluster buying" alerts: when 3+ insiders buy within 2 weeks
```

---

## Step 5.2 — Institutional Holdings (13F)

### Data Model

```python
# backend/stock/models/institutional_holding.py

class InstitutionalHolding(models.Model):
    """Quarterly 13F institutional holding snapshot."""
    stock = models.ForeignKey(MyStock, on_delete=models.CASCADE, related_name="holdings_13f")
    report_date = models.DateField()           # Quarter end date
    
    # Institution
    institution_name = models.CharField(max_length=256)
    institution_cik = models.CharField(max_length=20)
    
    # Holding details
    shares = models.BigIntegerField()          # Shares held
    value = models.FloatField()                # Market value ($thousands as reported)
    
    # Change vs prior quarter
    change_shares = models.BigIntegerField(null=True)   # + or - shares from prior
    change_type = models.CharField(max_length=10, null=True)  # NEW, ADD, REDUCE, EXIT, UNCHANGED
    
    class Meta:
        unique_together = ("stock", "report_date", "institution_cik")
        indexes = [
            models.Index(fields=["stock", "-report_date"]),
        ]
        ordering = ["-report_date", "-value"]


class InstitutionalSummary(models.Model):
    """Aggregated quarterly snapshot: total institutional ownership for a stock."""
    stock = models.ForeignKey(MyStock, on_delete=models.CASCADE, related_name="holdings_summary")
    report_date = models.DateField()
    
    total_institutions = models.IntegerField()
    total_shares = models.BigIntegerField()
    total_value = models.FloatField()         # $thousands
    pct_outstanding = models.FloatField(null=True)  # % of shares outstanding
    
    # Quarter-over-quarter changes
    new_positions = models.IntegerField(default=0)
    increased_positions = models.IntegerField(default=0)
    decreased_positions = models.IntegerField(default=0)
    exited_positions = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ("stock", "report_date")
        ordering = ["-report_date"]
```

### Worker

```python
# backend/stock/workers/get_holdings.py

class InstitutionalHoldingsWorker:
    """Fetch 13F institutional holdings from SEC EDGAR XBRL API."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        cik = self._get_cik(self.stock.symbol)
        if not cik:
            return

        # Use SEC's company facts API for shares held
        url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
        # ... parse institutional holder data

        # Alternative: Use SEC's mutual fund search
        # https://efts.sec.gov/LATEST/search-index?q={ticker}&dateRange=custom&startdt=...&forms=13F-HR
```

### API Endpoint

**URL**: `GET /api/v1/holdings/?stock={id}`
**URL**: `GET /api/v1/holdings-summary/?stock={id}`

### Frontend: Holdings Tab

```
Displays:
1. Pie chart: Top 10 institutional holders (% of outstanding)
2. Stacked area chart: institutional ownership % over quarters
3. Bar chart: net new positions vs exits per quarter
4. Table: institution name, shares, value, change, change_type
5. "Smart money signal": when top 10 institutions increase/decrease significantly
```

---

## CIK Mapping Cache

To avoid repeated lookups, cache ticker→CIK mapping:

```python
# backend/stock/models/misc.py (addition)

class TickerCIKMapping(models.Model):
    """Cache SEC CIK codes for stock tickers."""
    symbol = models.CharField(max_length=64, unique=True)
    cik = models.CharField(max_length=20)
    company_name = models.CharField(max_length=256)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## Integration with `batch_update_helper`

When a new stock is added, also fetch EDGAR data:

```python
def batch_update_helper(user, symbol):
    # ... existing chains ...
    
    # Chain 3 (edgar queue): insider trades + holdings
    get_edgar = chain(
        __insider_trade_consumer.s(symbol),
        __holdings_consumer.s(symbol),
    )
    task_3 = get_edgar.apply_async()
    saved_task = MyTask(id=task_3.id, state=task_3.state, user=user)
    saved_task.save()
    saved_task.stocks.add(MyStock.objects.get(symbol=symbol))
```
