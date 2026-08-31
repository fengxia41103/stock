# Reddit Social Sentiment Integration Plan

**Date**: 2026-08-25
**Goal**: Fetch stock-related posts/comments from Reddit (r/wallstreetbets, r/stocks, r/investing) and compute per-stock sentiment scores.

---

## Architecture

```
┌───────────────┐     ┌──────────────────┐     ┌────────────────┐     ┌──────────────┐
│ Reddit API    │────▶│ RedditSentiment  │────▶│ Sentiment      │────▶│ Frontend     │
│ (PRAW)        │     │ Worker           │     │ Scoring        │     │ Display      │
│               │     │ (fetch posts)    │     │ (TextBlob/     │     │              │
│ r/wallstreetbets    │                  │     │  VADER)        │     │ Gauge + Chart│
│ r/stocks      │     └──────────────────┘     └────────────────┘     └──────────────┘
│ r/investing   │                                      │
└───────────────┘                               ┌──────▼───────┐
                                                │ RedditPost   │
                                                │ model (DB)   │
                                                └──────────────┘
```

---

## Data Source: Reddit API via PRAW

### Why PRAW (Python Reddit API Wrapper)
- Official Reddit API wrapper — well-maintained, stable
- Free tier: 100 requests/minute (more than enough)
- Returns structured data: title, body, score (upvotes), comments, awards
- No web scraping needed — clean, reliable

### Reddit App Setup (one-time)
1. Go to https://www.reddit.com/prefs/apps
2. Create "script" app → get `client_id` and `client_secret`
3. Store in `.env`

### Subreddits to Monitor

| Subreddit | Why | Volume |
|-----------|-----|--------|
| r/wallstreetbets | Retail sentiment, YOLO plays, meme momentum | Very high |
| r/stocks | More analytical, DD posts | Medium |
| r/investing | Conservative, longer-horizon | Medium |
| r/options | Options flow sentiment | Low-medium |

---

## Data Model

```python
# backend/stock/models/reddit_sentiment.py

class RedditPost(models.Model):
    """A Reddit post or comment mentioning a stock."""
    stock = models.ForeignKey(MyStock, on_delete=CASCADE, related_name="reddit_posts")
    
    # Reddit metadata
    reddit_id = models.CharField(max_length=20, unique=True)  # Reddit's post/comment ID
    subreddit = models.CharField(max_length=64)               # wallstreetbets, stocks, etc.
    post_type = models.CharField(max_length=10)               # "post" or "comment"
    title = models.CharField(max_length=512, blank=True)      # Post title (empty for comments)
    body = models.TextField(blank=True)                       # Post/comment text (truncated to 2000 chars)
    author = models.CharField(max_length=64, blank=True)
    url = models.URLField(max_length=512)
    
    # Engagement metrics
    score = models.IntegerField(default=0)                    # Net upvotes
    num_comments = models.IntegerField(default=0)             # Comment count (posts only)
    upvote_ratio = models.FloatField(null=True)               # 0-1 ratio
    awards = models.IntegerField(default=0)                   # Award count
    
    # Sentiment (computed)
    sentiment_score = models.FloatField(null=True)            # -1.0 to +1.0
    sentiment_label = models.CharField(max_length=10, blank=True)  # bullish, bearish, neutral
    
    # Timestamps
    posted_at = models.DateTimeField()                        # When posted on Reddit
    fetched_at = models.DateTimeField(auto_now_add=True)      # When we fetched it
    
    class Meta:
        ordering = ["-posted_at"]
        indexes = [
            models.Index(fields=["stock", "-posted_at"]),
            models.Index(fields=["subreddit", "-posted_at"]),
        ]


class RedditSentimentSummary(models.Model):
    """Daily aggregated sentiment per stock from Reddit."""
    stock = models.ForeignKey(MyStock, on_delete=CASCADE, related_name="reddit_sentiment")
    date = models.DateField()
    
    # Aggregated metrics
    total_mentions = models.IntegerField(default=0)           # Posts + comments mentioning this stock
    total_score = models.IntegerField(default=0)              # Sum of upvotes across mentions
    
    # Sentiment breakdown
    bullish_count = models.IntegerField(default=0)
    bearish_count = models.IntegerField(default=0)
    neutral_count = models.IntegerField(default=0)
    
    # Computed
    avg_sentiment = models.FloatField(null=True)              # Weighted avg sentiment (-1 to +1)
    sentiment_label = models.CharField(max_length=10, blank=True)  # Overall: bullish/bearish/neutral
    mention_momentum = models.FloatField(null=True)           # vs 7-day avg (spike detection)
    
    class Meta:
        unique_together = ("stock", "date")
        ordering = ["-date"]
```

