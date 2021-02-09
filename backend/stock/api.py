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

    class Meta:
        queryset = MyStock.objects.all()
        resource_name = "stocks"
        filtering = {"id": ALL, "symbol": ALL}


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
        filtering = {"on": ALL}
        resource_name = "historicals"


class StrategyValueResource(ModelResource):
    hist = fields.ForeignKey(
        "stock.api.HistoricalResource", "hist", use_in="detail"
    )
    method = fields.IntegerField("method")
    val = fields.FloatField("val")

    class Meta:
        queryset = MyStrategyValue.objects.all()
        filtering = {"method": ALL}
        resource_name = "indexes"
