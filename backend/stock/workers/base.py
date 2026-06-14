import logging

import pandas as pd
from yahooquery import Ticker

from stock.models import MyStock

logger = logging.getLogger("stock")

M = 10**6
B = 10**9


class StatementWorker:
    """Base class for Yahoo Finance statement workers.

    Subclasses define:
        model: Django model class
        mapping: dict of {model_field: YahooColumnName}
        yahoo_method: str name of Ticker method to call
        frequency: "q" or "a" (default "q")
        normalize_large: bool — divide large numbers by B (default True)
    """

    model = None
    mapping = {}
    yahoo_method = None
    frequency = "q"
    normalize_large = True

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        s = Ticker(self.stock.symbol, timeout=15)
        method = getattr(s, self.yahoo_method)

        if self.frequency:
            df = method(frequency=self.frequency)
        else:
            df = method

        # Handle property vs method
        if callable(df):
            df = df()

        if isinstance(df, str) or (hasattr(df, '__contains__') and ("unavailable" in df or "error" in df)):
            logger.error(f"{self.stock.symbol}: {df}")
            return

        df = df.where(pd.notnull(df), 0)

        for row in df.itertuples(index=False):
            instance, _ = self.model.objects.get_or_create(
                stock=self.stock, on=row.asOfDate.date()
            )

            for field, col in self.mapping.items():
                try:
                    tmp = float(getattr(row, col))
                except (AttributeError, TypeError, ValueError):
                    tmp = 0

                if self.normalize_large and abs(tmp) > M:
                    tmp = tmp / B

                setattr(instance, field, tmp)

            instance.save()
            self.post_save(instance)

    def post_save(self, instance):
        """Hook for subclasses to run after each record is saved."""
        pass