---

## Worker

```python
# backend/stock/workers/get_reddit_sentiment.py

import praw
from datetime import datetime, timedelta
from textblob import TextBlob  # or vaderSentiment

class RedditSentimentWorker:
    """Fetch Reddit posts mentioning tracked stocks and compute sentiment."""
    
    SUBREDDITS = ["wallstreetbets", "stocks", "investing", "options"]
    
    # Common stock ticker patterns to avoid false positives
    # (e.g., "IT" is a word, not a ticker; "A" is ambiguous)
    TICKER_BLACKLIST = {"IT", "A", "ARE", "FOR", "ALL", "AM", "AN", "BE", "BY", "DO",
                        "GO", "HAS", "HE", "I", "IN", "IS", "ME", "MY", "NO", "ON",
                        "OR", "SO", "TO", "UP", "US", "AI", "CEO", "DD", "EPS", "PE",
                        "GDP", "IPO", "SEC", "WSB", "YOLO", "ATH", "DCA", "ETF"}
    
    def __init__(self):
        self.reddit = praw.Reddit(
            client_id=os.environ.get("REDDIT_CLIENT_ID"),
            client_secret=os.environ.get("REDDIT_CLIENT_SECRET"),
            user_agent="StockSentiment/1.0 (by /u/your_username)",
        )
        self.tracked_symbols = set(MyStock.objects.values_list("symbol", flat=True))
    
    def get(self, time_filter="day", limit=100):
        """Fetch hot/new posts from monitored subreddits."""
        for sub_name in self.SUBREDDITS:
            subreddit = self.reddit.subreddit(sub_name)
            
            # Fetch hot posts
            for post in subreddit.hot(limit=limit):
                self._process_post(post, sub_name)
            
            # Fetch new posts (catches things before they go hot)
            for post in subreddit.new(limit=50):
                self._process_post(post, sub_name)
    
    def _process_post(self, post, subreddit_name):
        """Extract stock mentions from a post and store with sentiment."""
        text = f"{post.title} {post.selftext or ''}"
        mentioned_stocks = self._extract_tickers(text)
        
        for symbol in mentioned_stocks:
            stock = MyStock.objects.get(symbol=symbol)
            sentiment = self._compute_sentiment(text)
            
            RedditPost.objects.update_or_create(
                reddit_id=post.id,
                stock=stock,
                defaults={
                    "subreddit": subreddit_name,
                    "post_type": "post",
                    "title": post.title[:512],
                    "body": (post.selftext or "")[:2000],
                    "author": str(post.author) if post.author else "[deleted]",
                    "url": f"https://reddit.com{post.permalink}",
                    "score": post.score,
                    "num_comments": post.num_comments,
                    "upvote_ratio": post.upvote_ratio,
                    "awards": len(post.all_awardings) if hasattr(post, 'all_awardings') else 0,
                    "sentiment_score": sentiment["score"],
                    "sentiment_label": sentiment["label"],
                    "posted_at": datetime.fromtimestamp(post.created_utc),
                }
            )
    
    def _extract_tickers(self, text):
        """Find stock ticker mentions in text. Uses $SYMBOL pattern + known symbols."""
        import re
        found = set()
        
        # Pattern 1: $SYMBOL (explicit ticker reference)
        dollar_tickers = re.findall(r'\$([A-Z]{1,5})\b', text)
        for t in dollar_tickers:
            if t in self.tracked_symbols and t not in self.TICKER_BLACKLIST:
                found.add(t)
        
        # Pattern 2: SYMBOL (standalone uppercase 2-5 chars, surrounded by spaces/punctuation)
        word_tickers = re.findall(r'\b([A-Z]{2,5})\b', text)
        for t in word_tickers:
            if t in self.tracked_symbols and t not in self.TICKER_BLACKLIST:
                found.add(t)
        
        return found
    
    def _compute_sentiment(self, text):
        """Compute sentiment score using TextBlob (or VADER for financial text)."""
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity  # -1.0 to +1.0
        
        if polarity > 0.1:
            label = "bullish"
        elif polarity < -0.1:
            label = "bearish"
        else:
            label = "neutral"
        
        return {"score": polarity, "label": label}
```

---

## Sentiment Aggregation Task

