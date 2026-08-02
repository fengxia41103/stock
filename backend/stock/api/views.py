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
    EarningsEventSerializer,
    HistoricalSerializer,
    IncomeStatementSerializer,
    InsiderTradeSerializer,
    InstitutionalHoldingSerializer,
    MacroDataPointSerializer,
    MacroSeriesSerializer,
    NewsSerializer,
    SectorCreateSerializer,
    SectorSerializer,
    StockCreateSerializer,
    StockDetailSerializer,
    StockListSerializer,
    StockMacroCorrelationSerializer,
    TaskSerializer,
    ValuationRatioSerializer,
)
from stock.models import (
    BalanceSheet,
    CashFlow,
    EarningsEvent,
    IncomeStatement,
    InsiderTrade,
    InstitutionalHolding,
    MacroDataPoint,
    MacroSeries,
    MyDiary,
    MyNews,
    MySector,
    MyStock,
    MyStockHistorical,
    MyTask,
    StockMacroCorrelation,
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


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Health check: DB + Redis + Celery connectivity."""
    from django.db import connection
    from django.core.cache import cache

    checks = {}
    try:
        connection.ensure_connection()
        checks["db"] = "ok"
    except Exception as e:
        checks["db"] = str(e)

    try:
        cache.set("health", "1", 5)
        checks["redis"] = "ok" if cache.get("health") == "1" else "fail"
    except Exception as e:
        checks["redis"] = str(e)

    try:
        from fin.celery import app as celery_app
        inspector = celery_app.control.inspect(timeout=2)
        active = inspector.active_queues()
        checks["celery"] = "ok" if active else "no workers"
    except Exception as e:
        checks["celery"] = str(e)

    ok = all(v == "ok" for v in checks.values())
    return Response(checks, status=status.HTTP_200_OK if ok else status.HTTP_503_SERVICE_UNAVAILABLE)


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

    @action(detail=True, methods=["get"])
    def graham(self, request, pk=None):
        """Benjamin Graham valuation analysis."""
        stock = self.get_object()
        return Response({
            "symbol": stock.symbol,
            "price": stock.latest_close_price,
            "graham_score": stock.graham_score,
            "graham_number": stock.graham_number,
            "graham_intrinsic_value": stock.graham_intrinsic_value,
            "graham_margin_of_safety": stock.graham_margin_of_safety,
            "pe": stock.pe,
            "pb": stock.pb,
            "pe_pb_product": stock.pe_pb_product,
            "net_net_ratio": stock.net_net_ratio,
            "criteria": {
                "size": bool(stock.incomes.order_by("-on").first() and stock.incomes.order_by("-on").first().total_revenue and stock.incomes.order_by("-on").first().total_revenue > 0.1),
                "current_ratio_gt_2": bool(stock.balances.order_by("-on").first() and stock.balances.order_by("-on").first().current_ratio and stock.balances.order_by("-on").first().current_ratio > 2),
                "pe_lt_15": bool(stock.pe and 0 < stock.pe < 15),
                "pe_pb_lt_22_5": bool(stock.pe_pb_product and stock.pe_pb_product < 22.5),
                "low_debt": bool(stock.balances.order_by("-on").first() and stock.balances.order_by("-on").first().working_capital and stock.balances.order_by("-on").first().total_debt < stock.balances.order_by("-on").first().working_capital),
            },
        })

    @action(detail=True, methods=["get"])
    def health(self, request, pk=None):
        """SEC XBRL health assessment for a stock."""
        from stock.workers.compute_health import compute_health
        stock = self.get_object()
        result = compute_health(stock.symbol)
        return Response(result)

    @action(detail=True, methods=["get"])
    def report(self, request, pk=None):
        """Live analysis report — Darwin + Graham + Box Trading."""
        from stock.report_service import generate_report
        stock = self.get_object()
        return Response(generate_report(stock))

    @action(detail=False, methods=["get"])
    def overview(self, request):
        """Lightweight overview for treemap/screener. Accepts ?date=YYYY-MM-DD."""
        from datetime import datetime
        target_date = request.query_params.get("date")
        stocks = MyStock.objects.filter(sectors__user=request.user).distinct()
        result = []
        for s in stocks:
            if target_date:
                hist = list(s.historicals.filter(on__lte=target_date).order_by("-on")[:2])
            else:
                hist = list(s.historicals.order_by("-on")[:2])
            price = hist[0].close_price if hist else None
            daily_return = None
            if len(hist) >= 2 and hist[1].close_price:
                daily_return = (hist[0].close_price - hist[1].close_price) / hist[1].close_price * 100
            sectors = list(s.sectors.filter(user=request.user).values_list("name", flat=True))

            # Volume as % of outstanding
            vol_pct = None
            if hist and hist[0].vol and s.shares_outstanding:
                vol_pct = round(hist[0].vol / (s.shares_outstanding * 1000) * 100, 2)

            result.append({
                "id": s.id,
                "symbol": s.symbol,
                "name": s.name,
                "price": price,
                "daily_return_pct": round(daily_return, 2) if daily_return else None,
                "market_cap": (s.shares_outstanding or 0) * (price or 0),
                "sector": sectors[0] if sectors else None,
                "pe": s.d_pe,
                "pb": s.d_pb,
                "roe": s.roe,
                "beta": s.beta,
                "last_lower": s.d_last_lower,
                "insider_sentiment": s.insider_sentiment_3m,
                "vol_pct_outstanding": vol_pct,
            })
        return Response(result)

    @action(detail=False, methods=["get"])
    def technicals(self, request):
        """Compute RSI(14), SMA50, SMA200, BB position for all user stocks."""
        import numpy as np
        from stock.backtesting.indicators import rsi, sma

        stocks = MyStock.objects.filter(sectors__user=request.user).distinct()
        result = []

        for s in stocks:
            closes = list(
                s.historicals.order_by("-on")[:200].values_list("close_price", flat=True)
            )
            if len(closes) < 20:
                continue

            closes = list(reversed(closes))  # oldest first
            price = closes[-1]

            # RSI(14)
            current_rsi = rsi(closes) if len(closes) >= 15 else None

            # SMA50, SMA200
            sma50 = np.mean(closes[-50:]) if len(closes) >= 50 else None
            sma200 = np.mean(closes[-200:]) if len(closes) >= 200 else None

            # Bollinger Band position: (price - lower) / (upper - lower)
            bb_position = None
            if len(closes) >= 20:
                mid = np.mean(closes[-20:])
                std = np.std(closes[-20:])
                upper = mid + 2 * std
                lower = mid - 2 * std
                if upper != lower:
                    bb_position = round((price - lower) / (upper - lower) * 100, 1)

            # SMA cross signal
            sma_signal = None
            if sma50 is not None and sma200 is not None:
                if sma50 > sma200:
                    sma_signal = "golden_cross"
                else:
                    sma_signal = "death_cross"

            # Verdict
            verdict = "NEUTRAL"
            if current_rsi is not None:
                if current_rsi < 30:
                    verdict = "OVERSOLD"
                elif current_rsi > 70:
                    verdict = "OVERBOUGHT"
                elif sma_signal == "golden_cross" and current_rsi > 50:
                    verdict = "BULLISH"
                elif sma_signal == "death_cross" and current_rsi < 50:
                    verdict = "BEARISH"

            result.append({
                "id": s.id,
                "symbol": s.symbol,
                "price": round(price, 2),
                "rsi": round(current_rsi, 1) if current_rsi else None,
                "sma50": round(sma50, 2) if sma50 else None,
                "sma200": round(sma200, 2) if sma200 else None,
                "sma_signal": sma_signal,
                "bb_position": bb_position,
                "last_lower": s.d_last_lower,
                "verdict": verdict,
            })

        # Sort: oversold first, then by RSI ascending
        result.sort(key=lambda x: (x["rsi"] or 50))
        return Response(result)

    @action(detail=False, methods=["get"])
    def brief(self, request):
        """Morning brief: one-page summary of what needs attention today."""
        from datetime import date, timedelta
        from stock.models.alert import AlertEvent
        from stock.models import EarningsEvent, InsiderTrade
        from stock.models.snapshot import StockSnapshot
        from stock.models.portfolio import Position

        user = request.user
        today = date.today()
        stocks = MyStock.objects.filter(sectors__user=user).distinct()

        # 1. Oversold stocks (RSI < 30)
        oversold = list(
            StockSnapshot.objects.filter(stock__in=stocks, rsi__lt=30)
            .select_related("stock")
            .values("stock__id", "stock__symbol", "price", "rsi", "last_lower", "verdict")[:10]
        )

        # 2. Overbought stocks (RSI > 70)
        overbought = list(
            StockSnapshot.objects.filter(stock__in=stocks, rsi__gt=70)
            .select_related("stock")
            .values("stock__id", "stock__symbol", "price", "rsi", "verdict")[:10]
        )

        # 3. Triggered alerts (unread)
        from stock.api.serializers import AlertEventSerializer
        alerts = AlertEvent.objects.filter(
            alert__user=user, is_read=False
        ).select_related("alert__stock", "stock")[:10]
        alert_data = AlertEventSerializer(alerts, many=True).data

        # 4. Upcoming earnings (next 7 days)
        earnings = list(
            EarningsEvent.objects.filter(
                stock__in=stocks,
                report_date__gte=today,
                report_date__lte=today + timedelta(days=7),
            ).select_related("stock")
            .values("stock__symbol", "report_date", "estimated_eps")[:10]
        )

        # 5. Top movers (from snapshots)
        movers = list(
            StockSnapshot.objects.filter(stock__in=stocks, daily_return_pct__isnull=False)
            .select_related("stock")
            .order_by("-daily_return_pct")
            .values("stock__symbol", "price", "daily_return_pct")[:5]
        )
        losers = list(
            StockSnapshot.objects.filter(stock__in=stocks, daily_return_pct__isnull=False)
            .select_related("stock")
            .order_by("daily_return_pct")
            .values("stock__symbol", "price", "daily_return_pct")[:5]
        )

        # 6. Portfolio P&L (if positions exist)
        positions = Position.objects.filter(user=user, closed_at__isnull=True, shares__gt=0).select_related("stock")
        portfolio_summary = None
        if positions.exists():
            total_cost = sum(p.shares * p.avg_cost for p in positions)
            total_value = sum((p.market_value or 0) for p in positions)
            portfolio_summary = {
                "total_value": round(total_value, 0),
                "total_pnl": round(total_value - total_cost, 0),
                "total_pnl_pct": round((total_value - total_cost) / total_cost * 100, 1) if total_cost else 0,
                "positions": positions.count(),
            }

        # 7. Recent insider trades (last 3 days)
        insider_cutoff = today - timedelta(days=3)
        insider_trades = list(
            InsiderTrade.objects.filter(stock__in=stocks, trade_date__gte=insider_cutoff)
            .select_related("stock")
            .order_by("-trade_date")
            .values("stock__symbol", "insider_name", "transaction_type", "shares", "price_per_share", "trade_date")[:10]
        )

        return Response({
            "date": str(today),
            "oversold": oversold,
            "overbought": overbought,
            "alerts": alert_data,
            "earnings_this_week": earnings,
            "top_gainers": movers,
            "top_losers": losers,
            "portfolio": portfolio_summary,
            "recent_insider_trades": insider_trades,
        })


class HistoricalViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HistoricalSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = {"on": ["exact", "range"], "stock": ["exact", "in"]}
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
        return MyDiary.objects.filter(user=self.request.user).select_related("stock").order_by("-last_updated")

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

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Aggregated prediction accuracy stats."""
        from collections import defaultdict

        entries = list(
            MyDiary.objects.filter(user=request.user).select_related("stock")
        )
        total = len(entries)
        if total == 0:
            return Response({"total": 0})

        correct = sum(1 for d in entries if d.is_correct)
        wrong = total - correct

        bulls = [d for d in entries if d.judgement == 1]
        bears = [d for d in entries if d.judgement == 2]
        bull_correct = sum(1 for d in bulls if d.is_correct)
        bear_correct = sum(1 for d in bears if d.is_correct)

        by_stock = defaultdict(lambda: {"total": 0, "correct": 0})
        for d in entries:
            sym = d.stock.symbol if d.stock else "GENERAL"
            by_stock[sym]["total"] += 1
            if d.is_correct:
                by_stock[sym]["correct"] += 1

        return Response({
            "total": total,
            "correct": correct,
            "wrong": wrong,
            "accuracy_pct": round(correct / total * 100, 1) if total else 0,
            "bull_total": len(bulls),
            "bull_correct": bull_correct,
            "bull_accuracy_pct": round(bull_correct / len(bulls) * 100, 1) if bulls else 0,
            "bear_total": len(bears),
            "bear_correct": bear_correct,
            "bear_accuracy_pct": round(bear_correct / len(bears) * 100, 1) if bears else 0,
            "by_stock": [
                {
                    "symbol": k,
                    "total": v["total"],
                    "correct": v["correct"],
                    "accuracy_pct": round(v["correct"] / v["total"] * 100, 1) if v["total"] else 0,
                }
                for k, v in sorted(by_stock.items(), key=lambda x: x[1]["total"], reverse=True)
            ],
        })


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
        return InsiderTrade.objects.filter(
            stock__sectors__user=self.request.user,
            transaction_type__in=["P", "S"],
        ).distinct()


class MacroSeriesViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MacroSeriesSerializer
    permission_classes = [IsAuthenticated]
    queryset = MacroSeries.objects.all()
    filterset_fields = ["category", "series_id"]
    pagination_class = None


class MacroDataPointViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MacroDataPointSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = {"series": ["exact"], "date": ["exact", "gte", "lte", "range"]}
    ordering = ["-date"]

    def get_queryset(self):
        qs = MacroDataPoint.objects.all()
        series_id = self.request.query_params.get("series_id")
        if series_id:
            qs = qs.filter(series__series_id=series_id)
        return qs


class EarningsEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EarningsEventSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["stock", "report_date"]
    ordering = ["-report_date"]

    def get_queryset(self):
        return EarningsEvent.objects.filter(
            stock__sectors__user=self.request.user
        ).distinct()

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        """Next 30 days of earnings for user's stocks."""
        events = EarningsEvent.objects.filter(
            stock__sectors__user=request.user,
            report_date__gte=date.today(),
            report_date__lte=date.today() + timedelta(days=30),
        ).select_related("stock").distinct()
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)


class InstitutionalHoldingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InstitutionalHoldingSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["stock", "report_date"]
    ordering = ["-report_date", "-value"]

    def get_queryset(self):
        return InstitutionalHolding.objects.filter(
            stock__sectors__user=self.request.user
        ).distinct()


class StockMacroCorrelationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StockMacroCorrelationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["stock", "series", "window_days"]
    ordering = ["-correlation"]
    pagination_class = None

    def get_queryset(self):
        return StockMacroCorrelation.objects.filter(
            stock__sectors__user=self.request.user
        ).distinct()


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


class SignalRankViewSet(RankingViewSet):
    """Rankings by insider sentiment, earnings beat rate, momentum, RSI."""
    rank_type = "signal"

    def _compute(self, request):
        stocks = list(MyStock.objects.filter(sectors__user=request.user).distinct())
        results = []

        # 1. Insider Sentiment (3M) — high is better
        vals = []
        for s in stocks:
            sent = s.insider_sentiment_3m
            if sent is not None:
                vals.append({"id": s.id, "symbol": s.symbol, "val": round(sent * 100, 1)})
        vals.sort(key=lambda x: x["val"], reverse=True)
        results.append({"id": 0, "name": "insider_sentiment_3m", "stats": vals})

        # 2. Earnings Beat Rate — high is better
        vals = []
        for s in stocks:
            rate = s.earnings_beat_rate
            if rate is not None:
                vals.append({"id": s.id, "symbol": s.symbol, "val": round(rate, 0)})
        vals.sort(key=lambda x: x["val"], reverse=True)
        results.append({"id": 1, "name": "earnings_beat_rate", "stats": vals})

        # 3. Weekly Return % — high is better
        vals = []
        for s in stocks:
            hist = list(s.historicals.order_by("-on")[:5])
            if len(hist) >= 5 and hist[-1].close_price:
                ret = (hist[0].close_price - hist[-1].close_price) / hist[-1].close_price * 100
                vals.append({"id": s.id, "symbol": s.symbol, "val": round(ret, 2)})
        vals.sort(key=lambda x: x["val"], reverse=True)
        results.append({"id": 2, "name": "weekly_return_pct", "stats": vals})

        # 4. RSI proxy (last_lower) — LOW is oversold = buying opportunity
        vals = []
        for s in stocks:
            ll = s.d_last_lower
            if ll is not None and ll > 0:
                vals.append({"id": s.id, "symbol": s.symbol, "val": ll})
        vals.sort(key=lambda x: x["val"], reverse=True)  # Biggest drop first
        results.append({"id": 3, "name": "drop_scale_days", "stats": vals})

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



