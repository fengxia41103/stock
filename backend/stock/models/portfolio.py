"""Portfolio tracking models — positions and transactions."""

from django.conf import settings
from django.db import models


class Position(models.Model):
    """An open or closed stock position."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="positions")
    stock = models.ForeignKey("stock.MyStock", on_delete=models.CASCADE, related_name="positions")
    shares = models.FloatField(default=0, help_text="Current shares held")
    avg_cost = models.FloatField(default=0, help_text="Average cost basis per share")
    opened_at = models.DateField(help_text="Date position was first opened")
    closed_at = models.DateField(null=True, blank=True, help_text="Date position was fully closed")

    class Meta:
        ordering = ["-opened_at"]
        unique_together = ("user", "stock", "opened_at")

    def __str__(self):
        status = "CLOSED" if self.closed_at else f"{self.shares} shares"
        return f"{self.stock.symbol} — {status}"

    @property
    def is_open(self):
        return self.closed_at is None and self.shares > 0

    @property
    def total_cost(self):
        return self.shares * self.avg_cost

    @property
    def current_price(self):
        latest = self.stock.historicals.order_by("-on").first()
        return latest.close_price if latest else None

    @property
    def market_value(self):
        price = self.current_price
        return self.shares * price if price else None

    @property
    def pnl(self):
        mv = self.market_value
        return mv - self.total_cost if mv is not None else None

    @property
    def pnl_pct(self):
        cost = self.total_cost
        pnl = self.pnl
        if cost and cost > 0 and pnl is not None:
            return (pnl / cost) * 100
        return None


class Transaction(models.Model):
    """A buy or sell transaction within a position."""

    ACTION_CHOICES = [("BUY", "Buy"), ("SELL", "Sell")]

    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name="transactions")
    action = models.CharField(max_length=4, choices=ACTION_CHOICES)
    shares = models.FloatField()
    price = models.FloatField(help_text="Price per share")
    date = models.DateField()
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.action} {self.shares} @ ${self.price} ({self.date})"

    @property
    def total_value(self):
        return self.shares * self.price
