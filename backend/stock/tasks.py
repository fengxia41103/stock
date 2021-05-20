from celery import chain
from celery.schedules import crontab

from fin.celery import app
from fin.tor_handler import PlainUtility
from stock.models import MyStock
from stock.workers.get_balance_sheet import MyBalanceSheet
from stock.workers.get_cash_flow_statement import MyCashFlowStatement
from stock.workers.get_historical import MyStockHistoricalYahoo
from stock.workers.get_income_statement import MyIncomeStatement
from stock.workers.get_news import MyNewsWorker
from stock.workers.get_summary import MySummary
from stock.workers.get_valuation_ratio import MyValuationRatio


@app.task
def __summary_consumer(whatever, symbol):
    crawler = MySummary(symbol)
    crawler.get()


@app.task(rate_limit="2/m")
def __balance_sheet_consumer(whatever, symbol):
    crawler = MyBalanceSheet(symbol)
    crawler.get()


@app.task(rate_limit="2/m")
def __income_statement_consumer(whatever, symbol):
    crawler = MyIncomeStatement(symbol)
    crawler.get()


@app.task(rate_limit="2/m")
def __cash_flow_statement_consumer(whatever, symbol):
    crawler = MyCashFlowStatement(symbol)
    crawler.get()


@app.task(rate_limit="2/m")
def __valuation_ratio_consumer(whatever, symbol):
    crawler = MyValuationRatio(symbol)
    crawler.get()


@app.task
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


@app.task
def cron_daily():
    http_agent = PlainUtility()

    for stock in MyStock.objects.all():
        symbol = stock.symbol
        sectors = stock.sectors.all()
        if sectors:
            sector = sectors[0].name
        else:
            sector = "misc"

        # daily price
        MyStockHistoricalYahoo(http_agent).parser(sector, symbol)

        # summary info
        MySummary(symbol).get()

        MyBalanceSheet(symbol).get()
        MyIncomeStatement(symbol).get()
        MyCashFlowStatement(symbol).get()
        MyValuationRatio(symbol).get()


@app.task
def get_news():
    for t in [
        "news",
        "economics",
        "finance",
        "business",
        "politics",
        "tech",
        "science",
        "world",
    ]:
        w = MyNewsWorker(t)
        w.get()


@app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    # Pull daily price at midnight everyday
    sender.add_periodic_task(crontab(hour=0, minute=0), cron_daily.s())

    # Pull news continuously
    sender.add_periodic_task(
        300.0, get_news.s(), name="Get news every 5 minute"
    )
