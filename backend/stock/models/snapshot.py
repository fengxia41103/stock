"""Denormalized stock snapshot for fast list/overview queries."""

from django.db import models


class StockSnapshot(models.Model):
    """Pre-computed snapshot of key metrics for fast stock list rendering.
    
    Refreshed by Celery task after each price_daily() run.
    The overview endpoint reads from this instead of computing per-stock.
    """

    stock = models.OneToOneField("stock.MyStock", on_delete=models.CASCADE, related_name="snapshot")
    
    # Price
    price = models.FloatField(null=True)
    daily_return_pct = models.FloatField(null=True)
    weekly_return_pct = models.FloatField(null=True)
    
    # Technicals
    rsi = models.FloatField(null=True)
    bb_position = models.FloatField(null=True)
    sma50 = models.FloatField(null=True)
    sma200 = models.FloatField(null=True)
    sma_signal = models.CharField(max_length=16, null=True, blank=True)
    verdict = models.CharField(max_length=16, default="NEUTRAL")
    
    # Fundamentals (from denormalized fields)
    last_lower = models.IntegerField(null=True)
    pe = models.FloatField(null=True)
    pb = models.FloatField(null=True)
    roe = models.FloatField(null=True)
    
    # Signals
    insider_sentiment = models.FloatField(null=True)
    
    # Volume
    vol_pct_outstanding = models.FloatField(null=True)
    
    # Meta
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["stock__symbol"]

    def __str__(self):
        return f"{self.stock.symbol} snapshot (updated {self.updated_at})"
