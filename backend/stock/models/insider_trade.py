# -*- coding: utf-8 -*-

from django.db import models


class InsiderTrade(models.Model):
    """SEC Form 4 insider transaction."""

    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="insider_trades"
    )
    filed_on = models.DateField()
    trade_date = models.DateField()

    # Insider identity
    insider_name = models.CharField(max_length=256)
    insider_title = models.CharField(max_length=128, default="")
    insider_cik = models.CharField(max_length=20, default="")

    # Transaction details
    transaction_type = models.CharField(max_length=4)  # P=Purchase, S=Sale, A=Award
    shares = models.FloatField()
    price_per_share = models.FloatField(null=True)
    total_value = models.FloatField(null=True)
    shares_owned_after = models.FloatField(null=True)

    # Ownership type
    is_direct = models.BooleanField(default=True)

    class Meta:
        unique_together = ("stock", "trade_date", "insider_cik", "transaction_type", "shares")
        indexes = [
            models.Index(fields=["stock", "-trade_date"]),
            models.Index(fields=["stock", "transaction_type"]),
        ]
        ordering = ["-trade_date"]

    def __str__(self):
        return f"{self.insider_name} {self.transaction_type} {self.shares} @ {self.price_per_share}"

    @property
    def is_purchase(self):
        return self.transaction_type == "P"

    @property
    def is_sale(self):
        return self.transaction_type == "S"
