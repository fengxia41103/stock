import logging

import pandas as pd

from stock.models import MyStock
from yahooquery import Ticker

logger = logging.getLogger("stock")


NA = "No fundamentals data found"
B = 10 ** 9


class MySummary:
    """Some summary info we get from multiple sources."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        s = Ticker(self.stock.symbol, timeout=15)

        # https://yahooquery.dpguthrie.com/guide/ticker/modules/#financial_data
        df = s.financial_data[self.stock.symbol]
        if NA in df:
            logger.error(df)
        else:
            self.stock.roa = df.get("returnOnAssets", 0) * 100
            self.stock.roe = df.get("returnOnEquity", 0) * 100

        # https://yahooquery.dpguthrie.com/guide/ticker/modules/#key_stats
        df = s.key_stats[self.stock.symbol]
        if NA in df:
            logger.error(df)
        else:
            # BETA default to 5!
            self.stock.beta = df.get("beta", 5)

            self.stock.top_ten_institution_ownership = df.get(
                "heldPercentInstitutions", 0
            )
            self.stock.shares_outstanding = df.get("sharesOutstanding", 0) / B
            self.stock.profit_margin = df.get("profitMargins", 0) * 100

        # This will either return a data frame (if a valid stock),
        # or a dict (if a fund).
        df = s.institution_ownership
        msg = df.get(self.stock.symbol)
        if msg is not None and NA in msg:
            logger.error(df)

        elif msg is None and not df.empty:
            self.stock.top_ten_institution_ownership = (
                sum(df.get("pctHeld", 0)) * 100
            )

        df = s.major_holders[self.stock.symbol]
        if NA in df:
            logger.error(df)

        else:
            self.stock.institution_count = df.get("institutionsCount", -1)

        # last, save the data
        self.stock.save()
