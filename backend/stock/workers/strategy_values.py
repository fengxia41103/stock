# -*- coding: utf-8 -*-
from __future__ import absolute_import

import logging
import time
from abc import ABC
from abc import abstractmethod
from datetime import date

from stock.models import MyStock
from stock.models import MyStockHistorical
from stock.models import MyStrategyValue

logger = logging.getLogger("stock")


class MyStockStrategyValue(ABC):
    """Abstract class that defines a "run" method
    that can overriden by children class to define
    their own compute_value method, which computes
    the so called index value per strategy.
    """

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def run(self, window_length):
        logger.debug("{} starting".format(self.stock))
        exec_start = time.time()

        # get all possible records
        records = MyStockHistorical.objects.filter(stock=self.stock).order_by(
            "on"
        )
        records = list(records)

        # The starting point is depending on how much past data your
        # strategy is calling for.  For example, if we are to
        # calculate 10 weeks of fib score, we need at least 10 weeks
        # of history data.
        if window_length > len(records):
            logger.error("{}: not enough data".format(self.stock))
            return

        for i in range(len(records)):
            # logger.debug("{}: {}/{}".format(self.stock, i, len(records)))

            # set window start and end index.
            # Note: end is always **me**, or today/t0, where start is
            # in the past!
            end = i + 1
            start = end - window_length

            # set T0
            t0 = records[i]

            # sliding window
            # The window is always looking back from t0.
            # Ending index needs `+1` because list slicing will stop
            # at end-1.
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


class DailyReturn(MyStockStrategyValue):
    """Daily return % using adj close.

    % = (today-yesterday)/yesterday
    """

    def __init__(self, symbol):
        super(DailyReturn, self).__init__(symbol)

    def compute_value(self, t0, window):
        """
        Args
        ----

          :t0: MyStockHistorical
          Represents today/this/me.

          :window: list[MyStockHistorical]
          Represents the data set. For daily, it is [today].
        """
        strategy, created = MyStrategyValue.objects.get_or_create(
            hist=t0, method=1
        )

        # compute daily return
        strategy.val = (t0.close_price - t0.open_price) / t0.open_price * 100
        strategy.save()


class OvernightReturn(MyStockStrategyValue):
    """Overnight return %.

    In general, this is an indicator of after-market
    activities. Without knowing exactly what happened on that day, I'm
    using this as a way to gauge how likely this stock is going to
    behave after market is closed. This can be inferred as:

    - maybe they like to release earning report after market?
    - maybe they like to announce big news avoiding day time?
    - maybe they are in a time zone that their day is always our night?
    - maybe Wall Street likes to _play_ w/ this stock after market
      because all small players are excluded from participation!?

    % = (today's open-yesterday's close)/yesterday's close
    """

    def __init__(self, symbol):
        super(OvernightReturn, self).__init__(symbol)

    def compute_value(self, t0, window):
        """
        Args
        ----

          :t0: MyStockHistorical
          Represents today/this/me.

          :window: list[MyStockHistorical]
          For nightly, it is [t(-1),t0].
        """
        strategy, created = MyStrategyValue.objects.get_or_create(
            hist=t0, method=2
        )

        # if window is [], meaning we don't have enough data set to
        # compute, eg. we are the first data point ever, thus having
        # no _yesterday_ to speak of!
        if not window:
            return

        yesterday = window[0]
        # compute nightly return
        diff = t0.open_price - yesterday.close_price
        strategy.val = diff / yesterday.close_price * 100
        strategy.save()


class NightDayConsistency(MyStockStrategyValue):
    """Today's trend is consistent w/ overnight's.

    If today's trend and last nights' are both positive or
    negative. Once I have this value, I could do some statistics on
    how likely a stock is going to flip trend.

    I have no idea what may drive the flip. Could be news, sentiments,
    or anything. However, as behaviourial pattern, if one stock is
    likely to flip, then I believe there is still something hidden to
    drive this pattern, eg. could be that its CEO is likely to make
    decision at night? or it execs are anxious of negative news, thus
    always eager to flip it to positive asap? Again, pattern has
    drive, just that I may not know why, but this value is to detect
    its results.

    -1: one of the return was 0! This is rare. At least design to
        protect my code.
    1: both trends are consistent;
    0: if trend flipped.

    Note
    ----

    This is depending on we first have computed the daily
    return & overnight return.
    """

    def __init__(self, symbol):
        super(NightDayConsistency, self).__init__(symbol)

    def compute_value(self, t0, window):
        """
        Args
        ----

          :t0: MyStockHistorical
          Represents today/this/me.

          :window: list[MyStockHistorical]
          For this computation, it is [today] only. We are to use this
          to look up its daily return and overnight return.
        """
        strategy, created = MyStrategyValue.objects.get_or_create(
            hist=t0, method=3
        )

        # get daily and overnight return
        daily = MyStrategyValue.objects.get(hist=t0, method=1)
        overnight = MyStrategyValue.objects.get(hist=t0, method=2)

        if daily.val == 0 or overnight.val == 0 or overnight.val == -1:
            # as INVALID or unknown, eg. the first day has no
            # overnight trend.
            strategy.val = -1
        elif (daily.val > 0 and overnight.val > 0) or (
            daily.val < 0 and overnight.val < 0
        ):
            # as TRUE
            strategy.val = 1
        else:
            # as FALSE
            strategy.val = 0

        strategy.save()


class Trend(MyStockStrategyValue):
    """Trend from yesterday to today.

    1: if both days went up.
    2: if both wend down.
    3: if a flip.
    -1: can not determine.
    """

    def __init__(self, symbol):
        super(Trend, self).__init__(symbol)

    def compute_value(self, t0, window):
        """
        Args
        ----

          :t0: MyStockHistorical
          Represents today/this/me.

          :window: list[MyStockHistorical]
          Represents the data set. For this computation, it will be
          [yesterday, today].
        """
        strategy, created = MyStrategyValue.objects.get_or_create(
            hist=t0, method=4
        )
        if not window:
            return

        t0_daily = MyStrategyValue.objects.get(hist=t0, method=1)
        yesterday_daily = MyStrategyValue.objects.get(hist=window[0], method=1)

        if t0_daily.val == -1 or yesterday_daily.val == -1:
            strategy.val = -1
        elif t0_daily.val > 0 and yesterday_daily.val > 0:
            strategy.val = 1
        elif t0_daily.val < 0 and yesterday_daily.val < 0:
            strategy.val = 2
        elif t0_daily.val * yesterday_daily.val < 0:
            strategy.val = 3
        else:
            # Bogus error value that should never occur!
            # Use to catch any computation error.
            strategy.val = -99
        strategy.save()


class RecoveryDelay(MyStockStrategyValue):
    """How long for it to see a new price higher than me.

    Assume I buy at today's open, count forward for a close
    that is GTE me &rarr; the duration in days indicate how long I
    expose to some volatility.

    If it's on a downward curve, this shows how long it can recover.
    If it's on a upward curve, this will be the

    """

    def __init__(self, symbol):
        super(Trend, self).__init__(symbol)

    def compute_value(self, t0, window):
        pass
