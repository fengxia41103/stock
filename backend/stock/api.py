import logging
from datetime import date
from datetime import timedelta

from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.constants import ALL
from tastypie.resources import ALL_WITH_RELATIONS
from tastypie.resources import Bundle
from tastypie.resources import ModelResource
from tastypie.resources import Resource

from stock.models import BalanceSheet
from stock.models import CashFlow
from stock.models import IncomeStatement
from stock.models import MyDiary
from stock.models import MySector
from stock.models import MyStock
from stock.models import MyStockHistorical
from stock.models import ValuationRatio
from stock.tasks import batch_update_helper

logger = logging.getLogger("stock")


class SectorResource(ModelResource):
    name = fields.CharField("name")
    stocks = fields.ManyToManyField(
        "stock.api.StockResource", "stocks", null=True
    )
    stocks_detail = fields.ManyToManyField(
        "stock.api.StockResource",
        "stocks",
        null=True,
        full=True,
        readonly=True,
        use_in="detail",
    )
    stocks_property = fields.ListField(
        "stocks_property", null=True, readonly=True
    )

    class Meta:
        queryset = MySector.objects.all()
        resource_name = "sectors"
        filtering = {"name": ALL}
        authorization = Authorization()

    def obj_update(self, bundle, **kwargs):
        super().obj_update(bundle)

        sector = bundle.obj

        for stock in sector.stocks.all():
            # kick off updates
            batch_update_helper(sector.name, stock.symbol)


class StockResource(ModelResource):
    symbol = fields.CharField("symbol")
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
    last_reporting_date = fields.DateField("last_reporting_date", null=True)
    dcf_model = fields.ListField("dcf_model", null=True, use_in="detail")

    sectors = fields.ManyToManyField(
        "stock.api.SectorResource", "sectors", null=True
    )

    class Meta:
        queryset = MyStock.objects.all()
        resource_name = "stocks"
        filtering = {"symbol": ALL, "id": ALL}
        authorization = Authorization()
        limit = 0
        max_limit = 0

    def obj_update(self, bundle, **kwargs):
        stock = bundle.obj
        symbol = stock.symbol
        sectors = stock.sectors.all()
        if sectors:
            sector = sectors[0].name
        else:
            sector = "misc"

        # kick off updates
        batch_update_helper(sector, symbol)

    def obj_create(self, bundle, **kwargs):
        sector, created = MySector.objects.get_or_create(name="misc")
        stock, created = MyStock.objects.get_or_create(
            symbol=bundle.data["symbol"]
        )
        sector.stocks.add(stock)

        # kick off updates
        batch_update_helper(sector.name, stock.symbol)

        bundle.obj = stock
        return bundle


class HistoricalResource(ModelResource):
    stock = fields.ForeignKey(
        "stock.api.StockResource", "stock", use_in="detail"
    )
    symbol = fields.CharField("symbol", null=True)

    class Meta:
        resource_name = "historicals"
        queryset = MyStockHistorical.objects.all()
        filtering = {"on": ["range"], "stock": ALL}
        ordering = ["on"]
        limit = 0
        max_limit = 0

    def dehydrate_symbol(self, bundle):
        return bundle.obj.stock.symbol


