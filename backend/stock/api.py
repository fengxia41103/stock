import logging
from datetime import date
from datetime import datetime
from datetime import timedelta

from tastypie import fields
from tastypie.constants import ALL
from tastypie.resources import Bundle
from tastypie.resources import ModelResource
from tastypie.resources import Resource

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

    tax_rate = fields.FloatField("tax_rate", null=True, use_in="detail")
    latest_close_price = fields.FloatField(
        "latest_close_price", null=True, use_in="detail"
    )

    dupont_model = fields.ListField("dupont_model", null=True, use_in="detail")
    nav_model = fields.ListField("nav_model", null=True, use_in="detail")
    dupont_roe = fields.FloatField("dupont_roe", null=True, use_in="detail")
    roe_dupont_reported_gap = fields.FloatField(
        "roe_dupont_reported_gap", null=True, use_in="detail"
    )
    one_month_historicals = fields.ListField(
        "one_month_historicals", null=True, use_in="detail"
    )
    last_reporting_date = fields.DateField("last_reporting_date", null=True)

    class Meta:
        queryset = MyStock.objects.all()
        resource_name = "stocks"
        filtering = {"symbol": ALL}
        limit = 1000

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

    cogs_margin = fields.FloatField("cogs_margin", use_in="detail")
    net_income_margin = fields.FloatField("net_income_margin", use_in="detail")
    gross_margin = fields.FloatField("gross_margin", use_in="detail")
    opex_margin = fields.FloatField("opex_margin", use_in="detail")
    ebit_margin = fields.FloatField("ebit_margin", use_in="detail")
    total_expense_margin = fields.FloatField(
        "total_expense_margin", use_in="detail"
    )
    operating_income_margin = fields.FloatField(
        "operating_income_margin", use_in="detail"
    )
    operating_expense_margin = fields.FloatField(
        "operating_expense_margin", use_in="detail"
    )

    class Meta:
        queryset = IncomeStatement.objects.all()
        resource_name = "incomes"
        ordering = ["on"]


