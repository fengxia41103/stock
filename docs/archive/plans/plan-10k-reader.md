# 10-K Filing Reader — Implementation Plan

**Date**: 2026-08-09
**Goal**: Auto-read SEC 10-K filings, extract useful sections, summarize with LLM via AWS Bedrock.

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│ SEC EDGAR   │────▶│ edgartools   │────▶│ Extract       │────▶│ AWS Bedrock  │
│ (10-K HTML) │     │ (parse into  │     │ Item 1, 1A,   │     │ Claude 3.5   │
│             │     │  sections)   │     │ 7 (text)      │     │ Summarize    │
└─────────────┘     └──────────────┘     └───────────────┘     └──────────────┘
                                                                       │
                                                                  ┌────▼──────┐
                                                                  │ Store in  │
                                                                  │ Filing10K │
                                                                  │ model     │
                                                                  └───────────┘
```

---

## Step 1: Data Model

```python
# backend/stock/models/filing.py

class Filing10K(models.Model):
    """SEC 10-K filing with extracted and summarized sections."""
    
    stock = models.ForeignKey(MyStock, on_delete=CASCADE, related_name="filings_10k")
    fiscal_year = models.IntegerField()
    filed_date = models.DateField()
    accession_number = models.CharField(max_length=32, unique=True)
    
    # Raw extracted sections (truncated to 50K chars each)
    business_description = models.TextField(blank=True)   # Item 1
    risk_factors_raw = models.TextField(blank=True)        # Item 1A
    mda_raw = models.TextField(blank=True)                 # Item 7
    
    # LLM-generated summaries (via AWS Bedrock)
    business_summary = models.TextField(blank=True)        # 3-5 bullet points
    revenue_segments = models.JSONField(default=dict)      # {segment: pct}
    customer_concentration = models.TextField(blank=True)  # Top customer info
    moat_assessment = models.TextField(blank=True)         # What's the moat?
    top_risks = models.JSONField(default=list)             # [{risk, severity, category}]
    mda_highlights = models.TextField(blank=True)          # Key management quotes
    competitive_position = models.TextField(blank=True)    # vs peers
    
    # Meta
    summarized_at = models.DateTimeField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("stock", "fiscal_year")
        ordering = ["-fiscal_year"]
```

---

## Step 2: Worker — Download & Parse (Option A: edgartools)

```python
# backend/stock/workers/get_10k.py

from edgartools import Company

class Filing10KWorker:
    """Download and parse 10-K from SEC EDGAR using edgartools."""
    
    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)
    
    def get(self, years=2):
        """Fetch last N years of 10-K filings."""
        company = Company(self.stock.symbol)
        filings = company.get_filings(form="10-K").head(years)
        
        for filing in filings:
            tenk = filing.obj()  # Parsed TenK object
            
            # Extract sections
            business = str(tenk.item1 or "")[:50000]
            risks = str(tenk.item1a or "")[:50000]
            mda = str(tenk.item7 or "")[:50000]
            
            Filing10K.objects.update_or_create(
                stock=self.stock,
                fiscal_year=filing.filing_date.year,
                defaults={
                    "filed_date": filing.filing_date,
                    "accession_number": filing.accession_number,
                    "business_description": business,
                    "risk_factors_raw": risks,
                    "mda_raw": mda,
                }
            )
```

**Dependency**: `pip install edgartools>=5.16`

---

## Step 3: LLM Summarization (Option B: AWS Bedrock)

### AWS Bedrock Setup

```python
# backend/stock/workers/summarize_10k.py

import json
import boto3

