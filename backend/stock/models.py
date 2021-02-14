# -*- coding: utf-8 -*-


import collections
import logging
from datetime import date
from datetime import timedelta

from django.db import models
from numpy import average
from numpy import prod
from numpy import std

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

        return MyStockHistorical.objects.filter(
            on__gte=start, on__lte=end
        ).order_by("on")


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


class MyStrategyValueCustomManager(models.Manager):
    def stats(self, historicals):
        """Compute stats over a range of historicals.

        Args
        ----
          :ids: list[MyStockHistorical]

        range return
        ------------
        Assume you buy at the beginning and hold till the end, how
        will you fare off.

        std
        ---
        How volatile it has been. Use the close price.

        night day consistency
        ---------------------
        Count occurances of consistency values. This gives me an idea
        how likely a consistency scenario occured. This is essentially
        a probability.

        two day trend
        -------------
        Count occurance of two day trend values. This is a probability
        indicator.

        avg up return
        -------------
        What's the avg daily return % that was > 0? This tell me how
        much up side there is.

        avg down return
        ---------------
        Similarly, the avg down return shows me the down side.
        """
        indexes = self.filter(hist__in=historicals)

        # ok, we need some Python power to compute these stats
        open_prices = list(historicals.values_list("open_price", flat=True))
        close_prices = list(historicals.values_list("close_price", flat=True))
        vols = list(historicals.values_list("vol", flat=True))

        range_return = close_prices[-1] / open_prices[0] * 100

        # count frequency
        tmp = collections.Counter(
            indexes.filter(method=3).values_list("val", flat=True)
        )
        night_day_consistency = dict(
            [(int(key), val) for (key, val) in tmp.items()]
        )

        tmp = collections.Counter(
            indexes.filter(method=4).values_list("val", flat=True)
        )
        trend = dict([(int(key), val) for (key, val) in tmp.items()])

        daily_return = indexes.filter(method=1)
        daily_ups = daily_return.filter(val__gt=0).values_list("val", flat=True)
        daily_downs = daily_return.filter(val__lt=0).values_list(
            "val", flat=True
        )

        compound_return = (
            prod(list(map(lambda x: 1 + x.val / 100, daily_return))) * 100
        )

        return {
            "days": historicals.count(),
            "return": "%.2f" % range_return,
            "close price rsd": "%.2f"
            % (std(close_prices) / average(close_prices) * 100),
            "trend": trend,
            "overnight": night_day_consistency,
            "ups": "%.0f" % (daily_ups.count() / daily_return.count() * 100.0),
            "downs": "%.0f"
            % (daily_downs.count() / daily_return.count() * 100.0),
            "avg daily up": "%.2f" % average(daily_ups),
            "daily up rsd": "%.2f"
            % (std(daily_ups) / average(daily_ups) * 100),
            "avg daily down": "%.2f" % average(daily_downs),
            "daily down rsd": "%.2f"
            % (std(daily_downs) / abs(average(daily_downs)) * 100),
            "compounded return": "%.2f" % compound_return,
            "vols": vols,
        }


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
    objects = MyStrategyValueCustomManager()
    hist = models.ForeignKey(
        "MyStockHistorical", on_delete=models.CASCADE, related_name="indexes"
    )
    method = models.IntegerField(choices=METHOD_CHOICES, default=1)
    val = models.FloatField(null=True, blank=True, default=-1)


class IncomeStatement(models.Model):
    stock = models.ForeignKey(
        "MyStock", on_delete=models.CASCADE, related_name="incomes"
    )
    on = models.DateField(null=True, blank=True)
    ebit = models.FloatField(null=True, blank=True, default=0)
    general_and_administrative_expense = models.FloatField(
        null=True, blank=True, default=0
    )
    gross_profit = models.FloatField(null=True, blank=True, default=0)
    net_income = models.FloatField(null=True, blank=True, default=0)
    normalized_ebitda = models.FloatField(null=True, blank=True, default=0)
    normalized_income = models.FloatField(null=True, blank=True, default=0)
    operating_expense = models.FloatField(null=True, blank=True, default=0)
    operating_income = models.FloatField(null=True, blank=True, default=0)
    operating_revenue = models.FloatField(null=True, blank=True, default=0)
    reconciled_cost_of_revenue = models.FloatField(
        null=True, blank=True, default=0, verbose_name="COGS"
    )
    pretax_income = models.FloatField(null=True, blank=True, default=0)
    research_and_development = models.FloatField(
        null=True, blank=True, default=0
    )
    selling_and_marketing_expense = models.FloatField(
        null=True, blank=True, default=0
    )
    selling_general_and_administration = models.FloatField(
        null=True, blank=True, default=0
    )
    total_expenses = models.FloatField(null=True, blank=True, default=0)
    total_operating_income_as_reported = models.FloatField(
        null=True, blank=True, default=0
    )
    total_revenue = models.FloatField(null=True, blank=True, default=0)

    @property
    def net_income_margin(self):
        return self.net_income / self.total_revenue * 100

    @property
    def gross_margin(self):
        return self.gross_profit / self.total_revenue * 100

    @property
    def opex_margin(self):
        return self.operating_expense / self.total_revenue * 100

    @property
    def ebit_margin(self):
        return self.ebit / self.total_revenue * 100

    @property
    def expense_margin(self):
        return self.total_expenses / self.total_revenue * 100


class CashFlow(models.Model):
    stock = models.ForeignKey(
        "MyStock", on_delete=models.CASCADE, related_name="cashes"
    )
    on = models.DateField(null=True, blank=True)

    beginning_cash = models.FloatField(null=True, blank=True, default=0)
    ending_cash = models.FloatField(null=True, blank=True, default=0)
    free_cash_flow = models.FloatField(null=True, blank=True, default=0)
    net_income = models.FloatField(null=True, blank=True, default=0)
    da = models.FloatField(
        null=True,
        blank=True,
        default=0,
        verbose_name="Depreciation and Amortization",
    )

    # inflow
    operating_cash_flow = models.FloatField(null=True, blank=True, default=0)
    from_continuing_financing_activity = models.FloatField(
        null=True, blank=True, default=0
    )
    sale_of_investment = models.FloatField(null=True, blank=True, default=0)

    # outflow
    investing_cash_flow = models.FloatField(null=True, blank=True, default=0)
    capex = models.FloatField(null=True, blank=True, default=0)
    dividend_paid = models.FloatField(null=True, blank=True, default=0)
    common_stock_issuance = models.FloatField(null=True, blank=True, default=0)
    purchase_of_business = models.FloatField(null=True, blank=True, default=0)
    purchase_of_investment = models.FloatField(null=True, blank=True, default=0)
    repayment_of_debt = models.FloatField(null=True, blank=True, default=0)
    repurchase_of_capital_stock = models.FloatField(
        null=True, blank=True, default=0
    )
    stock_based_compensation = models.FloatField(
        null=True, blank=True, default=0
    )

    # changes
    change_in_inventory = models.FloatField(null=True, blank=True, default=0)
    change_in_account_payable = models.FloatField(
        null=True, blank=True, default=0
    )
    change_in_working_capital = models.FloatField(
        null=True, blank=True, default=0
    )
    change_in_account_receivable = models.FloatField(
        null=True, blank=True, default=0
    )

    net_other_financing_charges = models.FloatField(
        null=True, blank=True, default=0
    )
    net_other_investing_changes = models.FloatField(
        null=True, blank=True, default=0
    )
    change_in_cash_supplemental_as_reported = models.FloatField(
        null=True, blank=True, default=0
    )
