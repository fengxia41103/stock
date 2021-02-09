import os
import os.path

from django.core.management.base import BaseCommand

from stock.models import MyStock
from stock.tasks import compute_daily_return_consumer


class Command(BaseCommand):
    help = "Compute derived meta values such as daily return, relative HL."

    def add_arguments(self, parser):
        parser.add_argument("symbol", help="Symbol or ALL")

    def handle(self, *args, **options):
        self.stdout.write(os.path.dirname(__file__), ending="")

        candidate = options["symbol"].lower()
        if candidate == "all":
            symbols = MyStock.objects.values_list("symbol", flat=True)
        else:
            symbols = [candidate]

        for s in symbols:
            compute_daily_return_consumer.delay(s)
