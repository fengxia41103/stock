"""Fetch and store SEC 10-K annual-report metadata for tracked stocks.

Usage:
    python manage.py import_10k                 # all tracked stocks
    python manage.py import_10k --symbol MSFT   # single stock
    python manage.py import_10k --years 5       # last 5 10-Ks per stock

Structured metadata only, from data.sec.gov. Requires SEC_EDGAR_USER_AGENT
env var identifying your app, e.g. "MyApp me@example.com".
"""

from django.core.management.base import BaseCommand

from stock.models import MyStock
from stock.workers.get_10k import Filing10KWorker


class Command(BaseCommand):
    help = "Fetch SEC 10-K metadata from data.sec.gov for tracked stocks"

    def add_arguments(self, parser):
        parser.add_argument(
            "--symbol", type=str, help="Single stock to fetch (default: all tracked)"
        )
        parser.add_argument(
            "--years",
            type=int,
            default=5,
            help="Max number of recent 10-K filings to fetch per stock (default: 5)",
        )

    def handle(self, *args, **options):
        symbol = options.get("symbol")
        years = options["years"]

        if symbol:
            stocks = [symbol]
        else:
            stocks = list(MyStock.objects.values_list("symbol", flat=True))

        self.stdout.write(
            f"Fetching up to {years} 10-K filings for {len(stocks)} stock(s)..."
        )

        total = 0
        failed = 0
        for i, sym in enumerate(stocks):
            try:
                n = Filing10KWorker(sym).get(years=years)
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
                f"\nDone! Stored {total} new 10-K filing(s). {failed} stock(s) failed."
            )
        )
