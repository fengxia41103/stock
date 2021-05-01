from celery import chain
from celery import group
from celery import shared_task

from fin.tor_handler import PlainUtility
from stock.workers.get_balance_sheet import MyBalanceSheet
from stock.workers.get_cash_flow_statement import MyCashFlowStatement
from stock.workers.get_historical import MyStockHistoricalYahoo
from stock.workers.get_income_statement import MyIncomeStatement
from stock.workers.get_summary import MySummary
from stock.workers.get_valuation_ratio import MyValuationRatio


@shared_task
def __summary_consumer(whatever, symbol):
    crawler = MySummary(symbol)
    crawler.get()


@shared_task(rate_limit="2/m")
def __balance_sheet_consumer(whatever, symbol):
    crawler = MyBalanceSheet(symbol)
    crawler.get()


@shared_task(rate_limit="2/m")
def __income_statement_consumer(whatever, symbol):
    crawler = MyIncomeStatement(symbol)
    crawler.get()


@shared_task(rate_limit="2/m")
def __cash_flow_statement_consumer(whatever, symbol):
    crawler = MyCashFlowStatement(symbol)
    crawler.get()


@shared_task(rate_limit="2/m")
def __valuation_ratio_consumer(whatever, symbol):
    crawler = MyValuationRatio(symbol)
    crawler.get()


@shared_task
def __yahoo_consumer(sector, symbol):
    http_agent = PlainUtility()
    crawler = MyStockHistoricalYahoo(http_agent)
    crawler.parser(sector, symbol)


def batch_update_helper(sector, symbol):

    # get price
    history_sig = __yahoo_consumer.s(sector, symbol)
    summary_compute_sig = __summary_consumer.s(symbol)
    task = chain(history_sig, summary_compute_sig)
    task.apply_async()

    # get statements
    get_statements = chain(
        __balance_sheet_consumer.s(None, symbol),
        __income_statement_consumer.s(symbol),
        __cash_flow_statement_consumer.s(symbol),
        __valuation_ratio_consumer.s(symbol),
    )
    get_statements.apply_async()
