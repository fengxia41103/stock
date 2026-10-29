# -*- coding: utf-8 -*-

"""Target asset-allocation (model portfolio) + holding classification.

These models let a user define a *model portfolio* as a set of asset-class
buckets, each with a target weight, and map their real holdings into those
buckets. The drift/rebalance math (current vs target, dollar trades) lives in
the API layer so it always reflects live prices.

NOTE: This is an analysis aid, not financial advice. Target weights are set by
the user (ideally with their advisor); the app only reports drift and the
trades that would close it.
"""

from django.conf import settings
from django.db import models


class AssetClass(models.Model):
    """A bucket in the user's model portfolio (e.g. "US Large Cap", "Bonds").

    target_pct is the desired weight of this bucket in the overall portfolio.
    The sum of a user's target_pct values should be ~100 (not enforced at the
    DB level so the user can edit incrementally; the API reports the total).
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="asset_classes",
    )
    key = models.SlugField(max_length=64, help_text="Stable identifier, e.g. 'us_large'")
    label = models.CharField(max_length=128, help_text="Display name, e.g. 'US Large Cap'")
    target_pct = models.FloatField(default=0, help_text="Target weight 0-100")
    order = models.IntegerField(default=0, help_text="Display order")

    class Meta:
        ordering = ["order", "label"]
        unique_together = ("user", "key")

    def __str__(self):
        return f"{self.label} ({self.target_pct:.0f}%)"


class AssetClassAssignment(models.Model):
    """Maps one of the user's tracked stocks/ETFs to an asset-class bucket.

    One assignment per (user, stock). A stock with no assignment is reported as
    "Unclassified" by the allocation endpoint so nothing is silently dropped.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="asset_class_assignments",
    )
    stock = models.ForeignKey(
        "stock.MyStock",
        on_delete=models.CASCADE,
        related_name="asset_class_assignments",
    )
    asset_class = models.ForeignKey(
        AssetClass,
        on_delete=models.CASCADE,
        related_name="assignments",
    )

    class Meta:
        unique_together = ("user", "stock")

    def __str__(self):
        return f"{self.stock.symbol} -> {self.asset_class.label}"
