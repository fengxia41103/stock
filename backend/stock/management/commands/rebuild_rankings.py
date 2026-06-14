# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from stock.models import RankingCache
from stock.management.commands._ranking_helpers import compute_all_rankings


class Command(BaseCommand):
    help = "Rebuild all ranking caches."

    def handle(self, *args, **options):
        results = compute_all_rankings()
        for rank_type, data in results.items():
            RankingCache.objects.update_or_create(
                rank_type=rank_type, defaults={"data": data}
            )
            self.stdout.write(f"  {rank_type}: {len(data)} categories")
        self.stdout.write(self.style.SUCCESS("Rankings rebuilt."))
