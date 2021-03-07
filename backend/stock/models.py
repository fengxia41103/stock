# -*- coding: utf-8 -*-


import collections
import logging
from abc import ABC
from datetime import date
from datetime import timedelta

from django.apps import AppConfig
from django.apps import apps
from django.db import models
from django.db.models import Avg
from numpy import average
from numpy import prod
from numpy import std

logger = logging.getLogger("stock")
logger.setLevel(logging.DEBUG)


class MySector(models.Model):
    """Sector that is used to group stocks.

    The company that a stock represents is usually linked to a
    sector. Each country may have a different way to define these.

    """

    name = models.CharField(max_length=32, null=True, blank=True)
    code = models.CharField(max_length=8, verbose_name="Sector code")
    description = models.TextField(null=True, blank=True)
    stocks = models.ManyToManyField("MyStock")

    def __str__(self):
        if self.name:
            return u"{0} ({1})".format(self.name, self.code)
        else:
            return self.code


class MyStockRankManager(models.Manager):
    def rank_by(self, attr, high_to_low):
        vals = []

        for s in MyStock.objects.all():
            vals.append(
                {
                    "symbol": s.symbol,
                    "val": getattr(s, attr),
                    "one_month_historicals": s.one_month_historicals,
                }
            )

        # eliminate 0 and -100, which are _invalid_ or _unknown_
        # internally becase some data anomalies.
        valid_entries = list(
            filter(lambda x: x["val"] and x["val"] != -100, vals)
        )

        # sort is low->high by default, high-to-low will be a reverse.
        data_set = sorted(
            valid_entries, key=lambda x: x["val"], reverse=high_to_low
        )

        return data_set


class MyStock(models.Model):
    objects = models.Manager()
    rank_manager = MyStockRankManager()

    symbol = models.CharField(max_length=8)
    beta = models.FloatField(null=True, default=5)
    roa = models.FloatField(
        null=True, default=0, verbose_name="Return on Assets"
    )
    roe = models.FloatField(
        null=True, default=0, verbose_name="Return on Equity"
    )
    top_ten_institution_ownership = models.FloatField(null=True, default=-1)
    profit_margin = models.FloatField(null=True, default=0)
    shares_outstanding = models.FloatField(null=True, default=0)

    class Meta:
        base_manager_name = "rank_manager"

    def __str__(self):
        return self.symbol

    @property
    def tax_rate(self):
        return IncomeStatement.objects.all().aggregate(Avg("tax_rate"))[
            "tax_rate__avg"
        ]

    @property
    def latest_close_price(self):
        """The latest close price.

        We can use this to compare to our DCF evaluation so to measure
        a premium.

        """
        return (
            MyStockHistorical.objects.filter(stock=self)
            .order_by("-on")[0]
            .close_price
        )

    @property
    def dupont_roe(self):
        """ROE by Dupont model.

        This is to compute ROE using Dupont model, but use the avg
        aseet and avg equity.

        This can be a problem when the company's asset or equity had
        large changes. I don't understand yet what that kind of
        changes mean, good or bad?

        Also, large change was seen a 2017 figure was 62B, then
        following three ones were 30s. This makes me wonder that
        either they changed accounting, or acquired/sold some
        division. Either way, such large delta will skew the avg. So
        one way is to limit the numbers to some more recent ones,
        assuming that dramatic changes didn't happen recently.

        """

        # hmm... so some symbol has no balance sheet info
        if not self.balances.all():
            return 0

        avgs = self.balances.all().aggregate(
            Avg("total_assets"), Avg("stockholders_equity")
        )

        # leverage is avg asset / avg equity
        equity_multiplier = (
            avgs["total_assets__avg"] / avgs["stockholders_equity__avg"]
        )

        # turn over is latest revenue / avg asset
        last_reporting_date = self.balances.order_by("-on")[0].on
        last_income = self.incomes.get(on=last_reporting_date)
        turnover = last_income.total_revenue / avgs["total_assets__avg"]

        return last_income.net_income_margin * turnover * equity_multiplier

    @property
    def roe_dupont_reported_gap(self):
        """My Dupont ROE vs. reported.

        This comparison serves multiple purposes:

        - how accurate the balance/income data I'm getting since ROE
          is an aggregation of them. If mine is quite different from
          actual, my number will be quite off, which will then make
          all other analysis suspicious.
        - is there sth I don't know? Reported number represents some
          external work which may be reflecting info I don't
          know. Therefore, if there is a big gap, I need to raise a
          flag that my analysis of this stock is unlikely reliable.

        Return
        ------
          % : how far off the dupont one vs. reported. The higher, the
            more diff. If it's < 0, I'm being too optmistic (you
            should be more conservative).
        """
        if self.roe:
            return (self.roe - self.dupont_roe) / self.roe * 100
        else:
            return 0

    @property
    def dupont_model(self):
        """Build DuPont ROE model.

        We are assuming the reporting dates are consistent among:
        - balance sheet
        - income statement

        So that we could extract the three factors needed in the
        DuPont model.

        Note that this is to compute ROE of each reporting period, not
        the _official_ ROE which uses avg(asset) and avg(equity).

        """
        vals = []
        for b in self.balances.all():
            leverage = b.equity_multiplier

            i = self.incomes.get(on=b.on)
            net_profit_margin = i.net_income_margin

            turnover = i.total_revenue / b.total_assets
            roe = net_profit_margin * turnover * leverage

            vals.append(
                {
                    "on": b.on,
                    "net_profit_margin": net_profit_margin,
                    "asset_turnover": turnover * 100,
                    "equity_multiplier": leverage,
                    "roe": roe,
                    # reported data
                    "revenue": i.total_revenue,
                    "assets": b.total_assets,
                    "debts": b.total_debt,
                    "equity": b.stockholders_equity,
                }
            )

        return vals

    @property
    def nav_model(self):
        """Net Asset model.

        This is pretty stragithforward:

        (total asset - total liabilities)/shares
        """

        vals = []
        for b in self.balances.order_by("on"):
            vals.append(
                {
                    "on": b.on,
                    "nav": (b.total_assets - b.total_liability)
                    / self.shares_outstanding,
                }
            )
        return vals

    @property
    def one_month_historicals(self):
        end = date.today()
        start = end - timedelta(days=30)

        # get historicals
        hist = list(
            MyStockHistorical.objects.by_date_range(start, end)
            .filter(stock=self)
            .values("on", "close_price")
            .order_by("on")
        )

        return hist

    @property
    def last_reporting_date(self):
        tmp = IncomeStatement.objects.filter(stock=self).order_by("-on")
        if tmp:
            # Symbol such as ETF does not have balance sheet
            return tmp[0].on
        else:
            return None


