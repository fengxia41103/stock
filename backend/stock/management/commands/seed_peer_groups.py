"""Management command to seed default peer groups for all tracked stocks."""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from stock.models.peer_group import PEER_DEFAULTS, PeerGroup
from stock.models.stock import MyStock


class Command(BaseCommand):
    help = "Populate PEER_DEFAULTS for all tracked stocks that have defined peers."

    def add_arguments(self, parser):
        parser.add_argument(
            "--user",
            type=str,
            default="fengxia",
            help="Username to associate peer groups with (default: fengxia)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print what would be created without actually creating",
        )

    def handle(self, *args, **options):
        User = get_user_model()
        try:
            user = User.objects.get(username=options["user"])
        except User.DoesNotExist:
            self.stderr.write(f"User '{options['user']}' not found.")
            return

        dry_run = options["dry_run"]
        total_created = 0
        total_skipped = 0

        tracked_symbols = set(MyStock.objects.values_list("symbol", flat=True))

        for symbol, peers in PEER_DEFAULTS.items():
            if symbol not in tracked_symbols:
                continue

            stock = MyStock.objects.get(symbol=symbol)

            for peer_sym in peers:
                if dry_run:
                    exists = PeerGroup.objects.filter(
                        stock=stock, peer_symbol=peer_sym, user=user
                    ).exists()
                    if exists:
                        total_skipped += 1
                    else:
                        total_created += 1
                        self.stdout.write(f"  Would create: {symbol} → {peer_sym}")
                else:
                    _, created = PeerGroup.objects.get_or_create(
                        stock=stock,
                        peer_symbol=peer_sym,
                        user=user,
                        defaults={"relationship": "competitor"},
                    )
                    if created:
                        total_created += 1
                        self.stdout.write(f"  Created: {symbol} → {peer_sym}")
                    else:
                        total_skipped += 1

        prefix = "[DRY RUN] " if dry_run else ""
        self.stdout.write(
            self.style.SUCCESS(
                f"{prefix}Done. Created: {total_created}, Skipped (existing): {total_skipped}"
            )
        )
