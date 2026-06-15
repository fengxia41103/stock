# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from stock.models import MyTask


class Command(BaseCommand):
    help = "Purge failed or stale tasks. Use --all to remove all tasks."

    def add_arguments(self, parser):
        parser.add_argument("--all", action="store_true", help="Remove all tasks, not just failures")

    def handle(self, *args, **options):
        if options["all"]:
            count, _ = MyTask.objects.all().delete()
            self.stdout.write(f"Purged all {count} tasks.")
        else:
            count, _ = MyTask.objects.filter(state="FAILURE").delete()
            self.stdout.write(f"Purged {count} failed tasks.")