# --- Portfolio ---


class PortfolioViewSet(viewsets.ViewSet):
    """Portfolio positions and transactions."""

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def holdings(self, request):
        """List all open positions with current value."""
        from stock.models.portfolio import Position
        from stock.api.serializers import PositionSerializer

        positions = Position.objects.filter(
            user=request.user, closed_at__isnull=True, shares__gt=0
        ).select_related("stock")
        serializer = PositionSerializer(positions, many=True)

        # Compute totals
        data = serializer.data
        total_cost = sum(p.get("total_cost") or 0 for p in data)
        total_value = sum(p.get("market_value") or 0 for p in data)
        total_pnl = total_value - total_cost if total_cost else 0
        total_pnl_pct = (total_pnl / total_cost * 100) if total_cost > 0 else 0

        return Response({
            "positions": data,
            "summary": {
                "total_cost": round(total_cost, 2),
                "total_value": round(total_value, 2),
                "total_pnl": round(total_pnl, 2),
                "total_pnl_pct": round(total_pnl_pct, 2),
                "position_count": len(data),
            },
        })

    @action(detail=False, methods=["post"], url_path="add-transaction")
    def add_transaction(self, request):
        """Add a BUY or SELL transaction. Creates/updates position automatically."""
        from stock.api.serializers import AddTransactionSerializer
        from stock.models.portfolio import Position, Transaction

        s = AddTransactionSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data

        stock = MyStock.objects.get(id=d["stock"])

        # Find or create open position for this stock
        position, created = Position.objects.get_or_create(
            user=request.user,
            stock=stock,
            closed_at__isnull=True,
            defaults={"shares": 0, "avg_cost": 0, "opened_at": d["date"]},
        )

        # Create transaction record
        Transaction.objects.create(
            position=position,
            action=d["action"],
            shares=d["shares"],
            price=d["price"],
            date=d["date"],
            notes=d.get("notes", ""),
        )

        # Update position
        if d["action"] == "BUY":
            total_cost = position.shares * position.avg_cost + d["shares"] * d["price"]
            position.shares += d["shares"]
            position.avg_cost = total_cost / position.shares if position.shares > 0 else 0
        elif d["action"] == "SELL":
            position.shares -= d["shares"]
            if position.shares <= 0:
                position.shares = 0
                position.closed_at = d["date"]

        position.save()

        from stock.api.serializers import PositionSerializer
        return Response(PositionSerializer(position).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def transactions(self, request):
        """List all transactions for the user."""
        from stock.models.portfolio import Transaction
        from stock.api.serializers import TransactionSerializer

        stock_id = request.query_params.get("stock")
        qs = Transaction.objects.filter(position__user=request.user).select_related("position__stock")
        if stock_id:
            qs = qs.filter(position__stock_id=stock_id)
        return Response(TransactionSerializer(qs[:100], many=True).data)

# --- Alerts ---


class AlertViewSet(viewsets.ModelViewSet):
    """CRUD for user alerts + triggered events."""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        from stock.api.serializers import AlertSerializer
        return AlertSerializer

    def get_queryset(self):
        from stock.models.alert import Alert
        return Alert.objects.filter(user=self.request.user).select_related("stock")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def triggered(self, request):
        """Get unread triggered alert events."""
        from stock.models.alert import AlertEvent
        from stock.api.serializers import AlertEventSerializer
        events = AlertEvent.objects.filter(
            alert__user=request.user, is_read=False
        ).select_related("alert__stock")[:50]
        serializer = AlertEventSerializer(events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="mark-read")
    def mark_read(self, request):
        """Mark all triggered events as read."""
        from stock.models.alert import AlertEvent
        AlertEvent.objects.filter(alert__user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "ok"})


