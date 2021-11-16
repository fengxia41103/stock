from django.contrib import admin
from django.urls import include
from django.urls import path
from tastypie.api import Api

from stock.api import AuthResource
from stock.api import BalanceSheetResource
from stock.api import CashFlowResource
from stock.api import DiaryResource
from stock.api import HistoricalResource
from stock.api import IncomeStatementResource
from stock.api import NewsResource
from stock.api import RankBalanceResource
from stock.api import RankCashFlowResource
from stock.api import RankIncomeResource
from stock.api import RankStockResource
from stock.api import RankValuationRatioResource
from stock.api import SectorResource
from stock.api import StockResource
from stock.api import TaskResource
from stock.api import TaskResultResource
from stock.api import UserResource
from stock.api import ValuationRatioResource

v1_api = Api(api_name="v1")
v1_api.register(AuthResource())
v1_api.register(UserResource())
v1_api.register(StockResource())
v1_api.register(HistoricalResource())
v1_api.register(IncomeStatementResource())
v1_api.register(RankStockResource())
v1_api.register(RankBalanceResource())
v1_api.register(RankCashFlowResource())
v1_api.register(RankIncomeResource())
v1_api.register(SectorResource())
v1_api.register(BalanceSheetResource())
v1_api.register(CashFlowResource())
v1_api.register(ValuationRatioResource())
v1_api.register(DiaryResource())
v1_api.register(NewsResource())
v1_api.register(RankValuationRatioResource())
v1_api.register(TaskResource())
v1_api.register(TaskResultResource())

urlpatterns = [
    path("api/", include(v1_api.urls)),
    path("admin/doc/", include("django.contrib.admindocs.urls")),
    path("stock/", include("stock.urls")),
    path("admin/", admin.site.urls),
]
