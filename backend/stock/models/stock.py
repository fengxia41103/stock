# -*- coding: utf-8 -*-

from django.db import models
from django.db.models import Avg


class MyStock(models.Model):
    symbol = models.CharField(max_length=64, unique=True)
    beta = models.FloatField(null=True, default=5)
    roa = models.FloatField(null=True, default=0, verbose_name="Return on Assets")
    roe = models.FloatField(null=True, default=0, verbose_name="Return on Equity")
    profit_margin = models.FloatField(null=True, default=0)
    shares_outstanding = models.FloatField(null=True, default=0)
    top_ten_institution_ownership = models.FloatField(null=True, default=-1)
    institution_count = models.IntegerField(null=True, default=-1)

    def __str__(self):
        return self.symbol

    @property
    def tax_rate(self):
        return self.incomes.filter(tax_rate__gt=0).aggregate(Avg("tax_rate"))[
            "tax_rate__avg"
        ]

    @property
    def latest_close_price(self):
        hist = self.historicals.order_by("-on").first()
        return hist.close_price if hist else None

    @property
    def last_lower(self):
        hist = self.historicals.order_by("-on").first()
        return hist.last_lower if hist else None

    @property
    def last_better(self):
        hist = self.historicals.order_by("-on").first()
        return hist.last_better if hist else None

    @property
    def dupont_roe(self):
        """ROE by Dupont model using avg asset and avg equity."""
        if not self.balances.all():
            return 0

        avgs = self.balances.filter(stockholders_equity__gt=0).aggregate(
            Avg("total_assets"), Avg("stockholders_equity")
        )
        if not all(avgs.values()):
            return 0

        equity_multiplier = avgs["total_assets__avg"] / avgs["stockholders_equity__avg"]
        last_reporting_date = self.balances.order_by("-on")[0].on
        incomes = self.incomes.filter(on__lte=last_reporting_date)
        if incomes:
            last_income = incomes.last()
            turnover = last_income.total_revenue / avgs["total_assets__avg"]
            return last_income.net_income_to_revenue * turnover * equity_multiplier
        return 0

    @property
    def roe_dupont_reported_gap(self):
        """% difference between reported ROE and DuPont-computed ROE."""
        if self.roe:
            return (self.roe - self.dupont_roe) / self.roe * 100
        return 0

    @property
    def dupont_model(self):
        """Build per-period DuPont ROE decomposition."""
        vals = []
        for b in self.balances.all().order_by("on"):
            leverage = b.equity_multiplier
            incomes = self.incomes.filter(on__lte=b.on).order_by("-on")
            if not incomes:
                continue
            i = incomes[0]
            net_profit_margin = i.net_income_to_revenue
            turnover = i.total_revenue / b.total_assets if b.total_assets else 0
            roe = net_profit_margin * turnover * leverage
            vals.append(
                {
                    "on": b.on,
                    "net_profit_margin": net_profit_margin,
                    "asset_turnover": turnover * 100,
                    "equity_multiplier": leverage,
                    "roe": roe,
                    "revenue": i.total_revenue,
                    "assets": b.total_assets,
                    "debts": b.total_debt,
                    "equity": b.stockholders_equity,
                }
            )
        return vals

    @property
    def nav_model(self):
        """Net Asset Value per share over time."""
        vals = []
        for b in self.balances.order_by("on"):
            nav = (
                (b.total_assets - b.total_liability) / self.shares_outstanding
                if self.shares_outstanding
                else 0
            )
            vals.append({"on": b.on, "nav": nav})
        return vals

    @property
    def last_reporting_date(self):
        tmp = self.incomes.order_by("-on")
        return tmp[0].on if tmp else None

    @property
    def cross_statements_model(self):
        """Values depending on different statements (ROCE, ROIC, capital structure, FCF)."""
        vals = []
        for d in self.incomes.all().order_by("on"):
            capital_structure = 0
            share_issued = 0
            balance = self.balances.filter(on__lte=d.on).order_by("-on").first()
            if balance:
                capital_structure = balance.capital_structure
                share_issued = balance.share_issued

            fcf = 0
            cash_statement = self.cashes.filter(on__lte=d.on).order_by("-on").first()
            if cash_statement:
                fcf = cash_statement.free_cash_flow

            tax_rate = d.tax_rate
            roce = 0
            invested_capital = 0
            if balance:
                invested_capital = (
                    balance.invested_capital
                    if balance.invested_capital
                    else balance.working_capital - balance.cash_and_cash_equivalent
                )
            if not invested_capital or invested_capital < 0:
                invested_capital = 0
            if d.ebit and invested_capital:
                roce = d.ebit / invested_capital * 100

            roic = 0
            nopat = 0
            if invested_capital and d.tax_rate and d.ebit:
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
                    "roce": max(roce, 0),
                    "roic": max(roic, 0),
                    "nopat": nopat,
                    "invested_capital": invested_capital,
                }
            )
        return vals

    @property
    def pe(self):
        tmp = self.ratios.filter(pe__gt=0).order_by("-on").first()
        return tmp.pe if tmp else None

    @property
    def pb(self):
        tmp = self.ratios.filter(pb__gt=0).order_by("-on").first()
        return tmp.pb if tmp else None

    @property
    def ps(self):
        tmp = self.ratios.filter(ps__gt=0).order_by("-on").first()
        return tmp.ps if tmp else None

    @property
    def price_to_cash_premium(self):
        tmp = self.balances.order_by("-on").first()
        if tmp:
            cash_per_share = tmp.cash_and_cash_equivalent_per_share
            if self.latest_close_price and cash_per_share:
                return self.latest_close_price / cash_per_share
        return None
