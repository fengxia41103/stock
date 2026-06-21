# -*- coding: utf-8 -*-

from datetime import date, timedelta

from django.contrib.auth import authenticate, logout
from django.contrib.auth.models import User
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from stock.api.serializers import (
    BalanceSheetSerializer,
    CashFlowSerializer,
    DiaryCreateSerializer,
    DiaryDetailSerializer,
    DiaryListSerializer,
    HistoricalSerializer,
    IncomeStatementSerializer,
    InsiderTradeSerializer,
    NewsSerializer,
    SectorCreateSerializer,
    SectorSerializer,
    StockCreateSerializer,
    StockDetailSerializer,
    StockListSerializer,
    TaskSerializer,
    ValuationRatioSerializer,
)
from stock.models import (
    BalanceSheet,
    CashFlow,
    IncomeStatement,
    InsiderTrade,
    MyDiary,
    MyNews,
    MySector,
    MyStock,
    MyStockHistorical,
    MyTask,
    ValuationRatio,
)
from stock.tasks import batch_update_helper


# --- Auth views ---


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    if User.objects.filter(email=data.get("email")).exists():
        return Response({"error": "This email is already used"}, status=400)
    if User.objects.filter(username=data.get("username")).exists():
        return Response({"error": "This name is already taken"}, status=400)
    user = User.objects.create_user(
        data["username"], data["email"], data["password"],
        first_name=data.get("firstName", ""),
        last_name=data.get("lastName", ""),
    )
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"success": True, "data": {"user": user.username, "key": token.key}})


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    user = authenticate(
        username=request.data.get("username"),
        password=request.data.get("password"),
    )
    if not user:
        return Response({"success": False, "message": "Login failed"}, status=401)
    if not user.is_active:
        return Response({"success": False, "message": "User is not active"}, status=403)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"success": True, "data": {"user": user.username, "key": token.key}})


@api_view(["GET"])
def logout_view(request):
    if request.user.is_authenticated:
        logout(request)
    return Response({"success": True})


# --- ViewSets ---


