import logging
import os
import os.path

from django.core.management.base import BaseCommand

from stock.models import MyStock
from stock.tasks import balance_sheet_consumer
from stock.tasks import cash_flow_statement_consumer
from stock.tasks import income_statement_consumer
from stock.tasks import summary_consumer
from stock.tasks import valuation_ratio_consumer
from stock.tasks import yahoo_consumer

SYMBOLS = """VOO, SPY, AAPL, SBUX, MSFT, AMZN, BFAM, VMW, ABNB, RDFN,
JNJ, PYPL, AMD, EBAY, TGT, NET, TSM, GME, BBBY, AMC, TSLA, SQ, LFC,
BBY, RCL,PLTR,BYD, EDV, ROKU, WMT, RXT, SHOP,BIDU,IQ,CVS, CROC, NOK"""

logger = logging.getLogger("stock")


class Command(BaseCommand):
    help = "Get Yahoo! daily historical data"

    def add_arguments(self, parser):
        parser.add_argument("symbol", help="Stock symbol")

        # Named (optional) arguments
        parser.add_argument(
            "--csv", action="store_true", help="Dump history data to CSV"
        )
        parser.add_argument(
            "--dest", default="./csv", help="Path to put dumped data file"
        )

    def handle(self, *args, **options):
        self.stdout.write(os.path.dirname(__file__), ending="")

        symbol = options["symbol"]

        if options["csv"]:
            dest = options["dest"]
            if symbol == "all":
                for s in SYMBOLS.split(","):
                    self.dump_symbol(dest, s.strip())
            else:
                self.dump_symbol(dest, symbol.strip())
        else:
            if symbol.lower() == "all":
                candidates = [x.strip() for x in SYMBOLS.split(",")]
            else:
                candidates = [symbol]

            # Delete un-monitored stocks
            # MyStock.objects.exclude(symbol__in=candidates).delete()

            # now, get info I want
            for symbol in candidates:
                yahoo_consumer.delay(symbol)
                income_statement_consumer.delay(symbol)
                cash_flow_statement_consumer.delay(symbol)
                valuation_ratio_consumer.delay(symbol)
                balance_sheet_consumer.delay(symbol)
                summary_consumer.delay(symbol)