```python
# In tasks.py

@app.task(queue="reddit")
def reddit_sentiment_daily():
    """Fetch Reddit posts and compute daily sentiment summaries."""
    from stock.workers.get_reddit_sentiment import RedditSentimentWorker
    worker = RedditSentimentWorker()
    worker.get(time_filter="day", limit=100)
    
    # After fetching, aggregate into daily summaries
    _aggregate_daily_sentiment()


def _aggregate_daily_sentiment():
    """Roll up individual posts into per-stock daily sentiment scores."""
    from datetime import date
    from django.db.models import Avg, Count, Sum, Q
    
    today = date.today()
    stocks_with_posts = RedditPost.objects.filter(
        posted_at__date=today
    ).values_list("stock", flat=True).distinct()
    
    for stock_id in stocks_with_posts:
        posts_today = RedditPost.objects.filter(stock_id=stock_id, posted_at__date=today)
        
        # Weighted average: high-upvote posts matter more
        total_score = sum(p.score for p in posts_today)
        weighted_sentiment = sum(p.sentiment_score * max(p.score, 1) for p in posts_today)
        total_weight = sum(max(p.score, 1) for p in posts_today)
        avg_sentiment = weighted_sentiment / total_weight if total_weight > 0 else 0
        
        # Mention momentum (vs 7-day average)
        from datetime import timedelta
        week_avg = RedditSentimentSummary.objects.filter(
            stock_id=stock_id,
            date__gte=today - timedelta(days=7),
            date__lt=today,
        ).aggregate(avg_mentions=Avg("total_mentions"))["avg_mentions"] or 0
        
        mention_count = posts_today.count()
        momentum = mention_count / week_avg if week_avg > 0 else 1.0
        
        RedditSentimentSummary.objects.update_or_create(
            stock_id=stock_id,
            date=today,
            defaults={
                "total_mentions": mention_count,
                "total_score": total_score,
                "bullish_count": posts_today.filter(sentiment_label="bullish").count(),
                "bearish_count": posts_today.filter(sentiment_label="bearish").count(),
                "neutral_count": posts_today.filter(sentiment_label="neutral").count(),
                "avg_sentiment": avg_sentiment,
                "sentiment_label": "bullish" if avg_sentiment > 0.1 else "bearish" if avg_sentiment < -0.1 else "neutral",
                "mention_momentum": momentum,
            }
        )
```

---

## Scheduling

```python
# Every 4 hours during market days (Reddit activity peaks pre/post market)
sender.add_periodic_task(
    crontab(hour="6,10,14,18,22", minute=0, day_of_week="1-5"),
    reddit_sentiment_daily.s(),
    name="Reddit sentiment fetch",
)
```

---

## API Endpoint

```python
class RedditSentimentViewSet(viewsets.ReadOnlyModelViewSet):
    """Reddit sentiment data per stock."""
    
    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get latest sentiment for all user's stocks."""
        stocks = MyStock.objects.filter(sectors__user=request.user).distinct()
        summaries = RedditSentimentSummary.objects.filter(
            stock__in=stocks
        ).order_by("stock", "-date").distinct("stock")  # Latest per stock
        return Response(serializer.data)
    
    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        """Get 30-day sentiment history for one stock."""
        stock = MyStock.objects.get(pk=pk)
        history = RedditSentimentSummary.objects.filter(
            stock=stock,
            date__gte=date.today() - timedelta(days=30),
        ).order_by("date")
        return Response(serializer.data)
    
    @action(detail=True, methods=["get"])
    def posts(self, request, pk=None):
        """Get recent Reddit posts mentioning a stock."""
        stock = MyStock.objects.get(pk=pk)
        posts = RedditPost.objects.filter(stock=stock).order_by("-posted_at")[:50]
        return Response(serializer.data)
```

**URLs**:
- `GET /api/v1/reddit-sentiment/summary/` — All stocks, latest score
- `GET /api/v1/reddit-sentiment/{stock_id}/history/` — 30-day trend
- `GET /api/v1/reddit-sentiment/{stock_id}/posts/` — Recent posts

---

## Frontend

### Morning Brief Integration
Add a "Social Sentiment" section to `/brief`:
```
🔥 Reddit Buzz (past 24h):
  PLTR  🟢 Bullish (0.42) — 23 mentions, 2.3x avg volume ⬆️
  MSFT  ⚪ Neutral (0.05) — 15 mentions, normal
  PDD   🔴 Bearish (-0.31) — 8 mentions, China concerns
```

