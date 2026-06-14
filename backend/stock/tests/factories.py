import factory
from django.contrib.auth.models import User

from stock.models import BalanceSheet, CashFlow, IncomeStatement, MySector, MyStock, MyStockHistorical


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda o: f"{o.username}@test.com")
    password = factory.PostGenerationMethodCall("set_password", "testpass")


class StockFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = MyStock

    symbol = factory.Sequence(lambda n: f"TST{n}")
    beta = 1.0
    roa = 10.0
    roe = 15.0
    shares_outstanding = 1000.0


class SectorFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = MySector

    name = factory.Sequence(lambda n: f"sector{n}")
    user = factory.SubFactory(UserFactory)


class HistoricalFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = MyStockHistorical

    stock = factory.SubFactory(StockFactory)
    on = factory.Sequence(lambda n: f"2026-01-{(n % 28) + 1:02d}")
    open_price = 100.0
    high_price = 105.0
    low_price = 95.0
    close_price = 102.0
    adj_close = 102.0
    vol = 1000.0


class BalanceSheetFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = BalanceSheet

    stock = factory.SubFactory(StockFactory)
    on = factory.Sequence(lambda n: f"2026-{(n % 4) + 1:02d}-01")
    total_assets = 100.0
    stockholders_equity = 50.0


class IncomeStatementFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = IncomeStatement

    stock = factory.SubFactory(StockFactory)
    on = factory.Sequence(lambda n: f"2026-{(n % 4) + 1:02d}-01")
    total_revenue = 50.0
    net_income = 10.0


class CashFlowFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CashFlow

    stock = factory.SubFactory(StockFactory)
    on = factory.Sequence(lambda n: f"2026-{(n % 4) + 1:02d}-01")
    operating_cash_flow = 15.0
    free_cash_flow = 10.0
