"""Alert models for price/signal notifications."""

from django.conf import settings
from django.db import models


class Alert(models.Model):
    """User-defined alert on a stock condition."""

    ALERT_TYPES = [
        ("rsi_below", "RSI Below Threshold"),
        ("price_below", "Price Below Target"),
        ("price_above", "Price Above Target"),
        ("insider_buy", "Insider Cluster Buy"),
        ("earnings_soon", "Earnings Within N Days"),
        ("drop_days", "Drop Exceeds N Days"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="alerts")
    stock = models.ForeignKey("stock.MyStock", on_delete=models.CASCADE, related_name="alerts")
    alert_type = models.CharField(max_length=32, choices=ALERT_TYPES)
    threshold = models.FloatField(help_text="Threshold value (RSI level, price, days, etc.)")
    is_active = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]
        unique_together = ("user", "stock", "alert_type", "threshold")

    def __str__(self):
        return f"{self.stock.symbol} {self.get_alert_type_display()} @ {self.threshold}"


class AlertEvent(models.Model):
    """Triggered alert instance."""

    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, related_name="events")
    triggered_at = models.DateTimeField(auto_now_add=True)
    value = models.FloatField(help_text="The actual value that triggered the alert")
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-triggered_at"]

    def __str__(self):
        return f"{self.alert} triggered at {self.triggered_at}"
