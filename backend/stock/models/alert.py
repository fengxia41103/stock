"""Alert models for price/signal notifications."""

from django.conf import settings
from django.db import models


class Alert(models.Model):
    """User-defined alert on a stock condition.
    
    Two modes:
    - Stock-specific: stock is set, applies to one stock
    - Universal: stock is null, applies to all stocks (or all in a sector)
    """

    ALERT_TYPES = [
        ("rsi_below", "RSI Below Threshold"),
        ("price_below", "Price Below Target"),
        ("price_above", "Price Above Target"),
        ("insider_buy", "Insider Cluster Buy"),
        ("earnings_soon", "Earnings Within N Days"),
        ("drop_days", "Drop Exceeds N Days"),
        # Universal types (apply across all stocks)
        ("universal_rsi", "RSI Below (Any Stock)"),
        ("universal_drop", "Drop Exceeds N Days (Any Stock)"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="alerts")
    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="alerts",
        null=True, blank=True, help_text="Null = universal alert (all stocks)"
    )
    sector = models.ForeignKey(
        "stock.MySector", on_delete=models.SET_NULL, related_name="alerts",
        null=True, blank=True, help_text="Optional scope: only stocks in this sector"
    )
    alert_type = models.CharField(max_length=32, choices=ALERT_TYPES)
    threshold = models.FloatField(help_text="Threshold value (RSI level, price, days, etc.)")
    is_active = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]

    @property
    def is_universal(self):
        return self.stock is None

    def __str__(self):
        target = self.stock.symbol if self.stock else (self.sector.name if self.sector else "ALL")
        return f"{target} {self.get_alert_type_display()} @ {self.threshold}"


class AlertEvent(models.Model):
    """Triggered alert instance."""

    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, related_name="events")
    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, null=True, blank=True,
        help_text="Which stock triggered this (for universal alerts)"
    )
    triggered_at = models.DateTimeField(auto_now_add=True)
    value = models.FloatField(help_text="The actual value that triggered the alert")
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-triggered_at"]

    def __str__(self):
        return f"{self.alert} triggered at {self.triggered_at}"