### Stock Detail — New "Social" Tab
```
┌─────────────────────────────────────────────────────┐
│ MSFT — Reddit Sentiment                             │
├─────────────────────────────────────────────────────┤
│ Current: ⚪ Neutral (0.05)  Mentions: 15/day        │
│                                                      │
│ 30-Day Sentiment Chart:                             │
│ ┌──────────────────────────────────────┐            │
│ │ +1.0 ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  │            │
│ │      ╱╲    ╱╲        ╱─╲             │            │
│ │  0.0 ╱──╲╱──╲──────╱───╲─────       │            │
│ │      │                    ╲  ╱       │            │
│ │ -1.0 ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  │            │
│ └──────────────────────────────────────┘            │
│                                                      │
│ Recent Posts:                                        │
│ ┌────────────────────────────────────────────────┐  │
│ │ r/stocks  "MSFT Azure growth looks unstoppable" │  │
│ │ ▲ 342  💬 89  🟢 Bullish  2h ago               │  │
│ ├────────────────────────────────────────────────┤  │
│ │ r/wallstreetbets  "MSFT puts printing? 🐻"     │  │
│ │ ▲ 127  💬 201  🔴 Bearish  5h ago              │  │
│ └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Screener Integration
Add "Reddit Sentiment" and "Mention Momentum" as sortable columns on the screener.

---

## Sentiment Scoring Enhancement (Optional Phase 2)

TextBlob is generic NLP. For better financial sentiment, consider:

### Option A: VADER + Financial Lexicon
```python
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Add financial-specific words
FINANCIAL_LEXICON = {
    "bullish": 2.0, "bearish": -2.0, "moon": 1.5, "mooning": 2.0,
    "rocket": 1.5, "tendies": 1.0, "diamond hands": 1.5,
    "paper hands": -1.0, "bag holder": -1.5, "pump": -0.5,
    "dump": -1.5, "short squeeze": 1.0, "puts": -0.5,
    "calls": 0.5, "yolo": 0.5, "fud": -1.0, "dip": -0.3,
    "buy the dip": 1.0, "to the moon": 2.0, "rug pull": -2.0,
}
```

### Option B: AWS Bedrock (Claude) for Nuanced Sentiment
For high-engagement posts (score > 100), send to Claude for:
- Sentiment with confidence level
- Key thesis extraction
- Bull/bear argument summary

---

## Alert Integration

New alert type: `reddit_buzz`
```python
# Triggers when a stock's mention count is >3x its 7-day average
# Useful for catching WSB momentum plays BEFORE they spike

if summary.mention_momentum > 3.0:
    create_alert("REDDIT_BUZZ", stock, 
        f"Reddit mentions 3x above average ({summary.total_mentions} today vs {avg} avg)")
```

---

## Dependencies

```
# requirements.txt additions
praw>=7.7.0          # Reddit API wrapper
textblob>=0.17.1     # Basic NLP sentiment (or vaderSentiment>=3.3.2)
```

## Environment Variables

```
# .env additions
REDDIT_CLIENT_ID=<from reddit.com/prefs/apps>
REDDIT_CLIENT_SECRET=<from reddit.com/prefs/apps>
REDDIT_USER_AGENT=StockSentiment/1.0
```

---

## Implementation Steps

| Step | Scope | Effort |
|------|-------|--------|
| 1 | Create Reddit app, get API keys | 5 min |
| 2 | `RedditPost` + `RedditSentimentSummary` models + migration | 20 min |
| 3 | `get_reddit_sentiment.py` worker (fetch + parse + sentiment) | 1.5 hr |
| 4 | Celery task + scheduling | 15 min |
| 5 | API endpoint (summary + history + posts) | 30 min |
| 6 | Frontend: Morning Brief sentiment section | 30 min |
| 7 | Frontend: Stock Detail "Social" tab (chart + posts list) | 1 hr |
| 8 | Alert integration (buzz detection) | 15 min |
| 9 | (Optional) VADER financial lexicon upgrade | 30 min |

**Total: ~5 hours**

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| False positive ticker detection ("IT", "A", "ALL") | Blacklist common words; require $SYMBOL or 3+ char tickers |
| Reddit API rate limits | 100 req/min is generous; fetch every 4 hours, not real-time |
| Sentiment quality (TextBlob is generic) | Phase 2: add financial lexicon or VADER; weight by upvotes |
| WSB noise (memes, jokes) | Weight by engagement (high score = more signal); filter posts <10 upvotes |
| Reddit API changes/deprecation | PRAW is well-maintained; fallback to Pushshift archive if needed |

---

## Value to Your Framework

| Framework Step | How Reddit Sentiment Helps |
|----------------|---------------------------|
| Step 1 (Triage) | Detect when a stock is getting abnormal retail attention (buzz = potential volatility) |
| Step 6 (Narrative) | Understand what retail is saying vs what institutions are doing |
| Step 13 (Catalysts) | WSB momentum can BE a catalyst for short squeezes or gamma ramps |
| Step 17 (Monitoring) | Sentiment shift from bullish→bearish can precede price weakness |
| Box Trading | High Reddit buzz + RSI extreme = higher probability of mean-reversion |

---

*Plan created August 25, 2026.*
