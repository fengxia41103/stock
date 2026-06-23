# -*- coding: utf-8 -*-

from django.db import models
from django.db.models import Avg


class MyStock(models.Model):
    symbol = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=256, default="", blank=True)
    beta = models.FloatField(null=True, default=5)
    roa = models.FloatField(null=True, default=0, verbose_name="Return on Assets")
    roe = models.FloatField(null=True, default=0, verbose_name="Return on Equity")
    profit_margin = models.FloatField(null=True, default=0)
    shares_outstanding = models.FloatField(null=True, default=0)
    top_ten_institution_ownership = models.FloatField(null=True, default=-1)
    institution_count = models.IntegerField(null=True, default=-1)

    # Denormalized (populated by workers after data refresh)
    d_pe = models.FloatField(null=True, default=None)
    d_pb = models.FloatField(null=True, default=None)
    d_ps = models.FloatField(null=True, default=None)
    d_last_lower = models.IntegerField(null=True, default=None)
    d_last_better = models.IntegerField(null=True, default=None)
    d_price_to_cash_premium = models.FloatField(null=True, default=None)

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
    def last_price_date(self):
        hist = self.historicals.order_by("-on").first()
        return hist.on if hist else None

    @property
    def last_lower(self):
        if self.d_last_lower is not None:
            return self.d_last_lower
        hist = self.historicals.order_by("-on").first()
        return hist.last_lower if hist else None

    @property
    def last_better(self):
        if self.d_last_better is not None:
            return self.d_last_better
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
        if self.d_pe is not None:
            return self.d_pe
        tmp = self.ratios.filter(pe__gt=0).order_by("-on").first()
        return tmp.pe if tmp else None

    @property
    def pb(self):
        if self.d_pb is not None:
            return self.d_pb
        tmp = self.ratios.filter(pb__gt=0).order_by("-on").first()
        return tmp.pb if tmp else None

    @property
    def ps(self):
        if self.d_ps is not None:
            return self.d_ps
        tmp = self.ratios.filter(ps__gt=0).order_by("-on").first()
        return tmp.ps if tmp else None

    @property
    def price_to_cash_premium(self):
        if self.d_price_to_cash_premium is not None:
            return self.d_price_to_cash_premium
        tmp = self.balances.order_by("-on").first()
        if tmp:
            cash_per_share = tmp.cash_and_cash_equivalent_per_share
            if self.latest_close_price and cash_per_share:
                return self.latest_close_price / cash_per_share
        return None

    @property
    def insider_sentiment_3m(self):
        """Net insider buy/sell sentiment over last 3 months. Range: -1 to +1."""
        from datetime import date, timedelta

        cutoff = date.today() - timedelta(days=90)
        trades = self.insider_trades.filter(trade_date__gte=cutoff)
        buy_value = sum(t.total_value or 0 for t in trades if t.transaction_type == "P")
        sell_value = sum(t.total_value or 0 for t in trades if t.transaction_type == "S")
        total = buy_value + sell_value
        if total == 0:
            return 0
        return (buy_value - sell_value) / total

    @property
    def earnings_beat_rate(self):
        """% of last 16 quarters that beat EPS estimate."""
        events = self.earnings_events.filter(surprise_pct__isnull=False).order_by(
            "-report_date"
        )[:16]
        if not events:
            return None
        beats = sum(1 for e in events if e.surprise_pct > 0)
        return beats / len(events) * 100

    # --- Graham Valuation ---

    @property
    def graham_score(self):
        """Count of Benjamin Graham's screening criteria passed (0-7).

        Criteria:
        1. Adequate size (revenue > $100M = 0.1B in our units)
        2. Current ratio > 2
        3. Earnings stability (positive net income every quarter available, min 8)
        4. Earnings growth (>33% from oldest to newest available)
        5. Moderate PE (< 15)
        6. Moderate PE×PB (< 22.5)
        7. Low debt (total_debt < working_capital)
        """
        score = 0
        income = self.incomes.order_by("-on").first()
        balance = self.balances.order_by("-on").first()

        # 1. Size
        if income and income.total_revenue and income.total_revenue > 0.1:
            score += 1

        # 2. Current ratio > 2
        if balance and balance.current_ratio and balance.current_ratio > 2:
            score += 1

        # 3. Earnings stability (all available quarters positive, min 8)
        net_incomes = list(
            self.incomes.order_by("on").values_list("net_income", flat=True)
        )
        if len(net_incomes) >= 8 and all(ni and ni > 0 for ni in net_incomes):
            score += 1

        # 4. Earnings growth > 33%
        if len(net_incomes) >= 8 and net_incomes[0] and net_incomes[0] > 0:
            growth = (net_incomes[-1] - net_incomes[0]) / abs(net_incomes[0])
            if growth > 0.33:
                score += 1

        # 5. PE < 15
        if self.pe and 0 < self.pe < 15:
            score += 1

        # 6. PE × PB < 22.5
        if self.pe and self.pb and self.pe > 0 and self.pb > 0:
            if self.pe * self.pb < 22.5:
                score += 1

        # 7. Debt < working capital
        if balance and balance.working_capital and balance.total_debt is not None:
            if balance.total_debt < balance.working_capital:
                score += 1

        return score

    @property
    def graham_number(self):
        """Graham Number = sqrt(22.5 × EPS × BVPS).

        Stock is undervalued if price < Graham Number.
        """
        import math

        income = self.incomes.order_by("-on").first()
        balance = self.balances.order_by("-on").first()
        if not income or not balance:
            return None

        eps = income.basic_eps if income.basic_eps else None
        bvps = balance.tangible_book_value_per_share
        if not eps or eps <= 0 or not bvps or bvps <= 0:
            return None

        return math.sqrt(22.5 * eps * bvps)

    @property
    def graham_intrinsic_value(self):
        """Graham formula: V = EPS × (8.5 + 2g).

        g = earnings growth rate (annualized from available quarters).
        Returns intrinsic value per share.
        """
        incomes = list(
            self.incomes.filter(basic_eps__gt=0)
            .order_by("on")
            .values_list("basic_eps", flat=True)
        )
        if len(incomes) < 4:
            return None

        eps = incomes[-1]  # latest EPS (quarterly)
        # Annualize: sum last 4 quarters
        ttm_eps = sum(incomes[-4:]) if len(incomes) >= 4 else eps * 4

        # Compute annualized growth from earliest to latest
        years = len(incomes) / 4.0
        if years < 1 or incomes[0] <= 0:
            return None

        growth_total = (incomes[-1] / incomes[0])
        if growth_total <= 0:
            return None

        import math
        g = (math.pow(growth_total, 1.0 / years) - 1) * 100  # annualized %
        g = min(g, 20)  # cap at 20% to avoid absurd values

        return ttm_eps * (8.5 + 2 * g)

    @property
    def graham_margin_of_safety(self):
        """(Graham Intrinsic Value - Price) / Intrinsic Value as %.

        Positive = undervalued. Negative = overvalued.
        """
        iv = self.graham_intrinsic_value
        price = self.latest_close_price
        if not iv or not price or iv <= 0:
            return None
        return (iv - price) / iv * 100

    @property
    def pe_pb_product(self):
        """PE × P/B. Graham says should be < 22.5."""
        if self.pe and self.pb and self.pe > 0 and self.pb > 0:
            return self.pe * self.pb
        return None

    @property
    def net_net_ratio(self):
        """Market Cap / (Current Assets - Total Liabilities).

        < 0.67 = Graham net-net buy signal (price < 2/3 liquidation value).
        """
        balance = self.balances.order_by("-on").first()
        price = self.latest_close_price
        if not balance or not price or not self.shares_outstanding:
            return None

        ncav = balance.current_assets - balance.total_liability
        if ncav <= 0:
            return None

        market_cap = price * self.shares_outstanding
        return market_cap / ncav
