import os
import os.path

from celery import chain
from celery import group
from django.core.management.base import BaseCommand

from stock.models import MyStock
from stock.tasks import compute_daily_return_consumer
from stock.tasks import compute_night_day_consistency_consumer
from stock.tasks import compute_nightly_return_consumer
from stock.tasks import compute_trend_consumer


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
            daily_return_sig = group(
                compute_daily_return_consumer.s(s),
                compute_nightly_return_consumer.s(s),
            )
            trend_sig = group(
                compute_night_day_consistency_consumer.s(s),
                compute_trend_consumer.s(s),
            )
            task = chain(daily_return_sig, trend_sig)
            task.apply_async()
