from django.contrib import admin
from django.urls import include
from django.urls import path
from tastypie.api import Api

from stock.api import HistoricalResource
from stock.api import StockResource
from stock.api import StrategyValueResource

v1_api = Api(api_name="v1")
v1_api.register(StockResource())
v1_api.register(HistoricalResource())
v1_api.register(StrategyValueResource())

urlpatterns = [
    path("api/", include(v1_api.urls)),
    path("stock/", include("stock.urls")),
    path("admin/", admin.site.urls),
]
