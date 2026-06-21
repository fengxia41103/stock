# -*- coding: utf-8 -*-

from django.db import models


class EarningsEvent(models.Model):
    """Earnings calendar entry — upcoming or historical."""

    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="earnings_events"
    )
    report_date = models.DateField()
    fiscal_date_ending = models.DateField(null=True)

    # Timing
    report_time = models.CharField(max_length=16, null=True, blank=True)

    # Estimates vs Actuals
    estimated_eps = models.FloatField(null=True)
    reported_eps = models.FloatField(null=True)
    surprise = models.FloatField(null=True)
    surprise_pct = models.FloatField(null=True)

    class Meta:
        unique_together = ("stock", "report_date")
        indexes = [
            models.Index(fields=["stock", "-report_date"]),
            models.Index(fields=["report_date"]),
        ]
        ordering = ["-report_date"]

    def __str__(self):
        return f"{self.stock.symbol} {self.report_date}"

    @property
    def is_upcoming(self):
        from datetime import date

        return self.report_date >= date.today()

    @property
    def is_beat(self):
        if self.surprise_pct is None:
            return None
        return self.surprise_pct > 0


class EarningsPriceImpact(models.Model):
    """Price reaction to earnings announcement."""

    earnings_event = models.OneToOneField(
        EarningsEvent, on_delete=models.CASCADE, related_name="price_impact"
    )
    price_before = models.FloatField()
    price_after_1d = models.FloatField()
    price_after_5d = models.FloatField(null=True)
    gap_pct = models.FloatField()
    reaction_1d_pct = models.FloatField()
    reaction_5d_pct = models.FloatField(null=True)
    volume_ratio = models.FloatField(null=True)

    class Meta:
        ordering = ["-earnings_event__report_date"]
