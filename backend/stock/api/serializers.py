# -*- coding: utf-8 -*-

from rest_framework import serializers

from stock.models import (
    BalanceSheet,
    CashFlow,
    IncomeStatement,
    MyDiary,
    MyNews,
    MySector,
    MyStock,
    MyStockHistorical,
    MyTask,
    ValuationRatio,
)


class StockListSerializer(serializers.ModelSerializer):
    pe = serializers.FloatField(read_only=True)
    pb = serializers.FloatField(read_only=True)
    ps = serializers.FloatField(read_only=True)
    last_lower = serializers.IntegerField(read_only=True)
    last_better = serializers.IntegerField(read_only=True)
    last_reporting_date = serializers.DateField(read_only=True)
    price_to_cash_premium = serializers.FloatField(read_only=True)

    class Meta:
        model = MyStock
        fields = [
            "id", "symbol", "beta", "roa", "roe", "profit_margin",
            "shares_outstanding", "top_ten_institution_ownership",
            "institution_count", "pe", "pb", "ps", "last_lower",
            "last_better", "last_reporting_date", "price_to_cash_premium",
        ]


class StockDetailSerializer(StockListSerializer):
    tax_rate = serializers.FloatField(read_only=True)
    latest_close_price = serializers.FloatField(read_only=True)
    dupont_roe = serializers.FloatField(read_only=True)
    roe_dupont_reported_gap = serializers.FloatField(read_only=True)

    class Meta(StockListSerializer.Meta):
        fields = StockListSerializer.Meta.fields + [
            "tax_rate", "latest_close_price",
            "dupont_roe", "roe_dupont_reported_gap",
        ]


class StockCreateSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=64)
    sectors = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])


class SectorSerializer(serializers.ModelSerializer):
    stocks_detail = StockListSerializer(source="stocks", many=True, read_only=True)

    class Meta:
        model = MySector
        fields = ["id", "name", "stocks", "stocks_detail"]
        extra_kwargs = {"stocks": {"required": False}}


class SectorCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=32)


class HistoricalSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="stock.symbol", read_only=True)
    stock_id = serializers.IntegerField(source="stock.id", read_only=True)
    last_lower = serializers.IntegerField(read_only=True)
    last_better = serializers.IntegerField(read_only=True)
    next_better = serializers.IntegerField(read_only=True)
    gain_probability = serializers.FloatField(read_only=True)
    vol_over_share_outstanding = serializers.FloatField(read_only=True)

    class Meta:
        model = MyStockHistorical
        fields = [
            "id", "stock", "on", "open_price", "high_price", "low_price",
            "close_price", "adj_close", "vol", "symbol", "stock_id",
            "last_lower", "last_better", "next_better", "gain_probability",
            "vol_over_share_outstanding",
        ]


class IncomeStatementSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="stock.symbol", read_only=True)
    close_price = serializers.FloatField(read_only=True)
    net_income_to_revenue = serializers.FloatField(read_only=True)
    gross_profit_to_revenue = serializers.FloatField(read_only=True)
    cogs_to_revenue = serializers.FloatField(read_only=True)
    ebit_to_revenue = serializers.FloatField(read_only=True)
    total_expense_to_revenue = serializers.FloatField(read_only=True)
    operating_income_to_revenue = serializers.FloatField(read_only=True)
    operating_expense_to_revenue = serializers.FloatField(read_only=True)
    selling_ga_to_revenue = serializers.FloatField(read_only=True)
    interest_income_to_revenue = serializers.FloatField(read_only=True)
    other_income_expense_to_revenue = serializers.FloatField(read_only=True)
    pretax_income_to_revenue = serializers.FloatField(read_only=True)
    operating_profit = serializers.FloatField(read_only=True)
    operating_profit_to_operating_income = serializers.FloatField(read_only=True)
    net_income_to_operating_income = serializers.FloatField(read_only=True)
    ebit_to_total_asset = serializers.FloatField(read_only=True)
    net_income_to_equity = serializers.FloatField(read_only=True)
    net_income_growth_rate = serializers.FloatField(read_only=True)
    operating_income_growth_rate = serializers.FloatField(read_only=True)
    cogs_to_inventory = serializers.FloatField(read_only=True)
    interest_coverage_ratio = serializers.FloatField(read_only=True)

    class Meta:
        model = IncomeStatement
        fields = "__all__"


class CashFlowSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="stock.symbol", read_only=True)
    close_price = serializers.FloatField(read_only=True)
    cash_change_pcnt = serializers.FloatField(read_only=True)
    fcf_over_ocf = serializers.FloatField(read_only=True)
    fcf_over_net_income = serializers.FloatField(read_only=True)
    ocf_over_net_income = serializers.FloatField(read_only=True)
    operating_cash_flow_growth = serializers.FloatField(read_only=True)
    dividend_payout_ratio = serializers.FloatField(read_only=True)

    class Meta:
        model = CashFlow
        fields = "__all__"


class BalanceSheetSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="stock.symbol", read_only=True)
    close_price = serializers.FloatField(read_only=True)
    total_liability = serializers.FloatField(read_only=True)
    current_ratio = serializers.FloatField(read_only=True)
    quick_ratio = serializers.FloatField(read_only=True)
    debt_to_equity_ratio = serializers.FloatField(read_only=True)
    capital_structure = serializers.FloatField(read_only=True)
    equity_multiplier = serializers.FloatField(read_only=True)
    liability_to_asset = serializers.FloatField(read_only=True)
    current_asset_to_total_asset = serializers.FloatField(read_only=True)
    working_capital_to_current_liabilities = serializers.FloatField(read_only=True)
    non_current_to_equity = serializers.FloatField(read_only=True)
    retained_earnings_to_equity = serializers.FloatField(read_only=True)
    inventory_to_current_asset = serializers.FloatField(read_only=True)
    cash_cash_equivalents_and_short_term_investments_to_current_asset = serializers.FloatField(read_only=True)
    equity_growth_rate = serializers.FloatField(read_only=True)
    debt_growth_rate = serializers.FloatField(read_only=True)
    ap_growth_rate = serializers.FloatField(read_only=True)
    ar_growth_rate = serializers.FloatField(read_only=True)
    all_cash_growth_rate = serializers.FloatField(read_only=True)
    working_capital_growth_rate = serializers.FloatField(read_only=True)
    invested_capital_growth_rate = serializers.FloatField(read_only=True)
    net_ppe_growth_rate = serializers.FloatField(read_only=True)
    share_issued_growth_rate = serializers.FloatField(read_only=True)
    tangible_book_value_per_share = serializers.FloatField(read_only=True)
    cash_and_cash_equivalent_per_share = serializers.FloatField(read_only=True)
    price_to_cash_premium = serializers.FloatField(read_only=True)

    class Meta:
        model = BalanceSheet
        fields = "__all__"


class ValuationRatioSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="stock.symbol", read_only=True)

    class Meta:
        model = ValuationRatio
        fields = "__all__"


class DiaryListSerializer(serializers.ModelSerializer):
    price = serializers.FloatField(read_only=True)
    is_correct = serializers.BooleanField(read_only=True)

    class Meta:
        model = MyDiary
        fields = ["id", "stock", "created", "last_updated", "judgement", "price", "is_correct"]


class DiaryDetailSerializer(DiaryListSerializer):
    class Meta(DiaryListSerializer.Meta):
        fields = DiaryListSerializer.Meta.fields + ["content"]


class DiaryCreateSerializer(serializers.Serializer):
    stock = serializers.IntegerField(required=False, allow_null=True)
    content = serializers.CharField()
    judgement = serializers.IntegerField()


class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyNews
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    stocks = serializers.SerializerMethodField()

    class Meta:
        model = MyTask
        fields = ["id", "state", "stocks"]

    def get_stocks(self, obj):
        return [{"id": s.id, "symbol": s.symbol} for s in obj.stocks.all()]


class InsiderTradeSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="stock.symbol", read_only=True)

    class Meta:
        from stock.models.insider_trade import InsiderTrade

        model = InsiderTrade
        fields = [
            "id", "stock", "symbol", "filed_on", "trade_date",
            "insider_name", "insider_title", "insider_cik",
            "transaction_type", "shares", "price_per_share",
            "total_value", "shares_owned_after", "is_direct",
        ]


class MacroSeriesSerializer(serializers.ModelSerializer):
    class Meta:
        from stock.models.macro import MacroSeries

        model = MacroSeries
        fields = ["id", "series_id", "title", "frequency", "units", "category", "last_updated"]


class MacroDataPointSerializer(serializers.ModelSerializer):
    series_id = serializers.CharField(source="series.series_id", read_only=True)

    class Meta:
        from stock.models.macro import MacroDataPoint

        model = MacroDataPoint
        fields = ["id", "series", "series_id", "date", "value"]


class EarningsEventSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="stock.symbol", read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_beat = serializers.BooleanField(read_only=True)

    class Meta:
        from stock.models.earnings import EarningsEvent

        model = EarningsEvent
        fields = [
            "id", "stock", "symbol", "report_date", "fiscal_date_ending",
            "report_time", "estimated_eps", "reported_eps",
            "surprise", "surprise_pct", "is_upcoming", "is_beat",
        ]


class InstitutionalHoldingSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="stock.symbol", read_only=True)

    class Meta:
        from stock.models.institutional_holding import InstitutionalHolding

        model = InstitutionalHolding
        fields = [
            "id", "stock", "symbol", "report_date",
            "institution_name", "institution_cik",
            "shares", "value", "change_shares", "change_type",
        ]
