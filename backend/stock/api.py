import collections
import logging
from datetime import date
from datetime import datetime
from datetime import timedelta

from numpy import average
from numpy import prod
from numpy import std
from tastypie import fields
from tastypie.constants import ALL
from tastypie.constants import ALL_WITH_RELATIONS
from tastypie.resources import Bundle
from tastypie.resources import ModelResource
from tastypie.resources import Resource

from stock.models import MyStock
from stock.models import MyStockHistorical
from stock.models import MyStrategyValue

logger = logging.getLogger("stock")


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

        # already sorted by date
        historicals = self._get_selected_historicals(bundle)
        indexes = MyStrategyValue.objects.filter(hist__in=historicals)

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
