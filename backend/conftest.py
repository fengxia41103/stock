import pytest
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from stock.models import MySector, MyStock
from stock.services import provision_new_user
from stock.signals import on_new_user


@pytest.fixture(autouse=True)
def disconnect_user_signal():
    """Prevent signal from firing Celery tasks during tests."""
    post_save.disconnect(on_new_user, sender=User)
    yield
    post_save.connect(on_new_user, sender=User)


@pytest.fixture
def api_client(db):
    user = User.objects.create_user(username="testuser", email="test@test.com", password="pass")
    provision_new_user(user, skip_fetch=True)
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.fixture
def user_with_stock(api_client, db):
    user = User.objects.get(username="testuser")
    stock, _ = MyStock.objects.get_or_create(symbol="AAPL")
    sector = MySector.objects.filter(user=user).first()
    if not sector:
        sector = MySector.objects.create(name="test", user=user)
    sector.stocks.add(stock)
    return stock
