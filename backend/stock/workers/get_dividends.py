"""Fetch dividend history from yfinance."""

import yfinance as yf

from stock.models import MyStock
from stock.models.dividend import DividendEvent


class DividendWorker:
    """Fetch dividend history for a stock using yfinance."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        """Fetch all available dividend data and store."""
        ticker = yf.Ticker(self.stock.symbol)
        divs = ticker.dividends

        if divs is None or divs.empty:
            return 0

        count = 0
        for dt, amount in divs.items():
            if amount > 0:
                _, created = DividendEvent.objects.get_or_create(
                    stock=self.stock,
                    ex_date=dt.date(),
                    defaults={"amount": float(amount)},
                )
                if created:
                    count += 1

        return count
