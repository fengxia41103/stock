# -*- coding: utf-8 -*-


import logging
from datetime import date
from datetime import timedelta

from django.apps import apps
from django.db import models
from django.db.models import Avg

logger = logging.getLogger("stock")
logger.setLevel(logging.DEBUG)


class MySector(models.Model):
    """Sector that is used to group stocks.

    The company that a stock represents is usually linked to a
    sector. Each country may have a different way to define these.

    """

    name = models.CharField(max_length=32, null=True, blank=True, unique=True)
    stocks = models.ManyToManyField("MyStock", related_name="sectors")

    def __str__(self):
        return str(self.name)


class MyStockRankManager(models.Manager):
    def rank_by(self, attr, high_to_low):
        vals = []

        for s in MyStock.objects.all():
            vals.append(
                {"id": s.id, "symbol": s.symbol, "val": getattr(s, attr)}
            )

        # WARNING: eliminate 0 and -100, which are _invalid_ or
        # _unknown_ internally becase some data anomalies.
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

    symbol = models.CharField(max_length=32, unique=True)
    beta = models.FloatField(null=True, default=5)
    roa = models.FloatField(
        null=True, default=0, verbose_name="Return on Assets"
    )
    roe = models.FloatField(
        null=True, default=0, verbose_name="Return on Equity"
    )
    profit_margin = models.FloatField(null=True, default=0)
    shares_outstanding = models.FloatField(null=True, default=0)

    top_ten_institution_ownership = models.FloatField(null=True, default=-1)
    institution_count = models.IntegerField(null=True, default=-1)

    class Meta:
        base_manager_name = "rank_manager"

    def __str__(self):
        return self.symbol

    @property
    def tax_rate(self):
        return self.incomes.filter(tax_rate__gt=0).aggregate(Avg("tax_rate"))[
            "tax_rate__avg"
        ]

    @property
    def latest_close_price(self):
        """The latest close price.

        We can use this to compare to our DCF evaluation so to measure
        a premium.

        """
        hist = self.historicals.order_by("-on").first()
        if hist:
            return hist.close_price
        else:
            return None

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

        # WARNING: ignore negative equity values in average
        avgs = self.balances.filter(stockholders_equity__gt=0).aggregate(
            Avg("total_assets"), Avg("stockholders_equity")
        )

        # leverage is avg asset / avg equity
        if all(avgs.values()):
            equity_multiplier = (
                avgs["total_assets__avg"] / avgs["stockholders_equity__avg"]
            )
        else:
            return 0

        # turn over is latest revenue / avg asset
        last_reporting_date = self.balances.order_by("-on")[0].on

        incomes = self.incomes.filter(on__lte=last_reporting_date)
        if incomes:
            last_income = incomes.last()
            turnover = last_income.total_revenue / avgs["total_assets__avg"]
            return (
                last_income.net_income_to_revenue * turnover * equity_multiplier
            )
        else:
            return 0

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
        for b in self.balances.all().order_by("on"):
            leverage = b.equity_multiplier

            # TODO: the assumption of dates are aligned is FALSE!
            incomes = self.incomes.filter(on__lte=b.on).order_by("-on")
            if not incomes:
                continue

            i = incomes[0]
            net_profit_margin = i.net_income_to_revenue

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
            if self.shares_outstanding:
                nav = (
                    b.total_assets - b.total_liability
                ) / self.shares_outstanding
            else:
                nav = 0

            vals.append({"on": b.on, "nav": nav})
        return vals

    @property
    def last_reporting_date(self):
        tmp = self.incomes.order_by("-on")
        if tmp:
            # Symbol such as ETF does not have income statement
            return tmp[0].on
        else:
            return None

    @property
    def cross_statements_model(self):
        """Values depending on different statements.

        Some values have to be derived using different statements, and
        statements don't always line up by the same dates. Therefore,
        it's to look up the closest statement, eg. latest balance
        sheet before this income statement, and pull values from
        that. One clear example is the DCF model, which involves
        income statement, and balance sheet.

        - DCF model values
        - ROCE: https://www.investopedia.com/terms/r/roce.asp
        - ROIC: https://www.investopedia.com/terms/r/returnoninvestmentcapital.asp

        Fortunately, all these go by the income statement as the main
        reference.

        """
        vals = []
        for d in self.incomes.all().order_by("on"):
            # Using `lte` because some company has more income
            # statements than balance sheets.
            capital_structure = 0
            share_issued = 0
            balance = self.balances.filter(on__lte=d.on).order_by("-on").first()
            if balance:
                capital_structure = balance.capital_structure
                share_issued = balance.share_issued

            # cash using FCF
            # TODO: SY has 3 balance sheet, all on year end, 5 income
            # statements, and 4 cash flow statements! So the time
            # period alignment is a big problem.
            fcf = 0
            cash_statement = (
                self.cashes.filter(on__lte=d.on).order_by("-on").first()
            )
            if cash_statement:
                fcf = cash_statement.free_cash_flow

            # tax
            tax_rate = d.tax_rate

            # compute ROCE
            roce = 0
            invested_capital = 0
            if balance:
                if balance.invested_capital:
                    invested_capital = balance.invested_capital
                else:
                    invested_capital = (
                        balance.working_capital
                        - balance.cash_and_cash_equivalent
                    )

            if not invested_capital or invested_capital < 0:
                invested_capital = 0
            if d.ebit and invested_capital:
                roce = d.ebit / invested_capital * 100

            # compute ROIC
            roic = 0
            nopat = 0  # net profit after tax
            if not invested_capital:
                nopat = 0
            elif d.tax_rate and d.ebit:
                nopat = d.ebit * (1 - d.tax_rate)
            if nopat and invested_capital:
                roic = nopat / invested_capital * 100

            vals.append(
                {
                    "on": d.on,
                    "capital_structure": capital_structure,
                    "fcf": fcf,
                    "tax_rate": tax_rate,
                    "share_issued": share_issued,
                    "close_price": d.close_price,
                    "roce": max(roce, 0),  # only positive value
                    "roic": max(roic, 0),  # only positive value
                    "nopat": nopat,
                    "invested_capital": invested_capital,
                }
            )
        return vals

    @property
    def pe(self):
        tmp = self.ratios.filter(pe__gt=0).order_by("-on").first()
        if tmp:
            return tmp.pe
        else:
            return None

    @property
    def pb(self):
        tmp = self.ratios.filter(pb__gt=0).order_by("-on").first()
        if tmp:
            return tmp.pb
        else:
            return None

    @property
    def ps(self):
        tmp = self.ratios.filter(ps__gt=0).order_by("-on").first()
        if tmp:
            return tmp.ps
        else:
            return None


