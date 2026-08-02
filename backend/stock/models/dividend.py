"""Dividend tracking models."""

from django.db import models


class DividendEvent(models.Model):
    """Historical or upcoming dividend payment."""

    stock = models.ForeignKey("stock.MyStock", on_delete=models.CASCADE, related_name="dividends")
    ex_date = models.DateField(help_text="Ex-dividend date")
    pay_date = models.DateField(null=True, blank=True, help_text="Payment date")
    amount = models.FloatField(help_text="Dividend per share ($)")

    class Meta:
        unique_together = ("stock", "ex_date")
        ordering = ["-ex_date"]
        indexes = [
            models.Index(fields=["stock", "-ex_date"]),
        ]

    def __str__(self):
        return f"{self.stock.symbol} ${self.amount} ex-{self.ex_date}"

    @property
    def annual_yield(self):
        """Annualized yield based on 4 payments/year and current price."""
        from stock.models import MyStockHistorical
        latest = MyStockHistorical.objects.filter(stock=self.stock).order_by("-on").first()
        if latest and latest.close_price > 0:
            return (self.amount * 4 / latest.close_price) * 100
        return None
