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
        s = Ticker(self.stock.symbol)

        # all numbers convert to million
        df = s.valuation_measures
        if "unavailable" in df:
            logger.error(df)
            return

        # DB doesn't like NaN
        df = df.where(pd.notnull(df), 0)

        # enumerate data frame
        for row in df.itertuples(index=False):
            i, created = ValuationRatio.objects.get_or_create(
                stock=self.stock, on=row.asOfDate.date()
            )

            try:
                i.forward_pe = row.ForwardPeRatio
            except AttributeError:
                i.forward_pe = 0

            try:
                i.pb = row.PbRatio
            except AttributeError:
                i.pb = 0

            try:
                i.pe = row.PeRatio
            except AttributeError:
                i.pe = 0

            try:
                i.peg = row.PegRatio
            except AttributeError:
                i.peg = 0

            i.ps = row.PsRatio
            i.save()

        # if all values are 0, discard the record
        ValuationRatio.objects.filter(
            forward_pe=0, pb=0, pe=0, peg=0, ps=0
        ).delete()