class IncomeStatementResource(ModelResource):
    stock = fields.ForeignKey("stock.api.StockResource", "stock")
    symbol = fields.CharField("symbol", null=True)

    # reported
    close_price = fields.FloatField("close_price", null=True)

    # as of pcnt
    net_income_to_revenue = fields.FloatField("net_income_to_revenue")
    gross_profit_to_revenue = fields.FloatField("gross_profit_to_revenue")
    cogs_to_revenue = fields.FloatField("cogs_to_revenue")

    ebit_to_revenue = fields.FloatField("ebit_to_revenue")
    total_expense_to_revenue = fields.FloatField("total_expense_to_revenue")
    operating_income_to_revenue = fields.FloatField(
        "operating_income_to_revenue"
    )
    operating_expense_to_revenue = fields.FloatField(
        "operating_expense_to_revenue"
    )
    selling_ga_to_revenue = fields.FloatField("selling_ga_to_revenue")

    interest_income_to_revenue = fields.FloatField("interest_income_to_revenue")

    other_income_expense_to_revenue = fields.FloatField(
        "other_income_expense_to_revenue"
    )
    pretax_income_to_revenue = fields.FloatField("pretax_income_to_revenue")
    operating_profit = fields.FloatField("operating_profit")
    operating_profit_to_operating_income = fields.FloatField(
        "operating_profit_to_operating_income"
    )
    net_income_to_operating_income = fields.FloatField(
        "net_income_to_operating_income"
    )
    ebit_to_total_asset = fields.FloatField("ebit_to_total_asset")
    net_income_to_equity = fields.FloatField("net_income_to_equity")

    # growth rates
    net_income_growth_rate = fields.FloatField(
        "net_income_growth_rate", null=True
    )
    operating_income_growth_rate = fields.FloatField(
        "operating_income_growth_rate", null=True
    )

    # ratios
    cogs_to_inventory = fields.FloatField("cogs_to_inventory", null=True)
    interest_coverage_ratio = fields.FloatField(
        "interest_coverage_ratio", null=True
    )

    class Meta:
        queryset = IncomeStatement.objects.all()
        resource_name = "incomes"
        filtering = {"stock": ALL_WITH_RELATIONS}
        ordering = ["on"]
        limit = 0
        max_limit = 0

    def dehydrate_symbol(self, bundle):
        return bundle.obj.stock.symbol


class CashFlowResource(ModelResource):
    stock = fields.ForeignKey("stock.api.StockResource", "stock")
    symbol = fields.CharField("symbol", null=True)

    # reported
    close_price = fields.FloatField("close_price", null=True)

    # as of pcnt
    fcf_over_ocf = fields.FloatField("fcf_over_ocf", null=True)
    fcf_over_net_income = fields.FloatField("fcf_over_net_income", null=True)
    ocf_over_net_income = fields.FloatField("ocf_over_net_income", null=True)

    # growth rates
    cash_change_pcnt = fields.FloatField("cash_change_pcnt", null=True)
    operating_cash_flow_growth = fields.FloatField(
        "operating_cash_flow_growth", null=True
    )

    # ratio
    dividend_payout_ratio = fields.FloatField(
        "dividend_payout_ratio", null=True
    )

    class Meta:
        queryset = CashFlow.objects.all()
        resource_name = "cashes"
        filtering = {"stock": ALL_WITH_RELATIONS}
        ordering = ["on"]
        limit = 0
        max_limit = 0

    def dehydrate_symbol(self, bundle):
        return bundle.obj.stock.symbol


