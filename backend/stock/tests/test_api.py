import pytest
from rest_framework import status

from stock.tests.factories import BalanceSheetFactory, HistoricalFactory, StockFactory


@pytest.mark.django_db
class TestStockEndpoints:
    def test_list_stocks(self, api_client, user_with_stock):
        resp = api_client.get("/api/v1/stocks/")
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.json()) >= 1

    def test_retrieve_stock(self, api_client, user_with_stock):
        resp = api_client.get(f"/api/v1/stocks/{user_with_stock.id}/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["symbol"] == "AAPL"

    def test_list_stocks_unauthenticated(self):
        from rest_framework.test import APIClient
        client = APIClient()
        resp = client.get("/api/v1/stocks/")
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestHistoricalEndpoints:
    def test_list_historicals(self, api_client, user_with_stock):
        HistoricalFactory(stock=user_with_stock, on="2026-06-01")
        HistoricalFactory(stock=user_with_stock, on="2026-06-02")
        resp = api_client.get("/api/v1/historicals/")
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert "results" in data  # paginated
        assert data["count"] == 2

    def test_filter_by_date_range(self, api_client, user_with_stock):
        HistoricalFactory(stock=user_with_stock, on="2026-06-01")
        HistoricalFactory(stock=user_with_stock, on="2026-06-10")
        resp = api_client.get("/api/v1/historicals/?on__range=2026-06-01,2026-06-05")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["count"] == 1


@pytest.mark.django_db
class TestRankingEndpoints:
    def test_stock_ranks(self, api_client, user_with_stock):
        resp = api_client.get("/api/v1/stock-ranks/")
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert isinstance(data, list)

    def test_balance_ranks(self, api_client, user_with_stock):
        BalanceSheetFactory(stock=user_with_stock, on="2026-03-01")
        resp = api_client.get("/api/v1/balance-ranks/")
        assert resp.status_code == status.HTTP_200_OK
        assert isinstance(resp.json(), list)


@pytest.mark.django_db
class TestSectorEndpoints:
    def test_list_sectors(self, api_client, user_with_stock):
        resp = api_client.get("/api/v1/sectors/")
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.json()) >= 1

    def test_sector_has_stocks_detail(self, api_client, user_with_stock):
        resp = api_client.get("/api/v1/sectors/")
        sector = resp.json()[0]
        assert "stocks_detail" in sector