class CashFlowResource(ModelResource):
    cash_change_pcnt = fields.FloatField(
        "cash_change_pcnt", null=True, use_in="detail"
    )
    operating_cash_flow_growth = fields.FloatField(
        "operating_cash_flow_growth", null=True, use_in="detail"
    )

    fcf_over_ocf = fields.FloatField("fcf_over_ocf", null=True, use_in="detail")
    fcf_over_net_income = fields.FloatField(
        "fcf_over_net_income", null=True, use_in="detail"
    )
    ocf_over_net_income = fields.FloatField(
        "ocf_over_net_income", null=True, use_in="detail"
    )
    dividend_payout_ratio = fields.FloatField(
        "dividend_payout_ratio", null=True, use_in="detail"
    )
    net_income_growth_rate = fields.FloatField(
        "net_income_growth_rate", null=True, use_in="detail"
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
    current_ratio = fields.FloatField(
        "current_ratio", null=True, use_in="detail"
    )
    quick_ratio = fields.FloatField("quick_ratio", null=True, use_in="detail")
    debt_to_equity_ratio = fields.FloatField(
        "debt_to_equity_ratio", use_in="detail"
    )
    capital_structure = fields.FloatField("capital_structure", use_in="detail")
    debt_growth_rate = fields.FloatField(
        "debt_growth_rate", null=True, use_in="detail"
    )
    ap_growth_rate = fields.FloatField(
        "ap_growth_rate", null=True, use_in="detail"
    )
    ar_growth_rate = fields.FloatField(
        "ar_growth_rate", null=True, use_in="detail"
    )
    all_cash_growth_rate = fields.FloatField(
        "all_cash_growth_rate", null=True, use_in="detail"
    )
    working_capital_growth_rate = fields.FloatField(
        "working_capital_growth_rate", null=True, use_in="detail"
    )
    net_ppe_growth_rate = fields.FloatField(
        "net_ppe_growth_rate", null=True, use_in="detail"
    )

    equity_multiplier = fields.FloatField(
        "equity_multiplier", null=True, use_in="detail"
    )
    total_liability = fields.FloatField(
        "total_liability", null=True, use_in="detail"
    )
    liability_pcnt = fields.FloatField(
        "liability_pcnt", null=True, use_in="detail"
    )
    working_capital_to_current_liabilities = fields.FloatField(
        "working_capital_to_current_liabilities", null=True, use_in="detail"
    )

    non_current_to_equity = fields.FloatField(
        "non_current_to_equity", null=True, use_in="detail"
    )

    class Meta:
        queryset = BalanceSheet.objects.all()
        resources_name = "balances"
        ordering = ["on"]


class StatSummary:
    def __init__(self, id=None, name=None, stats=None):
        self.id = id
        self.name = name
        self.stats = stats


class SummaryResource(Resource):
    id = fields.IntegerField("id")
    name = fields.CharField("name", null=True)
    stats = fields.ListField("stats")

    class Meta:
        object_class = StatSummary
        abstract = True

    def obj_get_list(self, request=None, **kwargs):
        # outer get of object list... this calls get_object_list and
        # could be a point at which additional filtering may be applied
        return self.get_object_list(request)

    # The following methods will need overriding regardless of your
    # data source.
    def detail_uri_kwargs(self, bundle_or_obj):
        kwargs = {}

        if isinstance(bundle_or_obj, Bundle):
            kwargs["pk"] = bundle_or_obj.obj.id
        else:
            kwargs["pk"] = bundle_or_obj.id

        return kwargs

    def _get_object_list_helper(self, objects, sort_by, high_to_low):
        """Helper to build a list.

        Args
        ----
          :param: objects, Queryset or ModelManager

          This represents the overall data set I'm going to work w/,
          eg. MyStock.objects.

          :param: sort_by, str

          Should be a model field name so we can sort the queryset by
          it.

          :param: high_to_low, bool

          True if we are to sort the values high to low. False will be
          low to high.

        Return
        ------
          list: [{}]

          Return value will be a list of the following dict:
          {
            "symbol": stock symbol,
            "on": the date when these values were originated,
            "val": the value
          }

        """

        # Hardcode to limit data set to be within the last 180 days.
        start = date.today() - timedelta(days=180)

        # Get the data based on time range and sort them.
        valid_entries = list(
            filter(
                lambda x: getattr(x, sort_by) and getattr(x, sort_by) != -100,
                objects.filter(on__gte=start),
            )
        )
        data_set = sorted(
            valid_entries,
            key=lambda x: getattr(x, sort_by),
            reverse=high_to_low,
        )

        # result
        vals = []

        # remember symbol I have counted because I only want to count
        # a symbol once.
        counted = []
        for x in data_set:
            symbol = x.stock.symbol
            if symbol in counted:
                continue
            vals.append(
                {
                    "symbol": symbol,
                    "on": x.on,
                    "val": getattr(x, sort_by),
                    "one_month_historicals": x.stock.one_month_historicals,
                }
            )

            # keep tracking which symbol I have counted
            counted.append(symbol)

        return vals

    def _get_ranks(self, objs, attrs):
        """
        Args
        ----

          :attrs: list[(id, attr, name)]

          - id: int, unique within this list, used as REST resource id.
          - attr: str, attribute name of the object.
          - name: str, name of the resource

        Return
        ------

          list[StatSummary]
        """
        ranks = []
        for (id, attr, high_to_low) in attrs:
            vals = self._get_object_list_helper(objs, attr, high_to_low)
            ranks.append(StatSummary(id, attr, vals))
        return ranks


class RankStockResource(SummaryResource):
    """Ranking by values of MyStock model."""

    class Meta:
        resource_name = "stock-ranks"

    def get_object_list(self, request):
        attrs = [
            ("roe", True),
            ("dupont_roe", True),
            ("roe_dupont_reported_gap", False),
        ]

        attrs = [
            (index, name, high_to_low)
            for index, (name, high_to_low) in enumerate(attrs)
        ]

        return [
            StatSummary(
                index, attr, MyStock.rank_manager.rank_by(attr, high_to_low)
            )
            for (index, attr, high_to_low) in attrs
        ]


class RankBalanceResource(SummaryResource):
    """Ranking by values of BalanceSheet model."""

    class Meta:
        resource_name = "balance-ranks"

    def get_object_list(self, request):
        attrs = [
            ("current_ratio", True),
            ("quick_ratio", True),
            ("debt_to_equity_ratio", False),
            ("equity_multiplier", False),
            ("liability_pcnt", False),
            ("debt_growth_rate", False),
            ("ap_growth_rate", False),
            ("ar_growth_rate", False),
            ("all_cash_growth_rate", True),
            ("working_capital_growth_rate", False),
            ("working_capital_to_current_liabilities", True),
            ("non_current_to_equity", True),
        ]
        attrs = [
            (index, name, high_to_low)
            for index, (name, high_to_low) in enumerate(attrs)
        ]
        return self._get_ranks(BalanceSheet.objects, attrs)


class RankCashFlowResource(SummaryResource):
    """Ranking by values of CashFlow model."""

    class Meta:
        resource_name = "cash-ranks"

    def get_object_list(self, request):
        attrs = [
            ("net_income_growth_rate", True),
            ("cash_change_pcnt", True),
            ("operating_cash_flow_growth", True),
            ("fcf_over_ocf", True),
            ("fcf_over_net_income", True),
            ("ocf_over_net_income", True),
            ("dividend_payout_ratio", True),
        ]
        attrs = [
            (index, name, high_to_low)
            for index, (name, high_to_low) in enumerate(attrs)
        ]
        return self._get_ranks(CashFlow.objects, attrs)


class RankIncomeResource(SummaryResource):
    """Ranking by values of IncomeStatement model."""

    class Meta:
        resource_name = "income-ranks"

    def get_object_list(self, request):
        attrs = [
            ("gross_margin", True),
            ("net_income_margin", True),
            ("cogs_margin", False),
            ("opex_margin", False),
            ("ebit_margin", True),
            ("total_expense_margin", False),
            ("operating_income_margin", True),
        ]

        attrs = [
            (index, name, high_to_low)
            for index, (name, high_to_low) in enumerate(attrs)
        ]
        return self._get_ranks(IncomeStatement.objects, attrs)