class BalanceSheetResource(ModelResource):
    stock = fields.ForeignKey("stock.api.StockResource", "stock")
    symbol = fields.CharField("symbol", null=True)

    # reported
    close_price = fields.FloatField("close_price", null=True)

    # ratio
    current_ratio = fields.FloatField("current_ratio", null=True)
    quick_ratio = fields.FloatField("quick_ratio", null=True)
    debt_to_equity_ratio = fields.FloatField("debt_to_equity_ratio", null=True)
    capital_structure = fields.FloatField("capital_structure", null=True)
    equity_multiplier = fields.FloatField("equity_multiplier", null=True)

    # as of pcnt
    liability_to_asset = fields.FloatField("liability_to_asset", null=True)
    current_asset_to_total_asset = fields.FloatField(
        "current_asset_to_total_asset", null=True
    )
    working_capital_to_current_liabilities = fields.FloatField(
        "working_capital_to_current_liabilities", null=True
    )
    non_current_to_equity = fields.FloatField(
        "non_current_to_equity", null=True
    )
    retained_earnings_to_equity = fields.FloatField(
        "retained_earnings_to_equity", null=True
    )
    inventory_to_current_asset = fields.FloatField(
        "inventory_to_current_asset", null=True
    )
    cash_cash_equivalents_and_short_term_investments_to_current_asset = (
        fields.FloatField(
            "cash_cash_equivalents_and_short_term_investments_to_current_asset",
            null=True,
        )
    )

    # growth rates
    equity_growth_rate = fields.FloatField("equity_growth_rate", null=True)
    debt_growth_rate = fields.FloatField("debt_growth_rate", null=True)
    ap_growth_rate = fields.FloatField("ap_growth_rate", null=True)
    ar_growth_rate = fields.FloatField("ar_growth_rate", null=True)
    all_cash_growth_rate = fields.FloatField("all_cash_growth_rate", null=True)
    working_capital_growth_rate = fields.FloatField(
        "working_capital_growth_rate", null=True
    )
    net_ppe_growth_rate = fields.FloatField("net_ppe_growth_rate", null=True)

    # computed values
    total_liability = fields.FloatField("total_liability", null=True)
    tangible_book_value_per_share = fields.FloatField(
        "tangible_book_value_per_share", null=True
    )
    cash_and_cash_equivalent_per_share = fields.FloatField(
        "cash_and_cash_equivalent_per_share", null=True
    )
    price_to_cash_premium = fields.FloatField(
        "price_to_cash_premium", null=True
    )

    class Meta:
        queryset = BalanceSheet.objects.all()
        resource_name = "balances"
        filtering = {"stock": ALL_WITH_RELATIONS}
        ordering = ["on"]
        limit = 0
        max_limit = 0

    def dehydrate_symbol(self, bundle):
        return bundle.obj.stock.symbol


class ValuationRatioResource(ModelResource):
    stock = fields.ForeignKey("stock.api.StockResource", "stock")
    symbol = fields.CharField("symbol", null=True)

    class Meta:
        queryset = ValuationRatio.objects.all()
        resource_name = "ratios"
        filtering = {"stock": ALL_WITH_RELATIONS}
        ordering = ["on"]
        limit = 0
        max_limit = 0

    def dehydrate_symbol(self, bundle):
        return bundle.obj.stock.symbol


class StatSummary:
    def __init__(self, id=None, name=None, stats=None):
        self.id = id
        self.name = name
        self.stats = stats


class RankingResource(Resource):
    id = fields.IntegerField("id")
    name = fields.CharField("name", null=True)
    stats = fields.ListField("stats")

    class Meta:
        object_class = StatSummary
        abstract = True
        filtering = {"stats": ALL, "symbol": ALL}
        limit = 0
        max_limit = 0

    def build_filters(self, filters=None, **kwargs):
        if filters is None:
            filters = {}

        orm_filters = filters

        if "stats__in" in filters:
            orm_filters["id__in"] = filters["stats__in"]
        if "symbol__in" in filters:
            orm_filters["symbol__in"] = filters["symbol__in"]

        return orm_filters

    def apply_filters(self, request, applicable_filters):
        """
        Apply the filters
        """
        obj_list = self.get_object_list(request)
        if "id__in" in applicable_filters:
            ids = list(map(int, applicable_filters["id__in"].split(",")))
            for o in obj_list:
                o.stats = list(filter(lambda x: x["id"] in ids, o.stats))

        if "symbol__in" in applicable_filters:
            symbols = [
                x.upper() for x in applicable_filters["symbol__in"].split(",")
            ]
            for o in obj_list:
                o.stats = list(
                    filter(lambda x: x["symbol"] in symbols, o.stats)
                )

        return obj_list

    def obj_get_list(self, bundle, **kwargs):
        # outer get of object list... this calls get_object_list and
        # could be a point at which additional filtering may be applied

        request = bundle.request
        if hasattr(request, "GET"):
            # Grab a mutable copy.
            filters = request.GET.copy()

        applicable_filters = self.build_filters(filters)
        return self.apply_filters(request, applicable_filters)
        # return self.get_object_list(request)

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
            "id": stock id,
            "symbol": stock symbol,
            "on": the date when these values were originated,
            "val": the value,
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
                    "id": x.stock.id,
                    "symbol": symbol,
                    "on": x.on,
                    "val": getattr(x, sort_by),
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


