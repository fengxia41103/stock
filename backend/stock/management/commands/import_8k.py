"""Fetch and store SEC 8-K current reports for tracked stocks.

Usage:
    python manage.py import_8k                 # all tracked stocks
    python manage.py import_8k --symbol MSFT   # single stock
    python manage.py import_8k --limit 5       # last 5 filings per stock

Requires edgartools and SEC_EDGAR_USER_AGENT env var identifying your app,
e.g. SEC_EDGAR_USER_AGENT="MyApp me@example.com".
"""

from django.core.management.base import BaseCommand

from stock.models import MyStock
from stock.workers.get_8k import Filing8KWorker


class Command(BaseCommand):
    help = "Fetch SEC 8-K current reports from EDGAR for tracked stocks"

    def add_arguments(self, parser):
        parser.add_argument(
            "--symbol", type=str, help="Single stock to fetch (default: all tracked)"
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=10,
            help="Max number of recent 8-K filings to fetch per stock (default: 10)",
        )

    def handle(self, *args, **options):
        symbol = options.get("symbol")
        limit = options["limit"]

        if symbol:
            stocks = [symbol]
        else:
            stocks = list(MyStock.objects.values_list("symbol", flat=True))

        self.stdout.write(
            f"Fetching up to {limit} 8-K filings for {len(stocks)} stock(s)..."
        )

        total = 0
        failed = 0
        for i, sym in enumerate(stocks):
            try:
                n = Filing8KWorker(sym).get(limit=limit)
                total += n
                status = f"+{n} new" if n else "up to date"
                self.stdout.write(f"  [{i+1}/{len(stocks)}] {sym}: {status}")
            except MyStock.DoesNotExist:
                failed += 1
                self.stdout.write(f"  [{i+1}/{len(stocks)}] {sym}: not tracked")
            except Exception as e:
                failed += 1
                self.stdout.write(f"  [{i+1}/{len(stocks)}] {sym}: ERROR - {e}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Stored {total} new 8-K filing(s). {failed} stock(s) failed."
            )
        )
