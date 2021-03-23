import logging

import pandas as pd

from stock.models import MyStock
from stock.models import ValuationRatio
from yahooquery import Ticker

logger = logging.getLogger("stock")


class MyValuationRatio:
    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        s = Ticker(self.stock.symbol, timeout=15)

        # all numbers convert to million
        df = s.valuation_measures
        if "unavailable" in df or "error" in df:
            logger.error("{}: {}".format(self.stock.symbol, df))
            return

        # DB doesn't like NaN
        df = df.where(pd.notnull(df), 0)

        mapping = {
            "forward_pe": "ForwardPeRatio",
            "pb": "PbRatio",
            "pe": "PeRatio",
            "peg": "PegRatio",
            "ps": "PsRatio",
        }

        # enumerate data frame
        for row in df.itertuples(index=False):
            i, created = ValuationRatio.objects.get_or_create(
                stock=self.stock, on=row.asOfDate.date()
            )

            for key, val in mapping.items():
                try:
                    tmp = float(getattr(row, val))
                except AttributeError:
                    tmp = 0

                # set value
                setattr(i, key, tmp)
            i.save()

        # if all values are 0, discard the record
        ValuationRatio.objects.filter(
            forward_pe=0, pb=0, pe=0, peg=0, ps=0
        ).delete()
