# -*- coding: utf-8 -*-
from __future__ import absolute_import

import csv
import logging
from datetime import datetime as dt
from decimal import Decimal
from decimal import InvalidOperation
from functools import reduce
from io import StringIO

from dateutil.relativedelta import relativedelta

from stock.models import MySector
from stock.models import MyStock
from stock.models import MyStockHistorical

logger = logging.getLogger("stock")


class MyStockHistoricalYahoo:
    def __init__(self, handler):
        self.http_handler = handler
        self.agent = handler.agent

    def parser(self, symbol):
        """Parse Yahoo api stock historical data.

        Polling ichart.yahoo.com with manufactured query string (dark
        magic) to get historical data of a given stock symbol.

        Arguments
        ---------
          :param: sector: str, sector name
          :param: symbol: str, stock symbol

        Return
        ------
          none

        """

        # Get stock and its existing historicals
        stock, created = MyStock.objects.get_or_create(symbol=symbol)

        his = [
            x.isoformat()
            for x in MyStockHistorical.objects.filter(stock=stock).values_list(
                "on", flat=True
            )
        ]

        # Read Yahoo api to get data
        # https://code.google.com/p/yahoo-finance-managed/wiki/csvHistQuotesDownload
        unix_origin = dt(1970, 1, 1)
        now = dt.now()
        ago = now + relativedelta(years=-50)  # 50 years

        # https://query1.finance.yahoo.com/v7/finance/download/AMZN?period1=863654400&period2=1607990400&interval=1d&events=history&includeAdjustedClose=true

        date_str = "period1={}&period2={}".format(
            int((ago - unix_origin).total_seconds()),
            int((now - unix_origin).total_seconds()),
        )
        url = "https://query1.finance.yahoo.com/v7/finance/download/{}?{}&interval=1d&events=history&includeAdjustedClose=true".format(
            symbol, date_str
        )
        logger.debug(url)
        logger.info("reading {} historicals".format(symbol))
        content = self.http_handler.request(url)

        # Parse data to update stock historicals
        f = StringIO(content)
        records = []
        for cnt, vals in enumerate(csv.reader(f)):
            if not self._are_vals_valid(symbol, vals):
                logger.debug("invalid vals: {}".format(vals))
                continue

            # stamp = [int(v) for v in vals[0].split('-')]
            # date_stamp = dt(year=stamp[0], month=stamp[1], day=stamp[2])
            date_stamp = dt.strptime(vals[0], "%Y-%m-%d")
            if date_stamp.date().isoformat() in his:
                # logger.debug('already have this')
                continue  # we already have these
            else:
                open_p, high_p, low_p, close_p, adj_p = map(
                    self._convert_to_decimal, vals[1:6]
                )

                if vals[6] is None or vals[6] == "null":
                    vol = -1
                else:
                    vol = int(vals[6]) / 1000.0

                # Create an obj and wait for bulk creation
                h = MyStockHistorical(
                    stock=stock,
                    on=date_stamp,
                    open_price=open_p,
                    high_price=high_p,
                    low_price=low_p,
                    close_price=close_p,
                    vol=vol,
                    adj_close=adj_p,
                )
                records.append(h)

                # bulk creation
                if len(records) >= 1000:
                    MyStockHistorical.objects.bulk_create(records)
                    records = []

        # whatever left in records are to be saved to DB
        if records:
            MyStockHistorical.objects.bulk_create(records)

        # persist
        logger.debug("[%s] complete" % symbol)

    def _convert_to_decimal(self, val):
        try:
            me = Decimal(val)
        except InvalidOperation:
            me = Decimal(-1)
        return me

    def _are_vals_valid(self, symbol, vals):
        """Check vals for some edge conditions.

        Returns:
          :bool: TRUE when vals are good for parsing.
        """
        if not vals:
            # protect from blank line or invalid symbol, eg. China
            # stock symbols logger.debug('not vals')
            logger.error("vals are empty or None")
            return False

        if not reduce(lambda x, y: x and y, vals):
            # any empty string, None will be skipped
            logger.error("not all columns have value")
            return False

        if len(vals) != 7:
            logger.error("[%s] error, %d" % (symbol, len(vals)))
            return False

        elif "Adj" in vals[-2]:
            # this is to skip the column header line
            return False

        return True
