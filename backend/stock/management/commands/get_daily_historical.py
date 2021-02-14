import logging
import os
import os.path

from django.core.management.base import BaseCommand

from stock.tasks import cash_flow_statement_consumer
from stock.tasks import income_statement_consumer
from stock.tasks import yahoo_consumer

SYMBOLS = "VOO,SPY,AAPL,SBUX,MSFT,AMZN,BFAM,VMW,ABNB,RDFN,JNJ,PYPL,AMD,EBAY,TGT,NET,TSM"

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
                    self.dump_symbol(dest, s)
            else:
                self.dump_symbol(dest, symbol)
        else:
            if symbol == "all":
                candidates = SYMBOLS.split(",")
            else:
                candidates = [symbol]

            for symbol in candidates:
                # yahoo_consumer.delay(symbol)
                # income_statement_consumer.delay(symbol)
                cash_flow_statement_consumer.delay(symbol)
