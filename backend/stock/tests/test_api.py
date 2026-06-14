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


@pytest.mark.django_db
class TestAuthentication:
    def test_no_token_returns_401(self):
        from rest_framework.test import APIClient
        client = APIClient()
        resp = client.get("/api/v1/stocks/")
        assert resp.status_code == 401

    def test_invalid_token_returns_401(self):
        from rest_framework.test import APIClient
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Token invalidtoken123")
        resp = client.get("/api/v1/stocks/")
        assert resp.status_code == 401

    def test_registration_creates_user(self):
        from rest_framework.test import APIClient
        client = APIClient()
        resp = client.post("/api/v1/users/", {
            "username": "newuser",
            "email": "new@test.com",
            "password": "securepass123",
        })
        assert resp.status_code == 200
        assert resp.json()["success"] is True
        assert "key" in resp.json()["data"]


@pytest.mark.django_db
class TestPagination:
    def test_historicals_paginated(self, api_client, user_with_stock):
        from stock.tests.factories import HistoricalFactory
        for i in range(5):
            HistoricalFactory(stock=user_with_stock, on=f"2026-06-{i+1:02d}")
        resp = api_client.get("/api/v1/historicals/")
        assert resp.status_code == 200
        data = resp.json()
        assert "count" in data
        assert "results" in data
        assert data["count"] == 5
        assert len(data["results"]) <= 200

    def test_sectors_not_paginated(self, api_client, user_with_stock):
        resp = api_client.get("/api/v1/sectors/")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


@pytest.mark.django_db
class TestRankingCache:
    def test_rebuild_populates_cache(self, api_client, user_with_stock):
        from django.core.management import call_command
        call_command("rebuild_rankings")
        from stock.models import RankingCache
        assert RankingCache.objects.count() >= 5

    def test_stock_ranks_returns_data(self, api_client, user_with_stock):
        from django.core.management import call_command
        call_command("rebuild_rankings")
        resp = api_client.get("/api/v1/stock-ranks/")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1


@pytest.mark.django_db
class TestNewEndpoints:
    def test_dupont_endpoint(self, api_client, user_with_stock):
        resp = api_client.get(f"/api/v1/stocks/{user_with_stock.id}/dupont/")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_nav_endpoint(self, api_client, user_with_stock):
        resp = api_client.get(f"/api/v1/stocks/{user_with_stock.id}/nav/")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_cross_statements_endpoint(self, api_client, user_with_stock):
        resp = api_client.get(f"/api/v1/stocks/{user_with_stock.id}/cross-statements/")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