class MyHistoricalCustomManager(models.Manager):
    def by_date_range(self, start=None, end=None):
        """Filter by a date range."""
        if not end:
            end = date.today()
        if not start:
            start = end - timedelta(weeks=1)

        return MyStockHistorical.objects.filter(
            on__gte=start, on__lte=end
        ).order_by("on")


class MyStockHistorical(models.Model):
    """Historical stock data."""

    objects = MyHistoricalCustomManager()

    stock = models.ForeignKey(
        "MyStock", on_delete=models.CASCADE, related_name="historicals"
    )
    on = models.DateField(verbose_name=u"Date")
    open_price = models.FloatField()
    high_price = models.FloatField()
    low_price = models.FloatField()
    close_price = models.FloatField()
    adj_close = models.FloatField()
    vol = models.FloatField(verbose_name=u"Volume (000)")

    class Meta:
        unique_together = ("stock", "on")
        index_together = ["stock", "on"]


class MyStrategyValueCustomManager(models.Manager):
    def stats(self, historicals):
        """Compute stats over a range of historicals.

        Args
        ----
          :ids: list[MyStockHistorical]

        range return
        ------------
        Assume you buy at the beginning and hold till the end, how
        will you fare off.

        std
        ---
        How volatile it has been. Use the close price.

        night day consistency
        ---------------------
        Count occurances of consistency values. This gives me an idea
        how likely a consistency scenario occured. This is essentially
        a probability.

        two day trend
        -------------
        Count occurance of two day trend values, whether I got two day
        in a row of the same direction or a flip. This is a
        probability indicator.

        avg up return
        -------------
        What's the avg daily return % that was > 0? This tell me how
        much up side there is.

        avg down return
        ---------------
        Similarly, the avg down return shows me the down side.
        """
        indexes = self.filter(hist__in=historicals)

        # ok, we need some Python power to compute these stats
        open_prices = list(historicals.values_list("open_price", flat=True))
        close_prices = list(historicals.values_list("close_price", flat=True))
        vols = list(historicals.values_list("vol", flat=True))

        # eg. AMD 1982-07-29 had 0 open price. This is happening quite
        # a bit on data that are _too_ old to be useful for me. But
        # since I'm keeping these data, I have to handle them.
        try:
            range_return = close_prices[-1] / open_prices[0] * 100
        except ZeroDivisionError:
            range_return = 0

        # nightly trends
        nightly_return = indexes.filter(method=3)
        nightly_ups = nightly_return.filter(val__gt=0).values_list(
            "val", flat=True
        )
        nightly_downs = nightly_return.filter(val__lt=0).values_list(
            "val", flat=True
        )
        if nightly_return.count():
            nightly_up_pcnt = nightly_ups.count() / nightly_return.count() * 100
            nightly_down_pcnt = (
                nightly_downs.count() / nightly_return.count() * 100
            )
        else:
            nightly_up_pcnt = nightly_down_pcnt = 0

        tmp = collections.Counter(nightly_return.values_list("val", flat=True))
        night_day_consistency = dict(
            [(int(key), val) for (key, val) in tmp.items()]
        )

        # daily trends
        daily_return = indexes.filter(method=1)
        daily_ups = daily_return.filter(val__gt=0).values_list("val", flat=True)
        daily_downs = daily_return.filter(val__lt=0).values_list(
            "val", flat=True
        )
        if daily_return.count():
            daily_up_pcnt = daily_ups.count() / daily_return.count() * 100
            daily_down_pcnt = daily_downs.count() / daily_return.count() * 100
        else:
            daily_up_pcnt = daily_down_pcnt = 0

        # if I trade daily, what's the return?
        compound_return = (
            prod(list(map(lambda x: 1 + x.val / 100, daily_return))) * 100
        )

        # pre-computed trends, eg. two-day up/down/flip
        tmp = collections.Counter(
            indexes.filter(method=4).values_list("val", flat=True)
        )
        two_day_trend = dict([(int(key), val) for (key, val) in tmp.items()])

        # night-day flipt vs. their compounded return
        night_day_flips = indexes.filter(method=3, val=0).values_list(
            "hist", flat=True
        )
        positive_compounds = indexes.filter(
            method=5, val__gt=0, hist__in=night_day_flips
        ).count()
        if night_day_flips.count():
            flip_positive_pcnt = (
                positive_compounds / night_day_flips.count() * 100
            )
        else:
            flip_positive_pcnt = 0

        negative_compounds = indexes.filter(
            method=5, val__lt=0, hist__in=night_day_flips
        ).count()
        if night_day_flips.count():
            flip_negative_pcnt = (
                negative_compounds / night_day_flips.count() * 100
            )
        else:
            flip_negative_pcnt = 0

        return {
            "days": historicals.count(),
            "return": "%.2f" % range_return,
            "close price rsd": "%.2f"
            % (std(close_prices) / average(close_prices) * 100),
            "two_day_trend": two_day_trend,
            "overnight": night_day_consistency,
            "daily_ups": "%.0f" % daily_up_pcnt,
            "daily_downs": "%.0f" % daily_down_pcnt,
            "nightly_ups": "%.0f" % nightly_up_pcnt,
            "nightly_downs": "%.0f" % nightly_down_pcnt,
            "avg daily up": "%.2f" % average(daily_ups),
            "daily up rsd": "%.2f"
            % (std(daily_ups) / average(daily_ups) * 100),
            "avg daily down": "%.2f" % average(daily_downs),
            "daily down rsd": "%.2f"
            % (std(daily_downs) / abs(average(daily_downs)) * 100),
            "compounded return": "%.2f" % compound_return,
            "vols": vols,
            "night day flips": night_day_flips.count(),
            "night day flip positive": flip_positive_pcnt,
            "night day flip negative": flip_negative_pcnt,
        }


