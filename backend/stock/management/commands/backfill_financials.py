"""Backfill financial statements using yfinance for all stocks.

Usage: python manage.py backfill_financials [--symbol MSFT]
"""

from django.core.management.base import BaseCommand

from stock.models import MyStock
from stock.workers.backfill_financials import backfill_financials


class Command(BaseCommand):
    help = "Backfill financial statements (income/balance/cashflow) using yfinance"

    def add_arguments(self, parser):
        parser.add_argument("--symbol", type=str, help="Single stock to backfill (default: all)")

    def handle(self, *args, **options):
        symbol = options.get("symbol")

        if symbol:
            stocks = [symbol]
        else:
            stocks = list(MyStock.objects.values_list("symbol", flat=True))

        self.stdout.write(f"Backfilling financials for {len(stocks)} stocks...")

        total = {"income": 0, "balance": 0, "cashflow": 0}
        for i, sym in enumerate(stocks):
            try:
                result = backfill_financials(sym)
                total["income"] += result["income_created"]
                total["balance"] += result["balance_created"]
                total["cashflow"] += result["cashflow_created"]
                if result["income_created"] or result["balance_created"] or result["cashflow_created"]:
                    self.stdout.write(
                        f"  [{i+1}/{len(stocks)}] {sym}: "
                        f"+{result['income_created']} income, "
                        f"+{result['balance_created']} balance, "
                        f"+{result['cashflow_created']} cashflow"
                    )
                else:
                    self.stdout.write(f"  [{i+1}/{len(stocks)}] {sym}: up to date")
            except Exception as e:
                self.stdout.write(f"  [{i+1}/{len(stocks)}] {sym}: ERROR - {e}")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Created: {total['income']} income + {total['balance']} balance + {total['cashflow']} cashflow records"
        ))
