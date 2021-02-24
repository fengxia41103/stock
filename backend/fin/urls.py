from django.contrib import admin
from django.urls import include
from django.urls import path
from tastypie.api import Api

from stock.api import HistoricalResource
from stock.api import IncomeStatementResource
from stock.api import RankBalanceResource
from stock.api import RankCashFlowResource
from stock.api import RankIncomeResource
from stock.api import RankStockResource
from stock.api import StockResource
from stock.api import StrategyValueResource

v1_api = Api(api_name="v1")
v1_api.register(StockResource())
v1_api.register(HistoricalResource())
v1_api.register(StrategyValueResource())
v1_api.register(IncomeStatementResource())
v1_api.register(RankStockResource())
v1_api.register(RankBalanceResource())
v1_api.register(RankCashFlowResource())
v1_api.register(RankIncomeResource())

urlpatterns = [
    path("api/", include(v1_api.urls)),
    path("stock/", include("stock.urls")),
    path("admin/", admin.site.urls),
]
