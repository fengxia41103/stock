# -*- coding: utf-8 -*-

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from stock.api.views import (
    BacktestViewSet,
    BalanceRankViewSet,
    BalanceSheetViewSet,
    CashFlowViewSet,
    CashRankViewSet,
    DiaryViewSet,
    EarningsEventViewSet,
    HistoricalViewSet,
    IncomeRankViewSet,
    IncomeStatementViewSet,
    InsiderTradeViewSet,
    InstitutionalHoldingViewSet,
    MacroDataPointViewSet,
    MacroSeriesViewSet,
    NewsViewSet,
    SectorViewSet,
    SignalRankViewSet,
    StockMacroCorrelationViewSet,
    StockRankViewSet,
    StockViewSet,
    TaskViewSet,
    ValuationRankViewSet,
    ValuationRatioViewSet,
    login_view,
    logout_view,
    register,
    health_check,
)

router = DefaultRouter()
router.register(r"sectors", SectorViewSet, basename="sector")
router.register(r"stocks", StockViewSet, basename="stock")
router.register(r"historicals", HistoricalViewSet, basename="historical")
router.register(r"incomes", IncomeStatementViewSet, basename="income")
router.register(r"cashes", CashFlowViewSet, basename="cash")
router.register(r"balances", BalanceSheetViewSet, basename="balance")
router.register(r"ratios", ValuationRatioViewSet, basename="ratio")
router.register(r"diaries", DiaryViewSet, basename="diary")
router.register(r"news", NewsViewSet, basename="news")
router.register(r"tasks", TaskViewSet, basename="task")
router.register(r"insider-trades", InsiderTradeViewSet, basename="insider-trade")
router.register(r"macro-series", MacroSeriesViewSet, basename="macro-series")
router.register(r"macro-data", MacroDataPointViewSet, basename="macro-data")
router.register(r"earnings", EarningsEventViewSet, basename="earnings")
router.register(r"holdings", InstitutionalHoldingViewSet, basename="holdings")
router.register(r"macro-correlations", StockMacroCorrelationViewSet, basename="macro-correlations")
router.register(r"stock-ranks", StockRankViewSet, basename="stock-rank")
router.register(r"signal-ranks", SignalRankViewSet, basename="signal-rank")
router.register(r"balance-ranks", BalanceRankViewSet, basename="balance-rank")
router.register(r"cash-ranks", CashRankViewSet, basename="cash-rank")
router.register(r"income-ranks", IncomeRankViewSet, basename="income-rank")
router.register(r"valuation-ranks", ValuationRankViewSet, basename="valuation-rank")
router.register(r"backtest", BacktestViewSet, basename="backtest")

urlpatterns = [
    path("", include(router.urls)),
    path("users/", register, name="register"),
    path("auth/login/", login_view, name="login"),
    path("auth/logout/", logout_view, name="logout"),
    path("health/", health_check, name="health"),
]
