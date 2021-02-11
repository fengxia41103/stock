# -*- coding: utf-8 -*-


import logging
from datetime import date
from datetime import timedelta

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

    def __str__(self):
        if self.name:
            return u"{0} ({1})".format(self.name, self.code)
        else:
            return self.code


class MyStock(models.Model):
    symbol = models.CharField(max_length=8)

    def __str__(self):
        return self.symbol


class MyHistoricalCustomManager(models.Manager):
    def by_date_range(self, start, end):
        """Filter by a date range."""
        if not end:
            end = date.today()
        if not start:
            start = end - timedelta(weeks=1)

        return MyStockHistorical.objects.filter(on__gte=start, on__lte=end)


class MyStockHistorical(models.Model):
    """Historical stock data."""

    objects = MyHistoricalCustomManager()

    stock = models.ForeignKey(
        "MyStock", on_delete=models.CASCADE, related_name="historicals"
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

    1. daily return: how much it grew in one day? Val is %.
    2. overnight return: how much it grew from last night to today's
       openning? Value is %.
    3. night day consistency: daily trend is the same as overnight,
       either both > 0 or both < 0.
    4. trend: yesterday->today trend
    """

    METHOD_CHOICES = (
        (1, "daily return"),
        (2, "overnight return"),
        (3, "night day consistency"),
        (4, "trend"),
    )
    hist = models.ForeignKey(
        "MyStockHistorical", on_delete=models.CASCADE, related_name="indexes"
    )
    method = models.IntegerField(choices=METHOD_CHOICES, default=1)
    val = models.FloatField(null=True, blank=True, default=-1)
