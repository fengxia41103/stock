# -*- coding: utf-8 -*-

from django.db import models


class InstitutionalHolding(models.Model):
    """Quarterly 13F institutional holding snapshot."""

    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="holdings_13f"
    )
    report_date = models.DateField()

    institution_name = models.CharField(max_length=256)
    institution_cik = models.CharField(max_length=20)

    shares = models.BigIntegerField()
    value = models.FloatField()  # Market value in $thousands

    change_shares = models.BigIntegerField(null=True)
    change_type = models.CharField(max_length=10, null=True)  # NEW, ADD, REDUCE, EXIT

    class Meta:
        unique_together = ("stock", "report_date", "institution_cik")
        indexes = [
            models.Index(fields=["stock", "-report_date"]),
        ]
        ordering = ["-report_date", "-value"]

    def __str__(self):
        return f"{self.institution_name}: {self.shares} shares of {self.stock.symbol}"