class MyStrategyValue(models.Model):
    """Derived values of a stock.

    These are computed from historical values.

    1. daily return: how much it grew in one day? Val is %.
    2. overnight return: how much it grew from last night to today's
       openning? Value is %.
    3. night day consistency: daily trend is the same as overnight,
       either both > 0 or both < 0.
    4. trend: two day daily trend, yesterday's -> today's, how many
       upup,downdown, or a flip?
    5. night-day compound: compounded return from last night to end of
       today. This is especially useful if I saw a lot of flip, eg. up
       last night, but down today. Then what? Can overnight's up
       compensate this down?
    """

    METHOD_CHOICES = (
        (1, "daily return"),
        (2, "overnight return"),
        (3, "night day consistency"),
        (4, "two daily trend"),
        (5, "night day compounded return"),
    )
    objects = MyStrategyValueCustomManager()
    hist = models.ForeignKey(
        "MyStockHistorical", on_delete=models.CASCADE, related_name="indexes"
    )
    method = models.IntegerField(choices=METHOD_CHOICES, default=1)
    val = models.FloatField(null=True, blank=True, default=-1)


class StatementBase(models.Model):
    class Meta:
        abstract = True

    def _as_of_ratio(self, attr1, attr2):
        """Attr1/ attr2.

        This is a measure of scale, thus am converting all values
        using `abs()`.

        """

        tmp = getattr(self, attr2)

        if not tmp:
            # if 0 or none
            return 0
        else:
            return abs(getattr(self, attr1) / tmp)

    def _as_of_pcnt(self, attr1, attr2):
        """Attr1 as % of attr2."""
        return self._as_of_ratio(attr1, attr2) * 100

    def _prevs(self, model_name, app_name="stock"):
        """Get available model records.

        TODO: hardcoded application name. This is necessary to look up
        Django model by its string name.

        Once we obtain the model, we have access to `.objects` and
        then all its queryset power. Of course, we are assuming it has
        attribute `self.stock` and `self.on`, both are not defined in
        this class, but in those statement models.

        """
        the_model = apps.get_model(app_name, model_name)
        return the_model.objects.filter(
            stock=self.stock, on__lt=self.on
        ).order_by("on")

    def _growth_rate(self, model_name, attr):
        """Compute growth of an attr from one period to the next."""

        # look up previous records of asked attr's value
        prevs = self._prevs(model_name).values(attr)

        # filter out 0s. 0 means that I don't have a valid value here to use.
        valids = list(filter(lambda x: x[attr], prevs))

        if not valids:
            return 0
        else:
            me = getattr(self, attr)
            prev = valids[0][attr]

            if not prev:
                # if prev == 0
                return 0
            else:
                return (me - prev) / prev * 100


