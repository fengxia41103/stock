# -*- coding: utf-8 -*-


import logging

from django.db import models

logger = logging.getLogger("stock")
logger.setLevel(logging.DEBUG)


class MySector(models.Model):
    """Sector that is used to group stocks.

    The company that a stock represents is usually linked to a
    sector. Each country may have a different way to define these.

    """

    name = models.CharField(max_length=32, null=True, blank=True)
    code = models.CharField(max_length=8, verbose_name="Sector code")
    description = models.TextField(null=True, blank=True)
    stocks = models.ManyToManyField("MyStock")

    def __unicode__(self):
        if self.name:
            return u"{0} ({1})".format(self.name, self.code)
        else:
            return self.code


class MyStock(models.Model):
    symbol = models.CharField(max_length=8)

    def __unicode__(self):
        return self.symbol


class MyStockHistorical(models.Model):
    """Historical stock data."""

    stock = models.ForeignKey(
        "MyStock", on_delete=models.CASCADE, related_name="stocks"
    )
    on = models.DateField(verbose_name=u"Date")
    open_price = models.FloatField()
    high_price = models.FloatField()
    low_price = models.FloatField()
    close_price = models.FloatField()
    adj_close = models.FloatField()
    vol = models.FloatField(verbose_name=u"Volume (000)")

    class Meta:
        unique_together = ("stock", "on")
        index_together = ["stock", "on"]


class MyStrategyValue(models.Model):
    """Derived values of a stock.

    These are computed from historical values.
    """

    METHOD_CHOICES = ((1, "daily return"), (2, "overnight return"))
    hist = models.ForeignKey("MyStockHistorical", on_delete=models.CASCADE)
    method = models.IntegerField(choices=METHOD_CHOICES, default=1)
    val = models.FloatField(null=True, blank=True, default=-1)
