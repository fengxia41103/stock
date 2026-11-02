# -*- coding: utf-8 -*-

from django.db import models


class MarketSnapshot(models.Model):
    """A point-in-time market quote, including pre-/post-market ('overnight')
    prices when the regular session is closed.

    Captured on a schedule (Celery beat) and/or on demand so the app can show
    and analyze after-hours / pre-market moves — the "market winds" before a
    regular session opens — rather than only end-of-day daily bars.
    """

    MARKET_STATES = [
        ("PRE", "Pre-market"),
        ("REGULAR", "Regular"),
        ("POST", "After-hours"),
        ("POSTPOST", "Closed (post)"),
        ("CLOSED", "Closed"),
        ("PREPRE", "Closed (pre)"),
    ]

    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="market_snapshots"
    )
    captured_at = models.DateTimeField(
        db_index=True, help_text="When this snapshot was taken (server time)."
    )
    market_state = models.CharField(
        max_length=16, blank=True, default="", help_text="Yahoo marketState."
    )

    # Regular session (last known close/live during the day).
    regular_price = models.FloatField(null=True, default=None)
    regular_change_pct = models.FloatField(null=True, default=None)
    regular_previous_close = models.FloatField(null=True, default=None)

    # Pre-market (before 9:30 ET).
    pre_price = models.FloatField(null=True, default=None)
    pre_change_pct = models.FloatField(null=True, default=None)

    # After-hours / post-market (after 4:00 ET).
    post_price = models.FloatField(null=True, default=None)
    post_change_pct = models.FloatField(null=True, default=None)

    source = models.CharField(max_length=32, blank=True, default="yahooquery")

    class Meta:
        indexes = [
            models.Index(fields=["stock", "captured_at"]),
            models.Index(fields=["captured_at"]),
        ]
        ordering = ["-captured_at"]

    def __str__(self):
        return f"{self.stock.symbol} @ {self.captured_at:%Y-%m-%d %H:%M} ({self.market_state})"

    @property
    def effective_price(self):
        """The most relevant price for the current state: post > pre > regular."""
        if self.market_state in ("POST", "POSTPOST") and self.post_price:
            return self.post_price
        if self.market_state in ("PRE", "PREPRE") and self.pre_price:
            return self.pre_price
        return self.regular_price

    @property
    def overnight_change_pct(self):
        """Pre/post change vs the regular close — the 'overnight wind'."""
        if self.post_price is not None and self.post_change_pct is not None:
            return self.post_change_pct
        if self.pre_price is not None and self.pre_change_pct is not None:
            return self.pre_change_pct
        return None