class IncomeStatement(StatementBase):
    stock = models.ForeignKey(
        "MyStock", on_delete=models.CASCADE, related_name="incomes"
    )
    on = models.DateField(null=True, blank=True)

    # == operating_revenume
    total_revenue = models.FloatField(
        null=True, blank=True, default=0, verbose_name="Sales"
    )
    operating_revenue = models.FloatField(null=True, blank=True, default=0)
    cost_of_revenue = models.FloatField(null=True, blank=True, default=0)

    # = total_revenue-cost_of_revenue
    gross_profit = models.FloatField(null=True, blank=True, default=0)

    # Operating expense
    # 1. selling_general_and_administration
    # 2. research_and_development
    #
    # Eq.
    # - operating_expense = sum(1,2)
    operating_expense = models.FloatField(null=True, blank=True, default=0)
    research_and_development = models.FloatField(
        null=True, blank=True, default=0
    )

    # SellingGeneralAndAdministration
    # 1. general_and_administrative_expense
    # 2. selling_and_marketing_expense
    #
    # Eq.
    # - selling_general_and_administration = sum(1,2)
    selling_general_and_administration = models.FloatField(
        null=True, blank=True, default=0
    )
    general_and_administrative_expense = models.FloatField(
        null=True, blank=True, default=0
    )
    selling_and_marketing_expense = models.FloatField(
        null=True, blank=True, default=0
    )

    # operating_income = gross_profit - operating_expense
    operating_income = models.FloatField(null=True, blank=True, default=0)

    # NetNonOperatingInterestIncomeExpense
    # 1. interest income non operating
    # 2. interest expense non operating
    #
    # Eq.
    # - net = 1-2. However, the numbers don't add up. So use them individually!
    net_non_operating_interest_income_expense = models.FloatField(
        null=True, blank=True, default=0
    )
    interest_income_non_operating = models.FloatField(
        null=True, blank=True, default=0
    )
    interest_expense_non_operating = models.FloatField(
        null=True, blank=True, default=0
    )

    # Other income expenses
    # 1. gain on sale of security: N/A!
    # 2. special income charges: N/A!
    # 3. other non operating income expenses
    #
    # Eq.
    # other income expenses = sum(1,2,3)
    other_income_expense = models.FloatField(null=True, blank=True, default=0)
    other_non_operating_income_expenses = models.FloatField(
        null=True, blank=True, default=0
    )

    # pretax_income=operating_income+net_non_operating_interest_income_expense+other_income_expense
    pretax_income = models.FloatField(null=True, blank=True, default=0)

    tax_provision = models.FloatField(null=True, blank=True, default=0)

    # = pretax_income-tax_provision
    net_income_common_stockholders = models.FloatField(
        null=True, blank=True, default=0
    )

    # Some summaries
    # == operating_income
    total_operating_income_as_reported = models.FloatField(
        null=True, blank=True, default=0
    )
    total_expenses = models.FloatField(null=True, blank=True, default=0)

    net_income_from_continuing_and_discontinued_operation = models.FloatField(
        null=True, blank=True, default=0
    )
    normalized_income = models.FloatField(null=True, blank=True, default=0)
    interest_income = models.FloatField(null=True, blank=True, default=0)
    interest_expense = models.FloatField(null=True, blank=True, default=0)
    net_interest_income = models.FloatField(null=True, blank=True, default=0)

    ebit = models.FloatField(null=True, blank=True, default=0)

    # could be null!
    ebitda = models.FloatField(null=True, blank=True, default=0)

    # = cost_of_revenue
    reconciled_cost_of_revenue = models.FloatField(
        null=True, blank=True, default=0, verbose_name="COGS"
    )

    reconciled_depreciation = models.FloatField(
        null=True, blank=True, default=0
    )

    net_income_from_continuing_operation_net_minority_interest = (
        models.FloatField(null=True, blank=True, default=0)
    )

    net_income = models.FloatField(null=True, blank=True, default=0)
    normalized_ebitda = models.FloatField(null=True, blank=True, default=0)
    basic_eps = models.FloatField(null=True, blank=True, default=0)
    tax_rate = models.FloatField(null=True, blank=True, default=0)

    @property
    def net_income_margin(self):
        """Als knowns as net profit margin.

        The net profit margin is the after-tax profit a company
        generated for each dollar of revenue.

        """
        return self._as_of_pcnt("net_income", "total_revenue")

    @property
    def gross_margin(self):
        return self._as_of_pcnt("gross_profit", "total_revenue")

    @property
    def cogs_margin(self):
        """How much cost to make a sale.

        The higher, the worse. If it's 0, there is 0 cost for the
        money you just made!

        """
        return self._as_of_pcnt("reconciled_cost_of_revenue", "total_revenue")

    @property
    def opex_margin(self):
        """OPEX is expense. Lower is better."""
        return self._as_of_pcnt("operating_expense", "total_revenue")

    @property
    def ebit_margin(self):
        """EBIT is an income indicator. Higher is better."""
        return self._as_of_pcnt("ebit", "total_revenue")

    @property
    def total_expense_margin(self):
        """How much expense to achieve the sales. Lower is better."""
        return self._as_of_pcnt("total_expenses", "total_revenue")

    @property
    def operating_income_margin(self):
        """How much sales became operating income. Higher is better.

        We are using operating_revenue if possible because this is to
        measure its operating efficiency.

        """
        if self.operating_revenue:
            return self._as_of_pcnt("operating_income", "operating_revenue")
        else:
            return self._as_of_pcnt("operating_income", "total_revenue")

    @property
    def operating_expense_margin(self):
        """How much expense in operation. The lower, the better."""
        if self.operating_revenue:
            return self._as_of_pcnt("operating_expense", "operating_revenue")
        else:
            return self._as_of_pcnt("operating_expense", "total_revenue")


