# -*- coding: utf-8 -*-

from django.db import models


class MyStockHistorical(models.Model):
    """Historical stock OHLCV data."""

    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="historicals"
    )
    on = models.DateField(verbose_name="Date")
    open_price = models.FloatField()
    high_price = models.FloatField()
    low_price = models.FloatField()
    close_price = models.FloatField()
    adj_close = models.FloatField()
    vol = models.FloatField(verbose_name="Volume (000)")

    # Denormalized computed fields (populated at ingestion)
    d_last_lower = models.IntegerField(null=True, default=None)
    d_last_better = models.IntegerField(null=True, default=None)
    d_next_better = models.IntegerField(null=True, default=None)
    d_gain_probability = models.FloatField(null=True, default=None)
    d_vol_over_share_outstanding = models.FloatField(null=True, default=None)

    class Meta:
        unique_together = ("stock", "on")
        indexes = [models.Index(fields=["stock", "on"])]

    @property
    def vol_over_share_outstanding(self):
        if self.d_vol_over_share_outstanding is not None:
            return self.d_vol_over_share_outstanding
        if self.stock.shares_outstanding:
            return self.vol / self.stock.shares_outstanding * 0.001
        return 0

    @property
    def last_lower(self):
        if self.d_last_lower is not None:
            return self.d_last_lower
        last_saw = (
            self.stock.historicals.filter(close_price__lt=self.close_price, on__lt=self.on)
            .order_by("-on")
            .first()
        )
        if last_saw:
            return self.stock.historicals.filter(on__lt=self.on, on__gte=last_saw.on).count()
        return 0

    @property
    def last_better(self):
        if self.d_last_better is not None:
            return self.d_last_better
        last_saw = (
            self.stock.historicals.filter(close_price__gt=self.close_price, on__lt=self.on)
            .order_by("-on")
            .first()
        )
        if last_saw:
            return self.stock.historicals.filter(on__lt=self.on, on__gte=last_saw.on).count()
        return 0

    @property
    def next_better(self):
        if self.d_next_better is not None:
            return self.d_next_better
        next_saw = (
            self.stock.historicals.filter(close_price__gt=self.open_price, on__gt=self.on)
            .order_by("on")
            .first()
        )
        if next_saw:
            return self.stock.historicals.filter(on__gt=self.on, on__lte=next_saw.on).count()
        return 0

    @property
    def gain_probability(self):
        if self.d_gain_probability is not None:
            return self.d_gain_probability
        gain_days = self.stock.historicals.filter(
            close_price__gt=self.open_price, on__gt=self.on
        ).count()
        total_days = self.stock.historicals.filter(on__gt=self.on).count()
        return gain_days / total_days * 100.0 if total_days else 0
