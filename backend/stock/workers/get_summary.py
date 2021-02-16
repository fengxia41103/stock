import logging

import pandas as pd

from stock.models import MyStock
from yahooquery import Ticker

logger = logging.getLogger("stock")


NA = "No fundamentals data found"


class MySummary:
    """Some summary info we get from multiple sources."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        B = 10 ** 9
        s = Ticker(self.stock.symbol)

        df = s.financial_data[self.stock.symbol]
        if NA in df:
            logger.error(df)
            return
        else:
            self.stock.roa = df.get("returnOnAssets", 0) * 100
            self.stock.roe = df.get("returnOnEquity", 0) * 100
            self.stock.save()

        df = s.key_stats[self.stock.symbol]
        if NA in df:
            logger.error(df)
            return
        else:
            self.stock.beta = df.get("beta", 0)
            self.stock.top_ten_institution_ownership = df.get(
                "heldPercentInstitutions", 0
            )
            self.stock.shares_outstanding = df.get("sharesOutstanding", 0) / B
            self.stock.profit_margin = df.get("profitMargins", 0) * 100
            self.stock.save()

        # This will either return a data frame (if a valid stock),
        # or a dict (if a fund).
        df = s.institution_ownership
        msg = df.get(self.stock.symbol)
        if msg is not None and NA in msg:
            logger.error(df)
            return
        elif msg is None:
            self.stock.top_ten_institution_ownership = sum(df["pctHeld"]) * 100
            self.stock.save()