class CashFlow(StatementBase):
    stock = models.ForeignKey(
        "MyStock", on_delete=models.CASCADE, related_name="cashes"
    )
    on = models.DateField(null=True, blank=True)

    beginning_cash = models.FloatField(null=True, blank=True, default=0)
    ending_cash = models.FloatField(null=True, blank=True, default=0)
    free_cash_flow = models.FloatField(null=True, blank=True, default=0)
    net_income = models.FloatField(null=True, blank=True, default=0)
    da = models.FloatField(
        null=True,
        blank=True,
        default=0,
        verbose_name="Depreciation and Amortization",
    )

    # inflow
    operating_cash_flow = models.FloatField(null=True, blank=True, default=0)
    from_continuing_financing_activity = models.FloatField(
        null=True, blank=True, default=0
    )
    sale_of_investment = models.FloatField(null=True, blank=True, default=0)

    # outflow
    investing_cash_flow = models.FloatField(null=True, blank=True, default=0)
    capex = models.FloatField(null=True, blank=True, default=0)
    dividend_paid = models.FloatField(null=True, blank=True, default=0)
    common_stock_issuance = models.FloatField(null=True, blank=True, default=0)
    purchase_of_business = models.FloatField(null=True, blank=True, default=0)
    purchase_of_investment = models.FloatField(null=True, blank=True, default=0)
    repayment_of_debt = models.FloatField(null=True, blank=True, default=0)
    repurchase_of_capital_stock = models.FloatField(
        null=True, blank=True, default=0
    )
    stock_based_compensation = models.FloatField(
        null=True, blank=True, default=0
    )

    # changes
    change_in_inventory = models.FloatField(null=True, blank=True, default=0)
    change_in_account_payable = models.FloatField(
        null=True, blank=True, default=0
    )
    change_in_working_capital = models.FloatField(
        null=True, blank=True, default=0
    )
    change_in_account_receivable = models.FloatField(
        null=True, blank=True, default=0
    )

    net_other_financing_charges = models.FloatField(
        null=True, blank=True, default=0
    )
    net_other_investing_changes = models.FloatField(
        null=True, blank=True, default=0
    )
    change_in_cash_supplemental_as_reported = models.FloatField(
        null=True, blank=True, default=0
    )

    @property
    def cash_change_pcnt(self):
        # could be division zero
        try:
            return (
                (self.ending_cash - self.beginning_cash)
                / self.beginning_cash
                * 100
            )
        except ZeroDivisionError:
            return 0

    @property
    def operating_cash_flow_growth(self):
        return self._growth_rate("CashFlow", "operating_cash_flow")

    @property
    def fcf_over_ocf(self):
        """FCF vs. operating cash flow.

        How much of operating cash flow became FCF in the end.  The
        higher, the better, meaning I don't have much to pay the $ I
        earned.

        """

        # if you get negative cash flow, no point then since
        # you shouldn't even count FCF.
        if self.operating_cash_flow < 0:
            return 0

        return self._as_of_pcnt("free_cash_flow", "operating_cash_flow")

    @property
    def fcf_over_net_income(self):
        """FCF vs. net income.

        How much of net income are in form of cash.
        """

        # if you have negative income, well.
        if self.net_income < 0:
            return 0
        return self._as_of_pcnt("free_cash_flow", "net_income")

    @property
    def ocf_over_net_income(self):
        """Operating cash flow vs. net income.

        How much operating cash flow became net income. This is a
        ratio, the higher the better.

        """

        if self.net_income < 0:
            return 0
        return self._as_of_pcnt("operating_cash_flow", "net_income")

    @property
    def dividend_payout_ratio(self):
        """Dividend paid / net income"""
        if self.net_income < 0:
            return 0
        return self._as_of_pcnt("dividend_paid", "net_income")


class ValuationRatio(models.Model):
    """Pre-computed valuation ratios.

    Save me the work to compute them from raw data.
    """

    stock = models.ForeignKey(
        "MyStock", on_delete=models.CASCADE, related_name="ratios"
    )
    on = models.DateField(null=True, blank=True)

    forward_pe = models.FloatField(null=True, blank=True, default=0)
    pe = models.FloatField(null=True, blank=True, default=0)
    pb = models.FloatField(null=True, blank=True, default=0)
    peg = models.FloatField(null=True, blank=True, default=0)
    ps = models.FloatField(null=True, blank=True, default=0)


