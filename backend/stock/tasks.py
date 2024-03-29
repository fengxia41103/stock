from datetime import date, timedelta

from celery import chain
from celery.schedules import crontab
from django.contrib.auth.models import User
from django.db import transaction

from fin.celery import app
from fin.tor_handler import PlainUtility
from stock.models import MyNews, MyStock, MyTask
from stock.workers.get_balance_sheet import MyBalanceSheet
from stock.workers.get_cash_flow_statement import MyCashFlowStatement
from stock.workers.get_historical import MyStockHistoricalYahoo
from stock.workers.get_income_statement import MyIncomeStatement
from stock.workers.get_news import MyNewsWorker
from stock.workers.get_summary import MySummary
from stock.workers.get_valuation_ratio import MyValuationRatio


@app.task(queue="summary")
def __summary_consumer(whatever, symbol):
    crawler = MySummary(symbol)
    crawler.get()


@app.task(queue="statement", rate_limit="12/m")
def __balance_sheet_consumer(whatever, symbol):
    crawler = MyBalanceSheet(symbol)
    crawler.get()


@app.task(queue="statement", rate_limit="12/m")
def __income_statement_consumer(whatever, symbol):
    crawler = MyIncomeStatement(symbol)
    crawler.get()


@app.task(queue="statement", rate_limit="12/m")
def __cash_flow_statement_consumer(whatever, symbol):
    crawler = MyCashFlowStatement(symbol)
    crawler.get()


@app.task(queue="summary", rate_limit="12/m")
def __valuation_ratio_consumer(whatever, symbol):
    crawler = MyValuationRatio(symbol)
    crawler.get()


@app.task(queue="price")
def __yahoo_consumer(symbol):
    http_agent = PlainUtility()
    crawler = MyStockHistoricalYahoo(http_agent)
    crawler.parser(symbol)


def batch_update_helper(user, symbol):
    """Helper function to build stock scan tasks.

    Arguments
    ---------

      user: `User`: Requesting user. This will be logged into the task object.
      symbol: string: Stock symbol.

    Return
    ------
      None
    """
    # get price
    get_prices = chain(__yahoo_consumer.s(symbol), __summary_consumer.s(symbol))

    # get statements
    get_statements = chain(
        __balance_sheet_consumer.s(None, symbol),
        __income_statement_consumer.s(symbol),
        __cash_flow_statement_consumer.s(symbol),
        __valuation_ratio_consumer.s(symbol),
    )

    # https://stackoverflow.com/questions/42620917/immediately-access-django-celery-results-taskresult-after-starting
    task_1 = get_prices.apply_async()
    task_2 = get_statements.apply_async()

    # save task
    for task in [task_1, task_2]:
        saved_task = MyTask(id=task.id, state=task.state, user=user)
        saved_task.save()
        saved_task.stocks.add(MyStock.objects.get(symbol=symbol))


@app.task(queue="price")
def price_daily():
    http_agent = PlainUtility()

    for stock in MyStock.objects.all():
        # daily price
        MyStockHistoricalYahoo(http_agent).parser(stock.symbol)


@app.task(queue="statement")
def statement_daily():
    for stock in MyStock.objects.all():
        symbol = stock.symbol

        # summary info
        MySummary(symbol).get()

        MyBalanceSheet(symbol).get()
        MyIncomeStatement(symbol).get()
        MyCashFlowStatement(symbol).get()
        MyValuationRatio(symbol).get()


@app.task(queue="news")
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


@app.task(queue="news")
def remove_old_news():
    """Remove news older than 24 hours.

    There is no point to read old news since I'm not going to process
    them well.
    """
    end = date.today() - timedelta(hours=12)
    MyNews.objects.filter(pub_time__lte=end).delete()


@app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    # Pull daily price at midnight everyday
    sender.add_periodic_task(
        600.0, price_daily.s(), name="Get price every 10 minutes"
    )

    # Pull statement every 24 hours in case there are new ones
    # available
    sender.add_periodic_task(crontab(hour=0, minute=0), statement_daily.s())

    # Pull news continuously
    # sender.add_periodic_task(
    #    300.0, get_news.s(), name="Get news every 5 minute"
    # )

    # Remove news older tha 24 hours
    # sender.add_periodic_task(
    #    3600.0, remove_old_news.s(), name="Remove news older than 24 hours"
    # )