class Filing10KSummarizer:
    """Summarize 10-K sections using AWS Bedrock (Claude)."""
    
    def __init__(self, profile_name=None, region="us-east-1"):
        session = boto3.Session(profile_name=profile_name)
        self.client = session.client("bedrock-runtime", region_name=region)
        self.model_id = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    
    def summarize(self, filing):
        """Generate all summaries for a Filing10K record."""
        
        # 1. Business summary + revenue segments + moat
        business_result = self._call_bedrock(
            self._business_prompt(filing.stock.symbol, filing.business_description)
        )
        
        # 2. Risk factors extraction
        risks_result = self._call_bedrock(
            self._risks_prompt(filing.stock.symbol, filing.risk_factors_raw)
        )
        
        # 3. MD&A highlights
        mda_result = self._call_bedrock(
            self._mda_prompt(filing.stock.symbol, filing.mda_raw)
        )
        
        # Parse and store
        filing.business_summary = business_result.get("summary", "")
        filing.revenue_segments = business_result.get("segments", {})
        filing.moat_assessment = business_result.get("moat", "")
        filing.customer_concentration = business_result.get("customers", "")
        filing.top_risks = risks_result.get("risks", [])
        filing.mda_highlights = mda_result.get("highlights", "")
        filing.competitive_position = mda_result.get("competitive", "")
        filing.summarized_at = timezone.now()
        filing.save()
    
    def _call_bedrock(self, prompt):
        """Call AWS Bedrock Claude and return parsed JSON."""
        response = self.client.invoke_model(
            modelId=self.model_id,
            contentType="application/json",
            accept="application/json",
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 2000,
                "messages": [{"role": "user", "content": prompt}],
            }),
        )
        result = json.loads(response["body"].read())
        text = result["content"][0]["text"]
        
        # Try to parse as JSON, fall back to raw text
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"raw": text}
    
    def _business_prompt(self, symbol, text):
        return f"""Analyze this 10-K Business Description for {symbol}.
Return JSON with:
{{
  "summary": "3-5 bullet points describing what the company does",
  "segments": {{"segment_name": percentage_of_revenue}},
  "moat": "One sentence: what is the competitive moat?",
  "customers": "Customer concentration info (top customers if disclosed)"
}}

TEXT (first 5000 chars):
{text[:5000]}"""

    def _risks_prompt(self, symbol, text):
        return f"""Extract the top 7 risk factors from this 10-K for {symbol}.
Return JSON:
{{
  "risks": [
    {{"risk": "short description", "severity": "high/medium/low", "category": "regulatory/competitive/operational/financial/macro/technology"}}
  ]
}}

Sort by severity (high first). TEXT (first 8000 chars):
{text[:8000]}"""

    def _mda_prompt(self, symbol, text):
        return f"""Extract key highlights from this MD&A section of {symbol}'s 10-K.
Return JSON:
{{
  "highlights": "3-5 key management statements about business direction, growth drivers, or challenges",
  "competitive": "Management's view of competitive position",
  "guidance_tone": "optimistic/cautious/defensive"
}}

TEXT (first 5000 chars):
{text[:5000]}"""
```

### AWS Configuration

```python
# Environment variables needed:
# AWS_PROFILE=339712907884_c-dhhs-itd-cwis-d-devops  (or whichever has Bedrock access)
# AWS_REGION=us-east-1
#
# OR for SSO:
# AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN

# In settings.py:
AWS_BEDROCK_PROFILE = os.environ.get("AWS_BEDROCK_PROFILE", None)
AWS_BEDROCK_REGION = os.environ.get("AWS_BEDROCK_REGION", "us-east-1")
AWS_BEDROCK_MODEL = os.environ.get("AWS_BEDROCK_MODEL", "anthropic.claude-3-5-sonnet-20241022-v2:0")
```

### .env additions:
```
# AWS Bedrock (for 10-K summarization)
AWS_BEDROCK_PROFILE=339712907884_c-dhhs-itd-cwis-d-devops
AWS_BEDROCK_REGION=us-east-1
```

---

## Step 4: Celery Tasks

```python
@app.task(queue="edgar")
def fetch_10k(symbol):
    """Download and parse 10-K for one stock."""
    Filing10KWorker(symbol).get(years=2)

@app.task(queue="summary")
def summarize_10k(symbol):
    """Summarize extracted 10-K sections using Bedrock."""
    filings = Filing10K.objects.filter(
        stock__symbol=symbol, summarized_at__isnull=True
    )
    summarizer = Filing10KSummarizer(
        profile_name=settings.AWS_BEDROCK_PROFILE,
        region=settings.AWS_BEDROCK_REGION,
    )
    for filing in filings:
        summarizer.summarize(filing)

@app.task(queue="edgar")
def fetch_all_10k():
    """Annual: fetch latest 10-K for all stocks."""
    for stock in MyStock.objects.all():
        try:
            Filing10KWorker(stock.symbol).get(years=1)
        except Exception:
            continue