# --- Backtesting ---


class BacktestViewSet(viewsets.ViewSet):
    """Run strategy backtests against historical data (async via Celery)."""

    permission_classes = [IsAuthenticated]

    def _resolve_symbols(self, request, params):
        """Resolve symbols from sector, explicit list, or all."""
        symbols_input = params.get("symbols", [])
        sector_id = params.get("sector")

        if symbols_input and symbols_input != "all":
            return list(symbols_input)
        elif sector_id:
            sector = MySector.objects.filter(id=sector_id, user=request.user).first()
            return list(sector.stocks.values_list("symbol", flat=True)) if sector else []
        else:
            return list(
                MyStock.objects.filter(sectors__user=request.user)
                .distinct()
                .values_list("symbol", flat=True)
            )

    @action(detail=False, methods=["post"])
    def run(self, request):
        """Submit a backtest — returns task_id immediately (async)."""
        import uuid
        from stock.backtesting.strategies import STRATEGY_REGISTRY
        from stock.models.backtest import BacktestResult
        from stock.tasks import run_backtest_task

        params = request.data
        strategy_name = params.get("strategy", "darwin_rsi")
        start_date = params.get("start_date", "2020-01-01")
        end_date = params.get("end_date", "2026-07-30")
        initial_cash = params.get("initial_cash", 100000)
        strategy_params = params.get("strategy_params", {})

        if strategy_name not in STRATEGY_REGISTRY:
            return Response({"error": f"Unknown strategy: {strategy_name}"}, status=status.HTTP_400_BAD_REQUEST)

        symbols = self._resolve_symbols(request, params)

        # Create result record
        result_id = uuid.uuid4()
        BacktestResult.objects.create(
            id=result_id,
            user=request.user,
            strategy=strategy_name,
            params=strategy_params,
            symbols=symbols,
            start_date=start_date,
            end_date=end_date,
            initial_cash=initial_cash,
            mode="run",
        )

        # Submit to Celery
        run_backtest_task.apply_async(
            args=[str(result_id), strategy_name, symbols, start_date, end_date, initial_cash, strategy_params],
            task_id=str(result_id),
        )

        return Response({"task_id": str(result_id)}, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=["post"])
    def optimize(self, request):
        """Submit optimization — returns task_id immediately (async)."""
        import uuid
        from stock.backtesting.strategies import STRATEGY_REGISTRY
        from stock.models.backtest import BacktestResult
        from stock.tasks import run_optimize_task

        params = request.data
        strategy_name = params.get("strategy", "darwin_rsi")
        start_date = params.get("start_date", "2020-01-01")
        end_date = params.get("end_date", "2026-07-30")
        initial_cash = params.get("initial_cash", 100000)

        if strategy_name not in STRATEGY_REGISTRY:
            return Response({"error": f"Unknown strategy: {strategy_name}"}, status=status.HTTP_400_BAD_REQUEST)

        symbols = self._resolve_symbols(request, params)

        # Create result record
        result_id = uuid.uuid4()
        BacktestResult.objects.create(
            id=result_id,
            user=request.user,
            strategy=strategy_name,
            params={},
            symbols=symbols,
            start_date=start_date,
            end_date=end_date,
            initial_cash=initial_cash,
            mode="optimize",
        )

        # Submit to Celery
        run_optimize_task.apply_async(
            args=[str(result_id), strategy_name, symbols, start_date, end_date, initial_cash],
            task_id=str(result_id),
        )

        return Response({"task_id": str(result_id)}, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=["get"], url_path="status/(?P<task_id>[^/.]+)")
    def task_status(self, request, task_id=None):
        """Poll for backtest status + results."""
        from stock.models.backtest import BacktestResult

        result = BacktestResult.objects.filter(id=task_id, user=request.user).first()
        if not result:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        data = {
            "state": result.state,
            "progress": result.progress,
            "mode": result.mode,
            "strategy": result.strategy,
        }
        if result.state == "SUCCESS":
            data["result"] = result.result
        elif result.state == "FAILURE":
            data["error"] = result.error

        return Response(data)

    @action(detail=False, methods=["get"])
    def history(self, request):
        """List past backtest results."""
        from stock.models.backtest import BacktestResult

        results = BacktestResult.objects.filter(user=request.user)[:20]
        return Response([
            {
                "id": str(r.id),
                "strategy": r.strategy,
                "mode": r.mode,
                "state": r.state,
                "symbols_count": len(r.symbols),
                "start_date": str(r.start_date),
                "end_date": str(r.end_date),
                "created": r.created.isoformat(),
                "total_return": r.result.get("total_return_pct") if r.result else None,
            }
            for r in results
        ])

    @action(detail=False, methods=["get"])
    def strategies(self, request):
        """List available strategies with their parameters."""
        from stock.backtesting.strategies import STRATEGY_REGISTRY

        result = []
        for key, cls in STRATEGY_REGISTRY.items():
            result.append({
                "id": key,
                "name": cls.name,
                "description": cls.description,
                "params": cls.params_schema(),
            })
        return Response(result)
