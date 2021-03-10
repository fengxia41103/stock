from celery import shared_task

from fin.tor_handler import PlainUtility
from stock.workers.get_balance_sheet import MyBalanceSheet
from stock.workers.get_cash_flow_statement import MyCashFlowStatement
from stock.workers.get_historical import MyStockHistoricalYahoo
from stock.workers.get_income_statement import MyIncomeStatement
from stock.workers.get_summary import MySummary
from stock.workers.get_valuation_ratio import MyValuationRatio
from stock.workers.strategy_values import DailyReturn
from stock.workers.strategy_values import NightDayCompoundedReturn
from stock.workers.strategy_values import NightDayConsistency
from stock.workers.strategy_values import OvernightReturn
from stock.workers.strategy_values import TwoDailyTrend


@shared_task
def summary_consumer(whatever, symbol):
    crawler = MySummary(symbol)
    crawler.get()


@shared_task
def balance_sheet_consumer(whatever, symbol):
    crawler = MyBalanceSheet(symbol)
    crawler.get()


@shared_task
def income_statement_consumer(whatever, symbol):
    crawler = MyIncomeStatement(symbol)
    crawler.get()


@shared_task
def cash_flow_statement_consumer(whatever, symbol):
    crawler = MyCashFlowStatement(symbol)
    crawler.get()


@shared_task
def valuation_ratio_consumer(whatever, symbol):
    crawler = MyValuationRatio(symbol)
    crawler.get()


@shared_task
def yahoo_consumer(sector, symbol):
    http_agent = PlainUtility()
    crawler = MyStockHistoricalYahoo(http_agent)
    crawler.parser(sector, symbol)


@shared_task
def compute_daily_return_consumer(symbol):
    crawler = DailyReturn(symbol)
    crawler.run(window_length=1)


@shared_task
def compute_nightly_return_consumer(symbol):
    crawler = OvernightReturn(symbol)
    crawler.run(window_length=2)


@shared_task
def compute_night_day_consistency_consumer(whatever, symbol):
    crawler = NightDayConsistency(symbol)
    crawler.run(window_length=1)


@shared_task
def compute_night_day_compounded_return_consumer(whatever, symbol):
    crawler = NightDayCompoundedReturn(symbol)
    crawler.run(window_length=1)


@shared_task
def compute_two_daily_trend_consumer(whatever, symbol):
    crawler = TwoDailyTrend(symbol)
    crawler.run(window_length=2)
