# -*- coding: utf-8 -*-

"""Monitor overnight / world markets on an interval and store snapshots.

A self-contained loop (no Celery beat) so it captures ONLY market snapshots and
does not activate the other periodic jobs. Run it in a terminal while the stack
is up overnight:

    manage.py monitor_overnight                 # world proxies, every 30 min
    manage.py monitor_overnight --interval 15   # every 15 min
    manage.py monitor_overnight --holdings      # snapshot holdings too
    manage.py monitor_overnight --once          # single capture then exit

Stop with Ctrl-C.
"""

import time

from django.core.management.base import BaseCommand
from django.utils import timezone

from stock.workers.get_market_snapshot import (
    WORLD_OVERNIGHT,
    MarketSnapshotWorker,
    default_symbols,
)


class Command(BaseCommand):
    help = "Loop-capture world/overnight market snapshots while the stack is up."

    def add_arguments(self, parser):
        parser.add_argument("--interval", type=int, default=30,
                            help="Minutes between captures (default 30).")
        parser.add_argument("--holdings", action="store_true",
                            help="Also snapshot current holdings each cycle.")
        parser.add_argument("--once", action="store_true",
                            help="Capture once and exit (no loop).")

    def _capture(self):
        world = MarketSnapshotWorker(WORLD_OVERNIGHT, allow_create=True).capture()
        line = f"[{timezone.now():%H:%M}] world: {len(world)} captured"
        return line, world

    def handle(self, *args, **options):
        interval = max(1, options["interval"]) * 60
        also_holdings = options["holdings"]
        once = options["once"]

        self.stdout.write(self.style.SUCCESS(
            f"Overnight monitor started (every {options['interval']} min). Ctrl-C to stop."
        ))
        try:
            while True:
                line, world = self._capture()
                # Quick read from US futures.
                es = next((s for s in world if s.stock.symbol == "ES=F"), None)
                nq = next((s for s in world if s.stock.symbol == "NQ=F"), None)
                if es and nq and es.regular_change_pct is not None:
                    line += (
                        f" | futures S&P {es.regular_change_pct:+.2f}% "
                        f"Nasdaq {nq.regular_change_pct:+.2f}%"
                    )
                if also_holdings:
                    held = MarketSnapshotWorker(default_symbols()).capture()
                    line += f" | holdings: {len(held)}"
                self.stdout.write(line)

                if once:
                    break
                time.sleep(interval)
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("\nStopped."))
