import logging
from datetime import date
from datetime import datetime
from datetime import timedelta

from tastypie import fields
from tastypie.constants import ALL
from tastypie.resources import ModelResource

from stock.models import BalanceSheet
from stock.models import CashFlow
from stock.models import IncomeStatement
from stock.models import MyStock
from stock.models import MyStockHistorical
from stock.models import MyStrategyValue
from stock.models import ValuationRatio

logger = logging.getLogger("stock")


class StockResource(ModelResource):
    symbol = fields.CharField("symbol")
    olds = fields.ListField("olds", null=True, use_in="detail")
    indexes = fields.DictField("indexes", null=True, use_in="detail")
    stats = fields.DictField("stats", null=True, use_in="detail")
    incomes = fields.ToManyField(
        "stock.api.IncomeStatementResource",
        "incomes",
        null=True,
        use_in="detail",
        full=True,
    )
    cashes = fields.ToManyField(
        "stock.api.CashFlowResource",
        "cashes",
        null=True,
        use_in="detail",
        full=True,
    )
    ratios = fields.ToManyField(
        "stock.api.ValuationRatioResource",
        "ratios",
        null=True,
        use_in="detail",
        full=True,
    )
    balances = fields.ToManyField(
        "stock.api.BalanceSheetResource",
        "balances",
        null=True,
        use_in="detail",
        full=True,
    )

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
        """Stats based on these data point."""

        # already sorted by date
        historicals = self._get_selected_historicals(bundle)
        return MyStrategyValue.objects.stats(historicals)


class HistoricalResource(ModelResource):
    stock = fields.ForeignKey(
        "stock.api.StockResource", "stock", use_in="detail"
    )

    class Meta:
        queryset = MyStockHistorical.objects.all()
        filtering = {"on": ["range"]}
        resource_name = "historicals"


class StrategyValueResource(ModelResource):
    hist = fields.ForeignKey(
        "stock.api.HistoricalResource", "hist", use_in="detail"
    )

    class Meta:
        queryset = MyStrategyValue.objects.all()
        filtering = {"method": ALL, "hist__stock__symbol": ALL}
        resource_name = "indexes"


class IncomeStatementResource(ModelResource):
    stock = fields.ForeignKey(
        "stock.api.StockResource", "stock", use_in="detail"
    )

    net_income_margin = fields.FloatField("net_income_margin", use_in="detail")
    gross_margin = fields.FloatField("gross_margin", use_in="detail")
    opex_margin = fields.FloatField("opex_margin", use_in="detail")
    ebit_margin = fields.FloatField("ebit_margin", use_in="detail")
    expense_margin = fields.FloatField("expense_margin", use_in="detail")

    class Meta:
        queryset = IncomeStatement.objects.all()
        resource_name = "incomes"
        ordering = ["on"]


class CashFlowResource(ModelResource):
    cash_change_pcnt = fields.FloatField(
        "cash_change_pcnt", null=True, use_in="detail"
    )

    class Meta:
        queryset = CashFlow.objects.all()
        resources_name = "cashes"
        ordering = ["on"]


class ValuationRatioResource(ModelResource):
    class Meta:
        queryset = ValuationRatio.objects.all()
        resources_name = "ratios"
        ordering = ["on"]


class BalanceSheetResource(ModelResource):
    current_ratio = fields.FloatField("current_ratio", use_in="detail")
    quick_ratio = fields.FloatField("quick_ratio", use_in="detail")
    debt_to_equity_ratio = fields.FloatField(
        "debt_to_equity_ratio", use_in="detail"
    )

    class Meta:
        queryset = BalanceSheet.objects.all()
        resources_name = "balances"
        ordering = ["on"]