class MyStockHistorical(models.Model):
    """Historical stock data."""

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

    @property
    def vol_over_share_outstanding(self):
        if self.stock.shares_outstanding:
            return self.vol / self.stock.shares_outstanding * 0.001
        else:
            return 0


class StatementBase(models.Model):
    class Meta:
        abstract = True

    def _as_of_ratio(self, attr1, attr2):
        """Attr1/ attr2.

        This is a measure of scale, thus am converting all values
        using `abs()`.

        """

        b = getattr(self, attr2)

        if not b:
            # if 0 or none
            return 0
        else:
            a = getattr(self, attr1)
            if a * b > 0:
                # they have the same sign
                return a / b
            else:
                return abs((a - b) / b)

    def _as_of_pcnt(self, attr1, attr2):
        """Attr1 as % of attr2."""
        return self._as_of_ratio(attr1, attr2) * 100

    def _prevs(self, model_name, app_name="stock"):
        """Get available model records whose `on` < mine.

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
        ).order_by("-on")

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

    def _as_of_his_ratio(self, attr1, model_name, attr2, app_name="stock"):
        """My Attr1 as % of model B's attr2.

        Some rates/ratios are computed using values across two models,
        eg. asset ebit margin = ebit/total_assets, so to measure how
        the busines's asset is managed.

        """
        the_model = apps.get_model(app_name, model_name)

        # We are to look same period, if all possible, but will settle
        # on a previous report if the current period's is not
        # available. At least we could take the assumption things
        # didn't change. Well, of course, this assumption is usually
        # qutie wrong! For example, I have seen some have balance
        # sheet 1 year behind its income statement. Therefore, ratios
        # involving the two will be skewed, thus make them rather
        # misleading.
        b = the_model.objects.filter(stock=self.stock, on__lte=self.on).values(
            attr2
        )

        # if no corresponding B, return 0
        valids = list(filter(lambda x: x[attr2], b))
        if not valids:
            return 0

        b_val = valids[0][attr2]
        if not b_val:
            # if b's value is invalid, return 0
            return 0

        return abs(getattr(self, attr1)) / b_val

    def _as_of_his_pcnt(self, attr1, model_name, attr2, app_name="stock"):
        return self._as_of_his_ratio(attr1, model_name, attr2, app_name) * 100

    @property
    def close_price(self):
        """Close price on that date.

        Statements are for valuation. Let's show the actual price on that date.
        """
        tmp = MyStockHistorical.objects.filter(
            stock=self.stock, on__gte=self.on
        )

        if tmp:
            return tmp[0].close_price
        else:
            # When I have an updated report today, but no historical
            # yet, eg. reported tonight after market close, and I
            # haven't yet pulled in today's price.
            return 0


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
    def net_income_to_revenue(self):
        """Als knowns as net profit margin.

        The net profit margin is the after-tax profit a company
        generated for each dollar of revenue.

        """
        return self._as_of_pcnt("net_income", "total_revenue")

    @property
    def gross_profit_to_revenue(self):
        return self._as_of_pcnt("gross_profit", "total_revenue")

    @property
    def cogs_to_revenue(self):
        """How much cost to make a sale.

        The higher, the worse. If it's 0, there is 0 cost for the
        money you just made!

        """
        return self._as_of_pcnt("reconciled_cost_of_revenue", "total_revenue")

    @property
    def ebit_to_revenue(self):
        """EBIT is an income indicator. Higher is better."""
        return self._as_of_pcnt("ebit", "total_revenue")

    @property
    def total_expense_to_revenue(self):
        """How much expense to achieve the sales. Lower is better."""
        return self._as_of_pcnt("total_expenses", "total_revenue")

    @property
    def operating_income_to_revenue(self):
        """How much sales became operating income. Higher is better."""
        return self._as_of_pcnt("operating_income", "total_revenue")

    @property
    def operating_expense_to_revenue(self):
        """How much expense in operation. The lower, the better."""
        return self._as_of_pcnt("operating_expense", "total_revenue")

    @property
    def selling_ga_to_revenue(self):
        """Lower is better."""
        return self._as_of_pcnt(
            "selling_general_and_administration", "total_revenue"
        )

    @property
    def interest_income_to_revenue(self):
        return self._as_of_pcnt("interest_income", "total_revenue")

    @property
    def other_income_expense_to_revenue(self):
        """As an expense, lower is better."""
        return self._as_of_pcnt("other_income_expense", "total_revenue")

    @property
    def pretax_income_to_revenue(self):
        return self._as_of_pcnt("pretax_income", "total_revenue")

    @property
    def operating_profit(self):
        return self.operating_income - self.operating_expense

    @property
    def operating_profit_to_operating_income(self):
        """主营业务毛利率

        Operating profit margin, focusing on operating revenue & expense.
        So should be a good number for its operation. Higher is better.
        """
        return self._as_of_pcnt("operating_profit", "operating_income")

    @property
    def net_income_to_operating_income(self):
        """主营业务净利率

        How much operating income becomes NI eventually. Higher is better.
        """
        return self._as_of_pcnt("net_income", "operating_income")

    @property
    def ebit_to_total_asset(self):
        """资产净利率

        Because this is using value of BalanceSheet, I'm putting this
        computation here with IncomeStatement because it has more
        reporting records than BalanceSheet, eg. I can see a income
        statement of 9/30/2020, but the last BalanceSheet of this
        company was at 12/31/2019.

        """
        return self._as_of_his_pcnt("ebit", "BalanceSheet", "total_assets")

    @property
    def net_income_to_equity(self):
        """净资产收益率

        Return on equity essentially using NI as numerator.
        """
        return self._as_of_his_pcnt(
            "net_income", "BalanceSheet", "stockholders_equity"
        )

    @property
    def net_income_growth_rate(self):
        return self._growth_rate("IncomeStatement", "net_income")

    @property
    def operating_income_growth_rate(self):
        return self._growth_rate("IncomeStatement", "operating_income")

    @property
    def cogs_to_inventory(self):
        """库存周转率 = COGS/inventory.

        Ratio.

        Well, I don't have running inventory number. Therefore, this
        is an assumption that reported inventory is representing an
        avg.
        """
        return self._as_of_his_ratio(
            "reconciled_cost_of_revenue", "BalanceSheet", "inventory"
        )

    @property
    def interest_coverage_ratio(self):
        """Howe well it can afford interest."""
        return self._as_of_ratio("ebit", "interest_expense")


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
    # 2. long term lease: N/A!
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
    share_issued = models.FloatField(null=True, blank=True, default=0)

    @property
    def total_liability(self):
        return self.total_assets - self.stockholders_equity

    @property
    def current_ratio(self):
        """Test of 12m health, 流动比率.

        Assuming current assets will turn into cash, or creditors are
        willing to take assets as payment.

        This is different from quick ratio in which only cash is
        considered.

        """
        return self._as_of_ratio("current_assets", "current_liabilities")

    @property
    def quick_ratio(self):
        """Acid test. Test of 12m health using cashes only. 速动比率.

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
            (
                self.cash_cash_equivalents_and_short_term_investments
                + self.ar * AR_LOSS_RATIO
                - self.inventory
            )
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
    def invested_capital_growth_rate(self):
        """Compute how much InvestedCapital has grown over last report."""
        return self._growth_rate("BalanceSheet", "invested_capital")

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
    def liability_to_asset(self):
        """Total liability/total assets, 资产负债率.

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

    @property
    def current_asset_to_total_asset(self):
        return self._as_of_pcnt("current_assets", "total_assets")

    @property
    def retained_earnings_to_equity(self):
        return self._as_of_pcnt("retained_earnings", "stockholders_equity")

    @property
    def inventory_to_current_asset(self):
        """How much current asset is inventory."""
        return self._as_of_pcnt("inventory", "current_assets")

    @property
    def cash_cash_equivalents_and_short_term_investments_to_current_asset(self):
        return self._as_of_pcnt(
            "cash_cash_equivalents_and_short_term_investments", "current_assets"
        )

    @property
    def equity_growth_rate(self):
        """资本积累率。

        There is a similar concept, 资本保值增值率=today's equity /
        prev's equity.  Essentially it's also measure a growth rate,
        thus is the same thing.

        Using the other one, you still need to eyeball whether pcnt is
        growing or shrinking. Instead, using this one, >0 is
        growing. Easy.

        """
        return self._growth_rate("BalanceSheet", "stockholders_equity")

    @property
    def tangible_book_value_per_share(self):
        return self._as_of_ratio("tangible_book_value", "share_issued")

    @property
    def cash_and_cash_equivalent_per_share(self):
        return self._as_of_ratio("cash_and_cash_equivalent", "share_issued")

    @property
    def price_to_cash_premium(self):
        """On this reporting date, price over cash per share.

        How much the price is trading comparing to rock solid cash!? I
        mean, all other assets and so on can be a bloat, but cash, I'm
        assuming they ar actual greenbacks, so they are as real as one
        gets.
        """
        return self._as_of_his_ratio(
            "cash_and_cash_equivalent_per_share",
            "MyStockHistorical",
            "close_price",
        )


class MyDiary(models.Model):
    """Make comment regarding a stock.

    This tracks my thoughts/reactions of a stock.
    """

    JUDGEMENT_CHOICES = [(1, "bull"), (2, "bear")]

    # stock is optional. If not given, it will be a general notes, and
    # UI will later figure out whether the content contains a stock
    # symbol, thus linking it to a stock's detail page.
    stock = models.ForeignKey(
        "MyStock",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        related_name="diaries",
    )
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    content = models.TextField(default="")
    judgement = models.IntegerField(default=1, choices=JUDGEMENT_CHOICES)

    @property
    def price(self):

        # if not giving a stock, we are making a general notes of the
        # market, thus using the SPY as tracker
        if not self.stock:
            stock, created = MyStock.objects.get_or_create(symbol="SPY")
        else:
            stock = self.stock

        historical = MyStockHistorical.objects.filter(
            stock=stock, on__lte=self.created.date()
        ).order_by("-on")

        if historical:
            return historical[0].close_price
        else:
            return 0

    @property
    def is_correct(self):
        """Was judgement of price correct.

        Using the price at the time vs. latest price to determine.

        1. bear: if price is lower and judgement is 2, TRUE
        2. bull: if price is higher and judgement is 1, TRUE
        3. all else, FALSE
        """

        # if not giving a stock, we are making a general notes of the
        # market, thus using the SPY as tracker
        if not self.stock:
            stock, created = MyStock.objects.get_or_create(symbol="SPY")
        else:
            stock = self.stock

        if stock.latest_close_price >= self.price and self.judgement == 1:
            return True

        elif stock.latest_close_price <= self.price and self.judgement == 2:
            return True

        return False


class MyNews(models.Model):
    source = models.CharField(max_length=64)
    topic = models.CharField(max_length=32)
    title = models.CharField(max_length=512)
    link = models.URLField()
    pub_time = models.DateTimeField()
    summary = models.TextField()

    class Meta:
        unique_together = [["source", "topic", "link"]]
        index_together = [["source", "topic", "title"]]
        ordering = ["-pub_time"]

    def __str__(self):
        return self.title
