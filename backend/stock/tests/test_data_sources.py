import pytest
from rest_framework import status

from stock.models import MyStock
from stock.models.insider_trade import InsiderTrade
from stock.models.macro import MacroDataPoint, MacroSeries
from stock.models.earnings import EarningsEvent


@pytest.mark.django_db
class TestInsiderTradesEndpoint:
    def test_list_empty(self, api_client, user_with_stock):
        resp = api_client.get("/api/v1/insider-trades/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["count"] == 0

    def test_list_with_data(self, api_client, user_with_stock):
        InsiderTrade.objects.create(
            stock=user_with_stock,
            filed_on="2026-06-01",
            trade_date="2026-06-01",
            insider_name="John CEO",
            insider_title="CEO",
            insider_cik="000123",
            transaction_type="P",
            shares=1000,
            price_per_share=150.0,
            total_value=150000.0,
        )
        resp = api_client.get("/api/v1/insider-trades/")
        assert resp.status_code == 200
        assert resp.json()["count"] == 1
        assert resp.json()["results"][0]["insider_name"] == "John CEO"

    def test_filter_by_stock(self, api_client, user_with_stock):
        InsiderTrade.objects.create(
            stock=user_with_stock,
            filed_on="2026-06-01",
            trade_date="2026-06-01",
            insider_name="Test",
            insider_cik="111",
            transaction_type="S",
            shares=500,
        )
        resp = api_client.get(f"/api/v1/insider-trades/?stock={user_with_stock.id}")
        assert resp.status_code == 200
        assert resp.json()["count"] == 1

    def test_filter_by_transaction_type(self, api_client, user_with_stock):
        InsiderTrade.objects.create(
            stock=user_with_stock, filed_on="2026-06-01", trade_date="2026-06-01",
            insider_name="A", insider_cik="1", transaction_type="P", shares=100,
        )
        InsiderTrade.objects.create(
            stock=user_with_stock, filed_on="2026-06-02", trade_date="2026-06-02",
            insider_name="B", insider_cik="2", transaction_type="S", shares=200,
        )
        resp = api_client.get("/api/v1/insider-trades/?transaction_type=P")
        assert resp.json()["count"] == 1


@pytest.mark.django_db
class TestMacroEndpoints:
    def test_macro_series_empty(self, api_client, user_with_stock):
        resp = api_client.get("/api/v1/macro-series/")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_macro_series_with_data(self, api_client, user_with_stock):
        MacroSeries.objects.create(
            series_id="DGS10", title="10-Year Treasury", category="rates"
        )
        resp = api_client.get("/api/v1/macro-series/")
        assert resp.status_code == 200
        assert len(resp.json()) == 1
        assert resp.json()[0]["series_id"] == "DGS10"

    def test_macro_data_filter_by_series(self, api_client, user_with_stock):
        s = MacroSeries.objects.create(series_id="DGS10", title="10Y", category="rates")
        MacroDataPoint.objects.create(series=s, date="2026-06-01", value=4.5)
        MacroDataPoint.objects.create(series=s, date="2026-06-02", value=4.6)
        resp = api_client.get("/api/v1/macro-data/?series_id=DGS10")
        assert resp.status_code == 200
        assert resp.json()["count"] == 2

    def test_macro_data_date_filter(self, api_client, user_with_stock):
        s = MacroSeries.objects.create(series_id="T10Y2Y", title="Spread", category="rates")
        MacroDataPoint.objects.create(series=s, date="2026-01-01", value=-0.1)
        MacroDataPoint.objects.create(series=s, date="2026-06-01", value=0.5)
        resp = api_client.get("/api/v1/macro-data/?series_id=T10Y2Y&date__gte=2026-05-01")
        assert resp.status_code == 200
        assert resp.json()["count"] == 1


@pytest.mark.django_db
class TestEarningsEndpoints:
    def test_earnings_list(self, api_client, user_with_stock):
        EarningsEvent.objects.create(
            stock=user_with_stock,
            report_date="2026-07-22",
            estimated_eps=3.05,
        )
        resp = api_client.get(f"/api/v1/earnings/?stock={user_with_stock.id}")
        assert resp.status_code == 200
        assert resp.json()["count"] == 1

    def test_earnings_upcoming(self, api_client, user_with_stock):
        from datetime import date, timedelta
        future = date.today() + timedelta(days=10)
        EarningsEvent.objects.create(
            stock=user_with_stock,
            report_date=future,
            estimated_eps=2.5,
        )
        resp = api_client.get("/api/v1/earnings/upcoming/")
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_earnings_beat_fields(self, api_client, user_with_stock):
        EarningsEvent.objects.create(
            stock=user_with_stock,
            report_date="2026-04-22",
            estimated_eps=2.0,
            reported_eps=2.5,
            surprise=0.5,
            surprise_pct=25.0,
        )
        resp = api_client.get(f"/api/v1/earnings/?stock={user_with_stock.id}")
        e = resp.json()["results"][0]
        assert e["is_beat"] is True
        assert e["surprise_pct"] == 25.0


@pytest.mark.django_db
class TestHoldingsEndpoint:
    def test_holdings_empty(self, api_client, user_with_stock):
        resp = api_client.get("/api/v1/holdings/")
        assert resp.status_code == 200
        assert resp.json()["count"] == 0


@pytest.mark.django_db
class TestStockDetailNewFields:
    def test_stock_detail_has_name(self, api_client, user_with_stock):
        user_with_stock.name = "Apple Inc."
        user_with_stock.save()
        resp = api_client.get(f"/api/v1/stocks/{user_with_stock.id}/")
        assert resp.json()["name"] == "Apple Inc."

    def test_stock_detail_has_insider_sentiment(self, api_client, user_with_stock):
        resp = api_client.get(f"/api/v1/stocks/{user_with_stock.id}/")
        assert "insider_sentiment_3m" in resp.json()

    def test_stock_detail_has_earnings_beat_rate(self, api_client, user_with_stock):
        resp = api_client.get(f"/api/v1/stocks/{user_with_stock.id}/")
        assert "earnings_beat_rate" in resp.json()
