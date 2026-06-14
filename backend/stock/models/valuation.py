# -*- coding: utf-8 -*-

from django.db import models


class ValuationRatio(models.Model):
    """Pre-computed valuation ratios from Yahoo Finance."""

    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="ratios"
    )
    on = models.DateField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["stock", "on"])]
    forward_pe = models.FloatField(null=True, blank=True, default=0)
    pe = models.FloatField(null=True, blank=True, default=0)
    pb = models.FloatField(null=True, blank=True, default=0)
    peg = models.FloatField(null=True, blank=True, default=0)
    ps = models.FloatField(null=True, blank=True, default=0)