class BalanceSheet(StatementBase):
    stock = models.ForeignKey(
        "MyStock", on_delete=models.CASCADE, related_name="balances"
    )
    on = models.DateField(null=True, blank=True)

    # Total assets
    # 1. current_assets
    # 2. total_non_current_assets
    #
    # Eq.
    # - total_assets = sum(1,2)
    total_assets = models.FloatField(null=True, blank=True, default=0)

    # Current Assets
    #
    # Eq.  current assets =
    # sum(cash_cash_equivalents_and_short_term_investments,
    # receivables, inventory, other_current_assets)
    current_assets = models.FloatField(null=True, blank=True, default=0)

    # Cash related
    #
    # 1. cash & cash equivalents & short-term investment
    # 2. cash_and_cash_equivalent
    # 3. other_short_term_investments
    # 4. cash_equivalents
    #
    # Eq.
    # - 1 = 2+3, 4 not used
    cash_cash_equivalents_and_short_term_investments = models.FloatField(
        null=True, blank=True, default=0
    )
    cash_and_cash_equivalent = models.FloatField(
        null=True, blank=True, default=0
    )
    other_short_term_investments = models.FloatField(
        null=True, blank=True, default=0
    )
    cash_equivalents = models.FloatField(null=True, blank=True, default=0)

    # Receivables
    # 1. receivables
    # 2. ar
    # 3. other receivables
    #
    # Eq.
    # - 1=2=3+4
    receivables = models.FloatField(null=True, blank=True, default=0)

    # Account receivalbes
    # 1. gross_accounts_receivable
    # 2. allowance_for_doubtful_accounts_receivable: it's < 0
    ar = models.FloatField(
        null=True, blank=True, default=0, verbose_name="Account Receivable"
    )
    gross_accounts_receivable = models.FloatField(
        null=True, blank=True, default=0
    )
    allowance_for_doubtful_accounts_receivable = models.FloatField(
        null=True, blank=True, default=0
    )

    other_receivables = models.FloatField(null=True, blank=True, default=0)

    # Inventory
    # TODO: Unfortunately I don't have source for breakdowns:
    # - raw materials
    # - work in process
    # - finished goods
    #
    # Eq.
    # - inventory = sum(those three)
    inventory = models.FloatField(null=True, blank=True, default=0)

    other_current_assets = models.FloatField(null=True, blank=True, default=0)

    # Fixed assets
    #
    # Eq. fixed assets = sum(net_ppe, goodwill,
    # investments_and_advances, other_non_current_assets)
    total_non_current_assets = models.FloatField(
        null=True, blank=True, default=0, verbose_name="Fixed Assets"
    )

    # Net PPE
    # 1. gross_ppe
    # 2. accmulated depreciation: is negative
    #
    # Eq.
    # - net_ppe = gross_ppe+accumulated_depreciation
    net_ppe = models.FloatField(null=True, blank=True, default=0)

    # Gross PPE
    # 1. properties
    # 2. land_and_improvements
    # 3. buildings and improvements: N/A!
    # 4. machinery_furniture_equipment
    # 5. other properties: N/A!
    # 6. leases
    #
    # Eq.
    # - gross_ppe = sum(1,2,3,4,5,6)
    gross_ppe = models.FloatField(null=True, blank=True, default=0)
    properties = models.FloatField(null=True, blank=True, default=0)
    land_and_improvements = models.FloatField(null=True, blank=True, default=0)
    machinery_furniture_equipment = models.FloatField(
        null=True, blank=True, default=0
    )
    leases = models.FloatField(null=True, blank=True, default=0)

    accumulated_depreciation = models.FloatField(
        null=True, blank=True, default=0
    )

    # Goodwill
    # 1. goodwill & other intangible
    # 2. goodwill
    # 3. other intangible assets
    #
    # Eq.
    # - 1=2+3
    goodwill_and_other_intangible_assets = models.FloatField(
        null=True, blank=True, default=0
    )
    goodwill = models.FloatField(null=True, blank=True, default=0)
    other_intangible_assets = models.FloatField(
        null=True, blank=True, default=0
    )

    # investments_and_advances, Long-term investment
    # 1. available_for_sale_securities
    # 2. investmentin_financial_assets
    #
    # Eq.
    # - investments_and_advances=1=2
    investments_and_advances = models.FloatField(
        null=True, blank=True, default=0
    )
    investmentin_financial_assets = models.FloatField(
        null=True, blank=True, default=0
    )
    available_for_sale_securities = models.FloatField(
        null=True, blank=True, default=0
    )

    other_non_current_assets = models.FloatField(
        null=True, blank=True, default=0
    )

    # Current liabilities
    # 1. payables_and_accrued_expenses
    # 2. Pension & Other Post Retirement Benefit Plans Current: N/A!
    # 3. current debt & capital lease obligation
    # 4. current_deferred_liabilities
    # 5. other_current_liabilities
    #
    # Eq.
    # current_liabilities = sum(1,2,3,4,5)
    current_liabilities = models.FloatField(null=True, blank=True, default=0)
    current_deferred_liabilities = models.FloatField(
        null=True, blank=True, default=0
    )
    other_current_liabilities = models.FloatField(
        null=True, blank=True, default=0
    )

    # current_debt_and_capital_lease_obligation
    # 1. current_debt
    #
    # Eq. == current_debt
    current_debt_and_capital_lease_obligation = models.FloatField(
        null=True, blank=True, default=0
    )

    # current_debt
    # 1. commercial_paper
    # 2. other_current_borrowings
    #
    # Eq.
    # - current_debt = sum(1,2)
    current_debt = models.FloatField(null=True, blank=True, default=0)
    commercial_paper = models.FloatField(null=True, blank=True, default=0)
    other_current_borrowings = models.FloatField(
        null=True, blank=True, default=0
    )

    # PayablesAndAccruedExpenses
    # 1. payables
    #
    # Eq.
    # - payables_and_accrued_expenses = payables
    payables_and_accrued_expenses = models.FloatField(
        null=True, blank=True, default=0
    )

    # Payables
    # 1. AP
    # 2. total tax payable
    # 3. other payables: N/A!
    #
    # Eq.
    # - payables = sum(1,2,3)
    payables = models.FloatField(null=True, blank=True, default=0)
    ap = models.FloatField(
        null=True, blank=True, default=0, verbose_name="Account Payable"
    )
    # aka. Income tax payable
    total_tax_payable = models.FloatField(null=True, blank=True, default=0)

    # == current deferred liability
    current_deferred_revenue = models.FloatField(
        null=True, blank=True, default=0
    )

    other_current_liabilities = models.FloatField(
        null=True, blank=True, default=0
    )

    # Total non current liabilities
    # 1. long_term_debt_and_capital_lease_obligation
    # 2. non current deffered liabilities
    # 3. tradeand_other_payables_non_current
    # 4. other_non_current_liabilities
    #
    # Eq.
    # - total non current liabilities = sum(1,2,3,4)
    total_non_current_liabilities_net_minority_interest = models.FloatField(
        null=True, blank=True, default=0
    )
    tradeand_other_payables_non_current = models.FloatField(
        null=True, blank=True, default=0
    )
    other_non_current_liabilities = models.FloatField(
        null=True, blank=True, default=0
    )

    # long_term_debt_and_capital_lease_obligation
    # 1. long_term_debt
    # 2. long term leas: N/A!
    #
    # Eq.
    # - long_term_debt_and_capital_lease_obligation = sum(1,2)
    long_term_debt_and_capital_lease_obligation = models.FloatField(
        null=True, blank=True, default=0
    )
    long_term_debt = models.FloatField(null=True, blank=True, default=0)

    # non_current_deferred_liabilities
    # 1. non_current_deferred_taxes_liabilities
    # 2. non_current_deferred_revenue
    #
    # Eq.
    # - non_current_deferred_liabilities = sum(1,2)
    non_current_deferred_liabilities = models.FloatField(
        null=True, blank=True, default=0
    )
    non_current_deferred_taxes_liabilities = models.FloatField(
        null=True, blank=True, default=0
    )
    non_current_deferred_revenue = models.FloatField(
        null=True, blank=True, default=0
    )

    # TotalEquityGrossMinorityInterest = stockholders_equity
    # 1. common stock: aka. capital stock
    # 2. retained_earnings
    # 3. gains_losses_not_affecting_retained_earnings
    #
    # Eq.
    # - total equity = sum(1,2,3)
    stockholders_equity = models.FloatField(null=True, blank=True, default=0)
    # == capital stock
    common_stock = models.FloatField(null=True, blank=True, default=0)
    retained_earnings = models.FloatField(null=True, blank=True, default=0)
    gains_losses_not_affecting_retained_earnings = models.FloatField(
        null=True, blank=True, default=0
    )

    # Some summary values below
    # I suppose they are computed from values above
    total_capitalization = models.FloatField(null=True, blank=True, default=0)
    # == stockholders_equity
    common_stock_equity = models.FloatField(null=True, blank=True, default=0)
    net_tangible_assets = models.FloatField(null=True, blank=True, default=0)
    working_capital = models.FloatField(null=True, blank=True, default=0)
    invested_capital = models.FloatField(null=True, blank=True, default=0)
    tangible_book_value = models.FloatField(null=True, blank=True, default=0)
    total_debt = models.FloatField(null=True, blank=True, default=0)
    net_debt = models.FloatField(null=True, blank=True, default=0)

    cash_financial = models.FloatField(null=True, blank=True, default=0)

    @property
    def total_liability(self):
        return self.total_assets - self.stockholders_equity

    @property
    def current_ratio(self):
        """Test of 12m health.

        Assuming current assets will turn into cash, or creditors are
        willing to take assets as payment.

        This is different from quick ratio in which only cash is
        considered.

        """
        return self._as_of_ratio("current_assets", "current_liabilities")

    @property
    def quick_ratio(self):
        """Acid test. Test of 12m health using cashes only.

        This ratio, if > 1, meaning company can easily payoff all
        short-term liabilities w/ cash.

        Here, I'm deciding to add Account Receivable. But, they need
        to be discounted! To be conservative, I should really consider
        discounting them to 0. But for a reasonable scenario, let me
        to cut to 50%.

        """
        AR_LOSS_RATIO = 0.5
        if not self.current_liabilities:
            return 0

        return (
            self.cash_cash_equivalents_and_short_term_investments
            + self.ar * AR_LOSS_RATIO
        ) / self.current_liabilities

    @property
    def capital_structure(self):
        """Current capital structure in term of debt % of (debt+equity).

        Remember that debt = long-term liability.

        TODO
        ----
        1. Needs to estimate the market value of the debt, not just
           reported debt.
        """
        return self._as_of_pcnt("total_debt", "total_assets")

    @property
    def debt_growth_rate(self):
        """Compute how much total debt has grown over last report."""
        return self._growth_rate("BalanceSheet", "total_debt")

    @property
    def ap_growth_rate(self):
        """Compute AP growth over last report.

        The more AP there is, the liability it has. Also, it could be
        that the business is harming its vendors to boost its own
        position, which, IMHO, is a terrible strategy.

        """
        return self._growth_rate("BalanceSheet", "ap")

    @property
    def ar_growth_rate(self):
        """Compute AR growth over last report.

        I'm hoping this will show how well its customers are willing
        to pay. If it's growing, it should be a trouble sign that:

        - customers are not happy, thus unwilling to pay.
        - customers are themselves having problem, which indicates a
          troubled environment for this company.
        - management is not working well to collect the money, negligence?
        """
        return self._growth_rate("BalanceSheet", "ar")

    @property
    def all_cash_growth_rate(self):
        """Compute how much Cash & equivalents has grown over last report.

        I'm thinking this indicates how they are using the cash,
        eg. squandering them, accumulating them for good reason (or
        bad reason, eg. no investment opportunity?).

        Anyway, the more cash it has, the less likely it will go down,
        right?

        """
        return self._growth_rate(
            "BalanceSheet", "cash_cash_equivalents_and_short_term_investments"
        )

    @property
    def working_capital_growth_rate(self):
        """Compute how much WorkingCapital has grown over last report."""
        return self._growth_rate("BalanceSheet", "working_capital")

    @property
    def net_ppe_growth_rate(self):
        """Compute how much PPE has grown over last report.

        PP&E is a long-term investment. It's a signal how much they
        are investing into the future production.

        Think about this. If you are going to run away, will u want to
        invest into a factory, or keep cash? So, I think a positive
        change is a good thing.

        """
        return self._growth_rate("BalanceSheet", "net_ppe")

    @property
    def equity_multiplier(self):
        """Equity Multiplier = Assets / Shareholder Equity.

        Another factor of DuPont model.

        The equity multiplier, which is a measure of financial
        leverage, allows the investor to see what portion of the ROE
        is the result of debt.

        Since asset=debt+equity, the higher this multiplier is, the
        more debt this company is taking, thus more leveraged. This,
        of course, is a double edged sword. It can mean that it has
        capability to raise debt (w/ lenders), thus using less equity
        to do business; it an also mean it's loaded w/ debt and is in
        trouble.

        What is the proper level then?
        """

        # Having negative equity value is a clear trouble sign that
        # this company is in debt! eg. SBUX, its asset is < its
        # liability, bad.
        if self.stockholders_equity < 0:
            return 0

        return self._as_of_ratio("total_assets", "stockholders_equity")

    @property
    def debt_to_equity_ratio(self):
        """This is measuring relative ratio between debt and equity.

        Similar to the equity multiplier, I'm trying to understand how
        bad the company is relyin gon debt. So, if debt is 60%, and
        equity is 40%, it will be 6:4=1.5. Therefore, the higher this
        number is, the more leveraged this comapany is -- this will
        have the same meaning as equity multiplier, just different
        value.

        By Analyzing Financial Statement, page 342:

        > The debt to worth ratio reflects the relationship of the
        > creditors' equity to the owners' equity.

        Btw, total debt = long-term liabilities
        """
        if self.stockholders_equity < 0:
            return 0
        else:
            return self._as_of_ratio("total_debt", "stockholders_equity")

    @property
    def liability_pcnt(self):
        """Total liability/total assets.

        Similar to equity multiplier, this is measuring how much liability is
        in the total asset. The higher, the more troublesome it smells.
        """
        return self._as_of_pcnt("total_liability", "total_assets")

    @property
    def working_capital_to_current_liabilities(self):
        """Working capital health.

        Working capital is the _current equity_. Thefore, in time of
        trouble, owners of current liabilities would have claim on
        this amount. So the higher this ratio, the more cushion there is.
        """
        return self._as_of_ratio("working_capital", "current_liabilities")

    @property
    def non_current_to_equity(self):
        """Based on book Analyziing Financial Statements", page 342.

        > The fised assets to net worth ratio shows the percentage of
        > net worth invested in fixed assets.

        Fixed assets = total non current assets
        net worth = stockholders_equity
        """
        return self._as_of_ratio(
            "total_non_current_assets", "stockholders_equity"
        )
