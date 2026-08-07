"""Tests for portfolio position logic (Priority 2 from test-plan.md).

Guards against wrong P&L calculations which directly affect real money decisions.
"""

import pytest
from datetime import date
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from stock.models import MyStock, MySector
from stock.models.portfolio import Position, Transaction
from stock.models.historical import MyStockHistorical
from stock.services import provision_new_user


@pytest.fixture
def portfolio_client(db):
    """Authenticated client with a stock that has price data."""
    user = User.objects.create_user(username="portuser", password="pass")
    provision_new_user(user, skip_fetch=True)
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    stock = MyStock.objects.create(symbol="TEST", shares_outstanding=1.0)
    sector = MySector.objects.create(name="test-sector", user=user)
    sector.stocks.add(stock)

    # Add a historical price so current_price works
    MyStockHistorical.objects.create(
        stock=stock, on=date(2026, 8, 1),
        open_price=100, high_price=105, low_price=95,
        close_price=102, adj_close=102, vol=1000000,
    )

    return client, user, stock


@pytest.mark.django_db
class TestPortfolioPositions:
    """Portfolio position logic tests."""

    def test_buy_creates_position(self, portfolio_client):
        """First BUY creates a new Position."""
        client, user, stock = portfolio_client
        resp = client.post("/api/v1/portfolio/add-transaction/", {
            "stock": stock.id, "action": "BUY", "shares": 10, "price": 50, "date": "2026-07-01",
        })
        assert resp.status_code == 201
        pos = Position.objects.get(user=user, stock=stock)
        assert pos.shares == 10
        assert pos.avg_cost == 50

    def test_buy_updates_avg_cost(self, portfolio_client):
        """Second BUY recalculates weighted average cost correctly."""
        client, user, stock = portfolio_client
        # First buy: 10 shares at $50
        client.post("/api/v1/portfolio/add-transaction/", {
            "stock": stock.id, "action": "BUY", "shares": 10, "price": 50, "date": "2026-07-01",
        })
        # Second buy: 10 shares at $60
        client.post("/api/v1/portfolio/add-transaction/", {
            "stock": stock.id, "action": "BUY", "shares": 10, "price": 60, "date": "2026-07-02",
        })
        pos = Position.objects.get(user=user, stock=stock, closed_at__isnull=True)
        assert pos.shares == 20
        # avg_cost = (10*50 + 10*60) / 20 = 1100/20 = 55
        assert pos.avg_cost == 55.0

    def test_sell_reduces_shares(self, portfolio_client):
        """SELL decreases shares held."""
        client, user, stock = portfolio_client
        client.post("/api/v1/portfolio/add-transaction/", {
            "stock": stock.id, "action": "BUY", "shares": 20, "price": 50, "date": "2026-07-01",
        })
        client.post("/api/v1/portfolio/add-transaction/", {
            "stock": stock.id, "action": "SELL", "shares": 5, "price": 60, "date": "2026-07-10",
        })
        pos = Position.objects.get(user=user, stock=stock, closed_at__isnull=True)
        assert pos.shares == 15

    def test_sell_to_zero_closes_position(self, portfolio_client):
        """Selling all shares sets closed_at date."""
        client, user, stock = portfolio_client
        client.post("/api/v1/portfolio/add-transaction/", {
            "stock": stock.id, "action": "BUY", "shares": 10, "price": 50, "date": "2026-07-01",
        })
        client.post("/api/v1/portfolio/add-transaction/", {
            "stock": stock.id, "action": "SELL", "shares": 10, "price": 60, "date": "2026-07-10",
        })
        pos = Position.objects.get(user=user, stock=stock)
        assert pos.shares == 0
        assert pos.closed_at is not None

    def test_pnl_calculation(self, portfolio_client):
        """P&L = (current_price - avg_cost) × shares."""
        client, user, stock = portfolio_client
        Position.objects.create(
            user=user, stock=stock, shares=10, avg_cost=50, opened_at=date(2026, 7, 1)
        )
        pos = Position.objects.get(user=user, stock=stock, closed_at__isnull=True)
        # current_price = 102 (from fixture), avg_cost = 50, shares = 10
        assert pos.pnl == (102 - 50) * 10  # = 520

    def test_pnl_pct_calculation(self, portfolio_client):
        """P&L % = (pnl / total_cost) × 100."""
        client, user, stock = portfolio_client
        Position.objects.create(
            user=user, stock=stock, shares=10, avg_cost=50, opened_at=date(2026, 7, 1)
        )
        pos = Position.objects.get(user=user, stock=stock, closed_at__isnull=True)
        # total_cost = 10 * 50 = 500, pnl = 520
        # pnl_pct = 520/500 * 100 = 104%
        assert pos.pnl_pct == 104.0

    def test_holdings_excludes_closed(self, portfolio_client):
        """GET /portfolio/holdings/ only returns open positions."""
        client, user, stock = portfolio_client
        # Create a closed position
        Position.objects.create(
            user=user, stock=stock, shares=0, avg_cost=50,
            opened_at=date(2026, 6, 1), closed_at=date(2026, 6, 15),
        )
        resp = client.get("/api/v1/portfolio/holdings/")
        assert resp.status_code == 200
        assert len(resp.data["positions"]) == 0

    def test_total_cost_property(self, portfolio_client):
        """total_cost = shares × avg_cost."""
        client, user, stock = portfolio_client
        pos = Position.objects.create(
            user=user, stock=stock, shares=25, avg_cost=40, opened_at=date(2026, 7, 1)
        )
        assert pos.total_cost == 1000.0

    def test_is_open_property(self, portfolio_client):
        """is_open is True when shares > 0 and no closed_at."""
        client, user, stock = portfolio_client
        pos = Position.objects.create(
            user=user, stock=stock, shares=10, avg_cost=50, opened_at=date(2026, 7, 1)
        )
        assert pos.is_open is True
        pos.closed_at = date(2026, 8, 1)
        pos.shares = 0
        pos.save()
        assert pos.is_open is False
