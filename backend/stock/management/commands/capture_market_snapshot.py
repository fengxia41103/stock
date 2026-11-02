# -*- coding: utf-8 -*-

"""Capture a market snapshot (incl. pre-/post-market) on demand.

Examples:
    manage.py capture_market_snapshot
    manage.py capture_market_snapshot --symbols MSFT GOOGL SPYG
"""

from django.core.management.base import BaseCommand

from stock.workers.get_market_snapshot import MarketSnapshotWorker, default_symbols


class Command(BaseCommand):
    help = "Capture a point-in-time market snapshot (pre/regular/post prices)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--symbols",
            nargs="+",
            default=None,
            help="Symbols to snapshot (default: all open-position holdings).",
        )

    def handle(self, *args, **options):
        symbols = options.get("symbols") or default_symbols()
        if not symbols:
            self.stdout.write(self.style.WARNING("No symbols to snapshot."))
            return

        worker = MarketSnapshotWorker(symbols)
        created = worker.capture()

        self.stdout.write(
            self.style.SUCCESS(
                f"Captured {len(created)} snapshot(s) for {len(symbols)} symbol(s)."
            )
        )
        for snap in created:
            on = snap.overnight_change_pct
            on_txt = f"{on:+.2f}% o/n" if on is not None else "no o/n"
            self.stdout.write(
                f"  {snap.stock.symbol:6s} {snap.market_state:8s} "
                f"reg={snap.regular_price} {on_txt}"
            )
