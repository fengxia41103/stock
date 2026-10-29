# -*- coding: utf-8 -*-

"""Seed a placeholder age-appropriate allocation model and classify holdings.

Creates a set of AssetClass buckets with ILLUSTRATIVE target weights (a
balanced "~age 55 / 7-12yr horizon" starting point) and auto-assigns the
user's currently tracked stocks/ETFs into those buckets using a built-in
symbol map. The targets are placeholders — the user (with their advisor)
should edit them to their agreed plan.

This produces analysis, not advice.

Usage:
    python manage.py seed_allocation_model            # user 'fengxia'
    python manage.py seed_allocation_model --user bob
    python manage.py seed_allocation_model --reset     # wipe + recreate
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from stock.models import AssetClass, AssetClassAssignment
from stock.models.portfolio import Position

User = get_user_model()

# Illustrative buckets: (key, label, target_pct, order).
# Rough "balanced growth, pre-retirement" placeholder. ~70% equity / 30% bond+cash.
DEFAULT_BUCKETS = [
    ("us_large", "US Large Cap", 30.0, 1),
    ("us_small_mid", "US Small/Mid Cap", 8.0, 2),
    ("intl_developed", "International Developed", 15.0, 3),
    ("emerging", "Emerging Markets", 7.0, 4),
    ("bonds", "Bonds / Fixed Income", 30.0, 5),
    ("real_assets", "Real Assets (REIT/Commodity)", 3.0, 6),
    ("cash", "Cash", 7.0, 7),
]

# Best-effort symbol -> bucket key map for the user's known holdings.
# Anything not listed is left Unclassified (reported by the API).
SYMBOL_MAP = {
    # US large cap (incl. growth ETF + broad S&P ETF)
    "SPYG": "us_large", "VOO": "us_large",
    "MSFT": "us_large", "GOOGL": "us_large", "PLTR": "us_large",
    "MA": "us_large", "V": "us_large", "SPGI": "us_large",
    "LIN": "us_large", "TXN": "us_large", "PG": "us_large",
    "PEP": "us_large", "MCD": "us_large", "SBUX": "us_large",
    # US mid / cyclical
    "RCL": "us_small_mid",
    # Emerging / intl
    "PDD": "emerging", "TSM": "emerging",
}


class Command(BaseCommand):
    help = "Seed a placeholder allocation model and classify current holdings."

    def add_arguments(self, parser):
        parser.add_argument("--user", default="fengxia")
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing AssetClass/assignments for the user first.",
        )

    def handle(self, *args, **opts):
        username = opts["user"]
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stderr.write(f"User '{username}' not found")
            return

        if opts["reset"]:
            AssetClassAssignment.objects.filter(user=user).delete()
            n2, _ = AssetClass.objects.filter(user=user).delete()
            self.stdout.write(f"Reset: removed assignments + {n2} bucket rows")

        # Create buckets.
        buckets = {}
        for key, label, target, order in DEFAULT_BUCKETS:
            ac, created = AssetClass.objects.update_or_create(
                user=user, key=key,
                defaults={"label": label, "target_pct": target, "order": order},
            )
            buckets[key] = ac
            self.stdout.write(
                f"  {'created' if created else 'updated'} bucket {label} "
                f"(target {target:.0f}%)"
            )

        target_sum = sum(b[2] for b in DEFAULT_BUCKETS)
        self.stdout.write(f"Target sum: {target_sum:.0f}% (edit to taste)")

        # Assign current holdings.
        positions = Position.objects.filter(
            user=user, closed_at__isnull=True, shares__gt=0
        ).select_related("stock")
        assigned = 0
        unmapped = []
        for p in positions:
            key = SYMBOL_MAP.get(p.stock.symbol)
            if not key:
                unmapped.append(p.stock.symbol)
                continue
            AssetClassAssignment.objects.update_or_create(
                user=user, stock=p.stock,
                defaults={"asset_class": buckets[key]},
            )
            assigned += 1

        self.stdout.write(self.style.SUCCESS(
            f"Assigned {assigned} holdings to buckets."
        ))
        if unmapped:
            self.stdout.write(
                f"Unmapped (left Unclassified): {', '.join(sorted(set(unmapped)))}"
            )
        self.stdout.write("")
        self.stdout.write(
            "NOTE: targets are an ILLUSTRATIVE placeholder, not advice. "
            "Edit AssetClass.target_pct to your agreed plan, then GET "
            "/api/v1/portfolio/allocation/ for drift + rebalance trades."
        )