```

### Scheduling
```python
# Quarterly check (10-Ks filed annually, check every 3 months)
sender.add_periodic_task(
    crontab(day_of_month=1, hour=3, minute=0),
    fetch_all_10k.s(),
    name="Fetch new 10-K filings quarterly",
)
```

---

## Step 5: API Endpoint

```python
class Filing10KViewSet(viewsets.ReadOnlyModelViewSet):
    """10-K filings with extracted sections and LLM summaries."""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        stocks = MyStock.objects.filter(sectors__user=self.request.user)
        qs = Filing10K.objects.filter(stock__in=stocks)
        stock_id = self.request.query_params.get("stock")
        if stock_id:
            qs = qs.filter(stock_id=stock_id)
        return qs

    @action(detail=True, methods=["post"])
    def summarize(self, request, pk=None):
        """Trigger LLM summarization for a filing."""
        filing = self.get_object()
        summarize_10k.delay(filing.stock.symbol)
        return Response({"status": "summarization queued"})
```

---

## Step 6: Frontend — "10-K" Tab

```
Stock Detail → Research → 10-K

┌─────────────────────────────────────────────────┐
│ MSFT — 10-K FY2026 (filed Oct 2025)            │
├─────────────────────────────────────────────────┤
│                                                  │
│ 📋 Business Summary                             │
│ • Enterprise software & cloud (Azure 40%+)      │
│ • Productivity suite (Office 365, 446M seats)   │
│ • Personal computing (Windows, Xbox, Surface)   │
│                                                  │
│ 🏗️ Revenue Segments          │ 🛡️ Moat         │
│ ┌──────────────────────┐     │ Switching costs + │
│ │ Cloud 42%  ████████  │     │ ecosystem lock-in │
│ │ Prod. 35%  ███████   │     │ across 300M users │
│ │ Personal 23% █████   │     │                   │
│ └──────────────────────┘     │                   │
│                                                  │
│ ⚠️ Top Risks (from 10-K)                        │
│ 🔴 HIGH: OpenAI partnership dependency          │
│ 🔴 HIGH: EU/US antitrust remedies               │
│ 🟡 MED:  China revenue exposure                 │
│ 🟡 MED:  AI capex ROI uncertainty               │
│ 🟢 LOW:  Cybersecurity incidents                │
│                                                  │
│ 📊 MD&A Highlights                              │
│ "Azure revenue grew 40% with AI services..."    │
│ "We expect capex of $55B in FY2027..."          │
│                                                  │
│ [📄 View Raw 10-K Sections] (expandable)        │
└─────────────────────────────────────────────────┘
```

---

## Step 7: Integration with Existing Features

| Feature | How 10-K Enhances It |
|---------|---------------------|
| **Thesis** | Auto-populate `driver_1/2/3` from revenue segments |
| **Risk Factors** | Pre-fill RiskFactor model from extracted risks |
| **AI Analysis** | Include 10-K summary in the prompt for better Darwin assessment |
| **Morning Brief** | Flag if a new 10-K was filed for any position |
| **Alerts** | Alert when a risk factor starts "materializing" (match news) |

---

## Execution Schedule

| Step | What | Effort | Dependency |
|------|------|--------|------------|
| 1 | `Filing10K` model + migration | 30 min | None |
| 2 | `edgartools` worker (download + parse) | 1.5h | `pip install edgartools` |
| 3 | AWS Bedrock summarizer | 2h | AWS SSO login + `boto3` |
| 4 | Celery tasks + scheduling | 30 min | Steps 2-3 |
| 5 | API endpoint + serializer | 30 min | Step 1 |
| 6 | Frontend tab (Research → 10-K) | 2h | Step 5 |
| 7 | Integration (thesis/risks/alerts) | 1h | Steps 1-6 |
| **Total** | | **~8h** | |

---

## AWS Bedrock Notes

### Access
- Account: `339712907884` (DHHS CWIS dev) — already has Bedrock enabled
- Region: `us-east-1` (Bedrock available)
- Model: `anthropic.claude-3-5-sonnet` (best quality/cost for summarization)
- Cost: ~$0.003 per 10-K section summarized (3 calls × ~2K tokens each)
- Total for 50 stocks × 2 years = ~$0.90

### Authentication in Docker
```yaml
# docker-compose.yml — mount AWS credentials for Bedrock access
services:
  celery:
    volumes:
      - ~/.aws:/root/.aws:ro  # Mount AWS config for Bedrock
```

Or use environment variables:
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...  # for SSO
```

### Fallback
If Bedrock is unavailable (expired token, etc.):
- Store raw sections anyway (Option A works standalone)
- Display raw text in frontend with "Summarize" button
- User clicks → triggers Bedrock summarization on demand
- Same pattern as existing `ai_analysis.py` (try Claude API → try Ollama → fallback)

---

## Dependencies

```
# requirements.txt additions
edgartools>=5.16
boto3>=1.35.0
```

---

*Plan created August 9, 2026.*
