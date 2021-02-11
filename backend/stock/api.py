import collections
from datetime import date
from datetime import datetime
from datetime import timedelta

import numpy
from django.db.models import Avg
from tastypie import fields
from tastypie.constants import ALL
from tastypie.constants import ALL_WITH_RELATIONS
from tastypie.resources import Bundle
from tastypie.resources import ModelResource
from tastypie.resources import Resource

from stock.models import MyStock
from stock.models import MyStockHistorical
from stock.models import MyStrategyValue


class StockResource(ModelResource):
    symbol = fields.CharField("symbol")
    olds = fields.ListField("olds", null=True, use_in="detail")
    indexes = fields.DictField("indexes", null=True, use_in="detail")
    stats = fields.DictField("stats", null=True, use_in="detail")

    class Meta:
        queryset = MyStock.objects.all()
        resource_name = "stocks"
        filtering = {"symbol": ALL}

    def _get_date_range(self, bundle):
        """Helper func to determine date range by URL parameter.

        URL Args
        --------

        :start: str
        In format of "%Y-%m-%d". Default to 1 week ago from today.

        :end: date
        In format of "%Y-%m-%d". Default to today.

        Returns
        -------
          :tuple: (Date, Date)
          (start, end)

        """
        params = bundle.request.GET
        start = params.get("start", None)
        end = params.get("end", None)
        if start:
            start = datetime.strptime(start, "%Y-%m-%d").date()
        else:
            start = date.today() - timedelta(weeks=1)
        if end:
            end = datetime.strptime(end, "%Y-%m-%d").date()
        else:
            end = date.today()

        return (start, end)

    def _get_selected_historicals(self, bundle):
        start, end = self._get_date_range(bundle)
        me = bundle.obj
        return (
            MyStockHistorical.objects.by_date_range(start, end)
            .filter(stock=me)
            .order_by("on")
        )

    def dehydrate_olds(self, bundle):
        """Historical values.

        Take two filter keys to define a date range for historicals.

        Return
        ------
          :list:
          Historical query set turned to list directly, thus including
          all fields. Historical is sorted by date.

        """
        historicals = self._get_selected_historicals(bundle)
        return list(historicals.values())

    def dehydrate_indexes(self, bundle):
        """Pre-computed index values from selected historicals."""
        # pre-computed daily index value
        historicals = self._get_selected_historicals(bundle)
        indexes = MyStrategyValue.objects.filter(hist__in=historicals)

        result = {}
        for s in MyStrategyValue.METHOD_CHOICES:
            index_vals = (
                indexes.filter(method=s[0])
                .values("hist__on", "val")
                .order_by("hist__on")
            )
            result[s[1]] = list(index_vals)

        return result

    def dehydrate_stats(self, bundle):
        """Stats based on these data point.

        avg open & close
        ----------------
        Average price, not much.

        range return
        ------------
        Assume you buy at the beginning and hold till the end, how
        will you fare off.
        """

        # already sorted by date
        historicals = self._get_selected_historicals(bundle)
        indexes = MyStrategyValue.objects.filter(hist__in=historicals)

        # use DB is much efficient for these
        avg_open = historicals.aggregate(Avg("open_price"))["open_price__avg"]
        avg_close = historicals.aggregate(Avg("close_price"))[
            "close_price__avg"
        ]

        # ok, we need some Python power to compute these stats
        open_prices = list(historicals.values_list("open_price", flat=True))
        close_prices = list(historicals.values_list("close_price", flat=True))
        vols = list(historicals.values_list("vol", flat=True))

        range_return = close_prices[-1] / open_prices[0] * 100
        night_day_consistency = collections.Counter(
            indexes.filter(method=3).values_list("val", flat=True)
        )

        two_day_consistency = collections.Counter(
            indexes.filter(method=4).values_list("val", flat=True)
        )

        return {
            "avg open": avg_open,
            "avg close": avg_close,
            "return": range_return,
            "std": numpy.std(close_prices),
            "two-day consistency": two_day_consistency,
            "night-day consistency": night_day_consistency,
        }


class HistoricalResource(ModelResource):
    stock = fields.ForeignKey(
        "stock.api.StockResource", "stock", use_in="detail"
    )
    on = fields.DateField("on")
    open_p = fields.FloatField("open_price")
    close_p = fields.FloatField("close_price")
    high_p = fields.FloatField("high_price")
    low_p = fields.FloatField("low_price")
    adj_close = fields.FloatField("adj_close")
    vol = fields.IntegerField("vol")

    class Meta:
        queryset = MyStockHistorical.objects.all()
        filtering = {"on": ["range"]}
        resource_name = "historicals"


class StrategyValueResource(ModelResource):
    hist = fields.ForeignKey(
        "stock.api.HistoricalResource", "hist", use_in="detail"
    )
    method = fields.IntegerField("method")
    val = fields.FloatField("val")

    class Meta:
        queryset = MyStrategyValue.objects.all()
        filtering = {"method": ALL, "hist__stock__symbol": ALL}
        resource_name = "indexes"