class RankStockResource(RankingResource):
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


class RankBalanceResource(RankingResource):
    """Ranking by values of BalanceSheet model."""

    class Meta:
        resource_name = "balance-ranks"

    def get_object_list(self, request):
        attrs = [
            # ratio
            ("current_ratio", True),
            ("quick_ratio", True),
            ("debt_to_equity_ratio", False),
            ("equity_multiplier", False),
            ("price_to_cash_premium", False),
            # growth rate
            ("equity_growth_rate", True),
            ("debt_growth_rate", False),
            ("ap_growth_rate", False),
            ("ar_growth_rate", False),
            ("all_cash_growth_rate", True),
            ("working_capital_growth_rate", False),
            # pcnt
            (
                "cash_cash_equivalents_and_short_term_investments_to_current_asset",
                True,
            ),
            ("liability_to_asset", False),
            ("non_current_to_equity", True),
            ("retained_earnings_to_equity", True),
            ("inventory_to_current_asset", False),
            ("working_capital_to_current_liabilities", True),
        ]
        attrs = [
            (index, name, high_to_low)
            for index, (name, high_to_low) in enumerate(attrs)
        ]
        return self._get_ranks(BalanceSheet.objects, attrs)


class RankCashFlowResource(RankingResource):
    """Ranking by values of CashFlow model."""

    class Meta:
        resource_name = "cash-ranks"

    def get_object_list(self, request):
        attrs = [
            # ratio
            ("dividend_payout_ratio", True),
            # growth
            ("operating_cash_flow_growth", True),
            # pcnt
            ("cash_change_pcnt", True),
            ("fcf_over_ocf", True),
            ("fcf_over_net_income", True),
            ("ocf_over_net_income", True),
        ]
        attrs = [
            (index, name, high_to_low)
            for index, (name, high_to_low) in enumerate(attrs)
        ]
        return self._get_ranks(CashFlow.objects, attrs)


class RankIncomeResource(RankingResource):
    """Ranking by values of IncomeStatement model."""

    class Meta:
        resource_name = "income-ranks"

    def get_object_list(self, request):
        attrs = [
            # growth rate
            ("net_income_growth_rate", True),
            ("operating_income_growth_rate", True),
            # pcnt
            ("gross_profit_to_revenue", True),
            ("net_income_to_revenue", True),
            ("operating_profit_to_operating_income", True),
            ("net_income_to_operating_income", True),
            ("pretax_income_to_revenue", True),
            ("cogs_to_revenue", False),
            ("ebit_to_revenue", True),
            ("total_expense_to_revenue", False),
            ("operating_income_to_revenue", True),
            ("operating_expense_to_revenue", False),
            ("selling_ga_to_revenue", False),
            ("interest_income_to_revenue", False),
            ("other_income_expense_to_revenue", False),
            ("ebit_to_total_asset", True),
            ("net_income_to_equity", True),
            # ratio
            ("cogs_to_inventory", True),
            ("interest_coverage_ratio", True),
        ]

        attrs = [
            (index, name, high_to_low)
            for index, (name, high_to_low) in enumerate(attrs)
        ]
        return self._get_ranks(IncomeStatement.objects, attrs)


class DiaryResource(ModelResource):

    created = fields.DateTimeField("created", readonly=True)
    stock = fields.ForeignKey("stock.api.StockResource", "stock", null=True)
    price = fields.FloatField("price", null=True, readonly=True)
    is_correct = fields.BooleanField("is_correct", null=True, readonly=True)

    class Meta:
        queryset = MyDiary.objects.all().order_by("-created")
        resource_name = "diaries"
        authorization = Authorization()

        filtering = {
            "stock": ALL,
            "last_updated": ["range"],
            "content": ["contains"],
        }
        limit = 0
        max_limit = 0
