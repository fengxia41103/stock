#!/usr/bin/python
# -*- coding: utf-8 -*-

import datetime
import logging
import random
import string
import unittest
from datetime import timedelta
from decimal import Decimal
from itertools import izip_longest
from unittest import TestCase

import simplejson as json
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from urllib3 import PoolManager
from urllib3 import Retry
from urllib3 import Timeout

# available since 2.26.0


logger = logging.getLogger(__name__)

BROWSER = "chrome"


class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        # handles both date and datetime objects
        if hasattr(obj, "isoformat"):
            return obj.isoformat()
        elif isinstance(obj, Decimal):
            return str(float(obj))
        else:
            return json.JSONEncoder.default(self, obj)


class ParametrizedTestCase(TestCase):
    """TestCase classes that want to be parametrized should
    inherit from this class.
    """

    def __init__(self, methodName="runTest", param=None):
        super(ParametrizedTestCase, self).__init__(methodName)
        self.param = param

    @staticmethod
    def parametrize(testcase_klass, param=None):
        """Create a suite containing all tests taken from the given
        subclass, passing them the parameter 'param'.
        """
        testloader = unittest.TestLoader()
        testnames = testloader.getTestCaseNames(testcase_klass)
        suite = unittest.TestSuite()
        for name in testnames:
            suite.addTest(testcase_klass(name, param=param))
        return suite


class MyDriver:
    def __init__(self):
        if BROWSER.lower() == "ie":
            DesiredCapabilities.INTERNETEXPLORER[
                "ignoreProtectedModeSettings"
            ] = True
            self.driver = webdriver.Ie()
        elif BROWSER.lower() == "chrome":
            self.driver = webdriver.Chrome()
        elif BROWSER.lower() == "firefox":
            self.driver = webdriver.Firefox()
        elif BROWSER.lower() == "htmlunit":
            pass


class MyUtility:
    def __init__(self):
        pass

    def illegal_characters(self, length=1):
        myrg = random.SystemRandom()
        return "".join(myrg.choice(string.punctuation) for _ in range(length))

    def legal_characters(self, length=1):
        myrg = random.SystemRandom()
        return "".join(
            myrg.choice(string.ascii_letters + string.digits)
            for _ in range(length)
        )

    def integers(self, length=1, padding=None):
        myrg = random.SystemRandom()
        tmp = str(
            int("".join(myrg.choice(string.digits) for _ in range(length)))
        )
        if padding:
            return tmp.zfill(int(padding))
        else:
            return tmp

    def floats(self, part_1, part_2):
        if part_2:
            return "%s.%s" % (self.integers(part_1), self.integers(part_2))
        else:
            return "%s" % self.integers(part_1)

    def period_around_today(self, gap=10):
        g = datetime.timedelta(days=gap)
        today = datetime.date(1971, 1, 1).today()
        start = today - g
        end = today + g
        return (start, end)

    def today_plus(self, plus=1):
        g = datetime.timedelta(days=plus)
        today = datetime.date(1971, 1, 1).today()
        return (today + g).strftime("%Y-%m-%d")

    def grouper(self, iterable, n, padvalue=None):
        # grouper('abcdefg', 3, 'x') --> ('a','b','c'), ('d','e','f'),
        # ('g','x','x')
        return list(izip_longest(*[iter(iterable)] * n, fillvalue=padvalue))

    @classmethod
    def sliding_windows(self, start_date, end_date, window_size):
        """Create an array of [(starting date, ending date),] using a sliding
        window specified by `window_size`.

        For example, given starting ate of "2011-1-1" and window size
        10, you get first range of 2010/1/1-2010/1/10, then next is
        2010/1/2-2010/1/11, and so on. The last window in the series
        will be (end_date - 10 days, end_date).

        Args:
          start_date: starting date in ISO format &mdash; `year-month-day`
          end_date: ending date in ISO format
          window_size: number of days

        Returns:
          list: [(date ISO string,date ISO string),]

        """

        delta = end_date - start_date

        sliding_windows = [
            (
                start_date + timedelta(days=i),
                start_date + timedelta(days=i + window_size),
            )
            for i in range(delta.days - window_size)
        ]
        return map(
            lambda x: (x[0].isoformat(), x[1].isoformat()), sliding_windows
        )
