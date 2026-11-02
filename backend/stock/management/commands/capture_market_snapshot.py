# -*- coding: utf-8 -*-

"""Capture a market snapshot (incl. pre-/post-market) on demand.

Examples:
    manage.py capture_market_snapshot
    manage.py capture_market_snapshot --symbols MSFT GOOGL SPYG
"""

from django.core.management.base import BaseCommand

from stock.workers.get_market_snapshot import (
    WORLD_OVERNIGHT,
    MarketSnapshotWorker,
    default_symbols,
)


class Command(BaseCommand):
    help = "Capture a point-in-time market snapshot (pre/regular/post prices)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--symbols",
            nargs="+",
            default=None,
            help="Symbols to snapshot (default: all open-position holdings).",
        )
        parser.add_argument(
            "--world",
            action="store_true",
            help="Capture global overnight proxies (US futures, Asia/Europe "
            "indices, VIX) instead of holdings — the 'wind' for tomorrow's open.",
        )

    def handle(self, *args, **options):
        world = options.get("world")
        if world:
            symbols = WORLD_OVERNIGHT
        else:
            symbols = options.get("symbols") or default_symbols()
        if not symbols:
            self.stdout.write(self.style.WARNING("No symbols to snapshot."))
            return

        worker = MarketSnapshotWorker(symbols, allow_create=world)
        created = worker.capture()

        self.stdout.write(
            self.style.SUCCESS(
                f"Captured {len(created)} snapshot(s) for {len(symbols)} symbol(s)."
            )
        )
        for snap in created:
            # During regular hours show the regular-session change; pre/post
            # otherwise. (overnight_change_pct is only meaningful off-hours.)
            if snap.market_state == "REGULAR":
                chg = snap.regular_change_pct
                tag = "day"
            else:
                chg = snap.overnight_change_pct
                tag = "o/n"
            chg_txt = f"{chg:+.2f}% {tag}" if chg is not None else f"no {tag}"
            self.stdout.write(
                f"  {snap.stock.symbol:6s} {snap.market_state:8s} "
                f"reg={snap.regular_price} {chg_txt}"
            )