class SectorViewSet(viewsets.ModelViewSet):
    serializer_class = SectorSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return MySector.objects.filter(user=self.request.user)

    def create(self, request):
        ser = SectorCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        sector, _ = MySector.objects.get_or_create(name=ser.validated_data["name"], user=request.user)
        return Response(SectorSerializer(sector).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        sector = self.get_object()
        for stock in sector.stocks.all():
            batch_update_helper(request.user, stock.symbol)
        return response


class StockViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.action == "retrieve":
            return StockDetailSerializer
        return StockListSerializer

    def get_queryset(self):
        return MyStock.objects.filter(sectors__user=self.request.user).distinct()

    def create(self, request):
        ser = StockCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        symbol = ser.validated_data["symbol"]
        sectors = ser.validated_data.get("sectors", [])

        stock, created = MyStock.objects.get_or_create(symbol=symbol)
        if sectors:
            for sector in MySector.objects.filter(id__in=sectors, user=request.user):
                sector.stocks.add(stock)
        else:
            misc, _ = MySector.objects.get_or_create(name="demo", user=request.user)
            misc.stocks.add(stock)

        if created:
            batch_update_helper(request.user, stock.symbol)

        return Response(StockListSerializer(stock).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        stock = self.get_object()
        batch_update_helper(request.user, stock.symbol)
        return Response(StockListSerializer(stock).data)

    @action(detail=True, methods=["get"])
    def dupont(self, request, pk=None):
        stock = self.get_object()
        return Response(stock.dupont_model)

    @action(detail=True, methods=["get"])
    def nav(self, request, pk=None):
        stock = self.get_object()
        return Response(stock.nav_model)

    @action(detail=True, methods=["get"], url_path="cross-statements")
    def cross_statements(self, request, pk=None):
        stock = self.get_object()
        return Response(stock.cross_statements_model)


class HistoricalViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HistoricalSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = {"on": ["exact", "range"], "stock": ["exact"]}
    ordering_fields = ["on"]
    ordering = ["on"]

    def get_queryset(self):
        stocks = MyStock.objects.filter(sectors__user=self.request.user).values_list("id", flat=True)
        return MyStockHistorical.objects.filter(stock__in=stocks)


class IncomeStatementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = IncomeStatementSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["stock"]
    ordering_fields = ["on"]
    ordering = ["on"]

    def get_queryset(self):
        return IncomeStatement.objects.filter(stock__sectors__user=self.request.user)


class CashFlowViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CashFlowSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["stock"]
    ordering_fields = ["on"]
    ordering = ["on"]

    def get_queryset(self):
        return CashFlow.objects.filter(stock__sectors__user=self.request.user)


class BalanceSheetViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BalanceSheetSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["stock"]
    ordering_fields = ["on"]
    ordering = ["on"]

    def get_queryset(self):
        return BalanceSheet.objects.filter(stock__sectors__user=self.request.user)


class ValuationRatioViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ValuationRatioSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["stock"]
    ordering_fields = ["on"]
    ordering = ["on"]

    def get_queryset(self):
        return ValuationRatio.objects.filter(stock__sectors__user=self.request.user)


class DiaryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return DiaryDetailSerializer
        if self.action == "create":
            return DiaryCreateSerializer
        return DiaryListSerializer

    def get_queryset(self):
        return MyDiary.objects.filter(user=self.request.user).order_by("-last_updated")

    def create(self, request):
        ser = DiaryCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        stock = MyStock.objects.filter(id=d.get("stock")).first()
        content = d["content"]
        if stock and stock.symbol not in content:
            content += f"\n- {stock.symbol}\n"
        diary = MyDiary.objects.create(
            user=request.user, stock=stock, content=content, judgement=d["judgement"]
        )
        return Response(DiaryDetailSerializer(diary).data, status=status.HTTP_201_CREATED)


class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NewsSerializer
    permission_classes = [AllowAny]
    queryset = MyNews.objects.all()
    filterset_fields = ["title", "topic", "summary", "pub_time"]
    ordering = ["-pub_time"]


class TaskViewSet(viewsets.mixins.ListModelMixin, viewsets.mixins.DestroyModelMixin, viewsets.GenericViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return MyTask.objects.filter(user=self.request.user)


class InsiderTradeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InsiderTradeSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["stock", "transaction_type"]
    ordering_fields = ["trade_date", "total_value"]
    ordering = ["-trade_date"]

    def get_queryset(self):
        return InsiderTrade.objects.filter(stock__sectors__user=self.request.user).distinct()


# --- Rankings ---


class RankingViewSet(viewsets.ViewSet):
    """Base ranking viewset — reads from RankingCache if available."""
    permission_classes = [IsAuthenticated]
    pagination_class = None
    rank_type = None  # Subclasses set this

    def list(self, request):
        from stock.models import RankingCache
        cache = RankingCache.objects.filter(rank_type=self.rank_type).first()
        if cache:
            results = cache.data
        else:
            results = self._compute(request)
        return Response(self._filter_results(request, results))

    def _get_object_list_helper(self, objects, sort_by, high_to_low):
        start = date.today() - timedelta(days=180)
        valid_entries = [
            x for x in objects.filter(on__gte=start)
            if getattr(x, sort_by) and getattr(x, sort_by) != -100
        ]
        data_set = sorted(valid_entries, key=lambda x: getattr(x, sort_by), reverse=high_to_low)

        vals = []
        counted = set()
        for x in data_set:
            symbol = x.stock.symbol
            if symbol in counted:
                continue
            counted.add(symbol)
            vals.append({"id": x.stock.id, "symbol": symbol, "on": x.on, "val": getattr(x, sort_by)})
        return vals

    def _get_ranks(self, request, objs, attrs):
        user_objs = objs.filter(stock__sectors__user=request.user)
        ranks = []
        for (idx, attr, high_to_low) in attrs:
            vals = self._get_object_list_helper(user_objs, attr, high_to_low)
            ranks.append({"id": idx, "name": attr, "stats": vals})
        return ranks

    def _filter_results(self, request, results):
        stats_in = request.query_params.get("stats__in")
        symbol_in = request.query_params.get("symbol__in")
        if stats_in:
            ids = [int(x) for x in stats_in.split(",")]
            for r in results:
                r["stats"] = [s for s in r["stats"] if s["id"] in ids]
        if symbol_in:
            symbols = [x.upper() for x in symbol_in.split(",")]
            for r in results:
                r["stats"] = [s for s in r["stats"] if s["symbol"] in symbols]
        return results


class StockRankViewSet(RankingViewSet):
    rank_type = "stock"

    def _compute(self, request):
        attrs = [
            (0, "roe", True),
            (1, "dupont_roe", True),
            (2, "roe_dupont_reported_gap", False),
        ]
        stocks = MyStock.objects.filter(sectors__user=request.user)
        results = []
        for idx, attr, high_to_low in attrs:
            vals = [{"id": s.id, "symbol": s.symbol, "val": getattr(s, attr)} for s in stocks]
            vals = [v for v in vals if v["val"] and v["val"] != -100]
            vals.sort(key=lambda x: x["val"], reverse=high_to_low)
            results.append({"id": idx, "name": attr, "stats": vals})
        return results


class BalanceRankViewSet(RankingViewSet):
    rank_type = "balance"

    def _compute(self, request):
        attrs = [
            (0, "current_ratio", True), (1, "quick_ratio", True),
            (2, "debt_to_equity_ratio", False), (3, "equity_multiplier", False),
            (4, "price_to_cash_premium", False), (5, "equity_growth_rate", True),
            (6, "debt_growth_rate", False), (7, "ap_growth_rate", False),
            (8, "ar_growth_rate", False), (9, "all_cash_growth_rate", True),
            (10, "working_capital_growth_rate", False), (11, "invested_capital_growth_rate", False),
            (12, "share_issued_growth_rate", False),
            (13, "cash_cash_equivalents_and_short_term_investments_to_current_asset", True),
            (14, "liability_to_asset", False), (15, "non_current_to_equity", True),
            (16, "retained_earnings_to_equity", True), (17, "inventory_to_current_asset", False),
            (18, "working_capital_to_current_liabilities", True),
        ]
        return self._get_ranks(request, BalanceSheet.objects, attrs)


class CashRankViewSet(RankingViewSet):
    rank_type = "cash"

    def _compute(self, request):
        attrs = [
            (0, "dividend_payout_ratio", True), (1, "operating_cash_flow_growth", True),
            (2, "cash_change_pcnt", True), (3, "fcf_over_ocf", True),
            (4, "fcf_over_net_income", True), (5, "ocf_over_net_income", True),
        ]
        return self._get_ranks(request, CashFlow.objects, attrs)


class IncomeRankViewSet(RankingViewSet):
    rank_type = "income"

    def _compute(self, request):
        attrs = [
            (0, "net_income_growth_rate", True), (1, "operating_income_growth_rate", True),
            (2, "gross_profit_to_revenue", True), (3, "net_income_to_revenue", True),
            (4, "operating_profit_to_operating_income", True), (5, "net_income_to_operating_income", True),
            (6, "pretax_income_to_revenue", True), (7, "cogs_to_revenue", False),
            (8, "ebit_to_revenue", True), (9, "total_expense_to_revenue", False),
            (10, "operating_income_to_revenue", True), (11, "operating_expense_to_revenue", False),
            (12, "selling_ga_to_revenue", False), (13, "interest_income_to_revenue", False),
            (14, "other_income_expense_to_revenue", False), (15, "ebit_to_total_asset", True),
            (16, "net_income_to_equity", True), (17, "cogs_to_inventory", True),
            (18, "interest_coverage_ratio", True),
        ]
        return self._get_ranks(request, IncomeStatement.objects, attrs)


class ValuationRankViewSet(RankingViewSet):
    rank_type = "valuation"

    def _compute(self, request):
        attrs = [(0, "pe", False), (1, "pb", False), (2, "ps", False)]
        return self._get_ranks(request, ValuationRatio.objects, attrs)
