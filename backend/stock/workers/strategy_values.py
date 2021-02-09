# -*- coding: utf-8 -*-
from __future__ import absolute_import

import logging
import time
from abc import ABCMeta
from abc import abstractmethod

from celery import shared_task

from stock.models import MyStock
from stock.models import MyStockHistorical
from stock.models import MyStrategyValue

logger = logging.getLogger("stock")


class MyStockStrategyValue(metaclass=ABCMeta):
    """Abstract model that defines a "run" method
    that can overriden by children class to define
    their own compute_value method, which computes
    the so called index value per strategy.
    """

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def run(self, window_length):
        logger.debug("{} starting".format(self.stock))
        exec_start = time.time()

        records = MyStockHistorical.objects.filter(stock=self.stock).order_by(
            "on"
        )

        # The starting point is depending on how much past data your
        # strategy is calling for.  For example, if we are to
        # calculate 10 weeks of fib score, we need at least 10 weeks
        # of history data.
        if window_length > len(records):
            logger.error("{}: not enough data".format(self.stock))
            return

        for i in range(window_length, len(records)):
            logger.debug("{}: {}/{}".format(self.stock, i, len(records)))

            # set window start and end index.
            # Note: ending index needs `+1` because python [a:b] stops
            # at b-1.
            start = i - window_length + 1
            end = i + 1
            if start < 0:
                continue

            # set T0
            t0 = records[i]

            # sliding window
            # The window is always looking back from t0
            window = records[start:end]

            # compute value
            self.compute_value(t0, window)

        logger.debug(
            "{} completed, elapse {}".format(
                self.stock, time.time() - exec_start
            )
        )

    @abstractmethod
    def compute_value(self, t0, window):
        """Overriden by child class to execute computation."""
        pass


class MyStockDailyReturn(MyStockStrategyValue):
    """Daily return % using adj close.

    % = (today-yesterday)/yesterday
    """

    def __init__(self, symbol):
        super(MyStockDailyReturn, self).__init__(symbol)

    def compute_value(self, t0, window):
        strategy, created = MyStrategyValue.objects.get_or_create(
            hist=t0, method=1
        )

        # compute daily return
        strategy.val = (t0.adj_close - t0.open_price) / t0.open_price * 100
        strategy.save()
