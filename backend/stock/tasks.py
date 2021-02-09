from celery import shared_task

from fin.tor_handler import PlainUtility
from stock.workers.get_historical import MyStockHistoricalYahoo
from stock.workers.strategy_values import MyStockDailyReturn


@shared_task
def yahoo_consumer(symbol):
    http_agent = PlainUtility()
    crawler = MyStockHistoricalYahoo(http_agent)
    crawler.parser(symbol)


@shared_task
def compute_daily_return_consumer(symbol):
    crawler = MyStockDailyReturn(symbol)
    crawler.run(2)
