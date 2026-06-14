# -*- coding: utf-8 -*-

import logging
from decimal import Decimal, InvalidOperation

import yfinance as yf

from stock.models import MyStock, MyStockHistorical

logger = logging.getLogger("stock")


class MyStockHistoricalYahoo:
    def __init__(self, symbol):
        self.symbol = symbol

    def parser(self):
        stock, created = MyStock.objects.get_or_create(symbol=self.symbol)

        existing_dates = set(
            MyStockHistorical.objects.filter(stock=stock)
            .values_list("on", flat=True)
            .distinct()
        )
        existing_isos = {d.isoformat() for d in existing_dates}

        dat = yf.Ticker(self.symbol)
        df = dat.history("max")
        records = []

        for index, row in df.iterrows():
            if index.date().isoformat() in existing_isos:
                continue

            vals = row.values
            open_p, high_p, low_p, close_p = map(self._to_decimal, vals[0:4])

            vol = row["Volume"]
            vol = vol / 1000.0 if vol else -1

            adj_p = close_p
            if row["Dividends"]:
                adj_p = close_p - Decimal(str(row["Dividends"]))
            if row["Stock Splits"] and row["Stock Splits"] != 0:
                adj_p = adj_p / Decimal(str(row["Stock Splits"]))

            records.append(MyStockHistorical(
                stock=stock,
                on=index.date(),
                open_price=float(open_p),
                high_price=float(high_p),
                low_price=float(low_p),
                close_price=float(close_p),
                vol=float(vol),
                adj_close=float(adj_p),
            ))

            if len(records) >= 1000:
                MyStockHistorical.objects.bulk_create(records)
                records = []

        if records:
            MyStockHistorical.objects.bulk_create(records)

        logger.debug(f"[{self.symbol}] complete")

    @staticmethod
    def _to_decimal(val):
        try:
            return Decimal(str(val))
        except (InvalidOperation, ValueError):
            return Decimal(-1)
