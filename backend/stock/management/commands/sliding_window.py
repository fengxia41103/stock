import os
import os.path

from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_date

from stock.utility import MyUtility


class Command(BaseCommand):
    help = "Run simulation using sliding window"

    def add_arguments(self, parser):
        parser.add_argument("start", help="Start date")
        parser.add_argument("end", help="End date")

        parser.add_argument("strategy", type=int, help="Strategy to use")

        parser.add_argument("window", type=int, help="Sliding window (days)")

    def handle(self, *args, **options):
        self.stdout.write(os.path.dirname(__file__), ending="")

        # compute slide windows
        sliding_windows = MyUtility.sliding_windows(
            parse_date(options["start"]),
            parse_date(options["end"]),
            options.get("window", 10),
        )
