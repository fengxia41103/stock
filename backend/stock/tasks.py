from celery import shared_task

from fin.tor_handler import PlainUtility
from stock.workers.get_historical import MyStockHistoricalYahoo
from stock.workers.strategy_values import DailyReturn
from stock.workers.strategy_values import NightDayConsistency
from stock.workers.strategy_values import OvernightReturn
from stock.workers.strategy_values import Trend


@shared_task
def yahoo_consumer(symbol):
    http_agent = PlainUtility()
    crawler = MyStockHistoricalYahoo(http_agent)
    crawler.parser(symbol)


@shared_task
def compute_daily_return_consumer(symbol):
    crawler = DailyReturn(symbol)
    crawler.run(window_length=1)


@shared_task
def compute_nightly_return_consumer(symbol):
    crawler = OvernightReturn(symbol)
    crawler.run(window_length=2)


@shared_task
def compute_night_day_consistency_consumer(symbol):
    crawler = NightDayConsistency(symbol)
    crawler.run(window_length=1)


@shared_task
def compute_trend_consumer(symbol):
    crawler = Trend(symbol)
    crawler.run(window_length=2)
