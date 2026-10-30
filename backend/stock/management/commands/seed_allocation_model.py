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

# Buckets: (key, label, target_pct, order).
# Source: Fidelity Wealth Services "Aggressive Growth" proposal dated 2026-10-30
# (Feng Managed IRA, $554,754). Sub-asset-class breakdown from the proposal.
# 85% stocks / ~12% bonds / ~1% cash / ~2% other. Edit if the plan changes.
DEFAULT_BUCKETS = [
    ("us_large", "US Large Cap", 38.3, 1),
    ("us_mid", "US Mid Cap", 12.2, 2),
    ("us_small", "US Small Cap", 7.2, 3),
    ("intl_dev_large", "Intl Developed Large Cap", 21.0, 4),
    ("intl_dev_mid", "Intl Developed Mid Cap", 2.3, 5),
    ("emerging", "Emerging Markets", 4.3, 6),
    ("bonds_us_ig", "US Investment-Grade Bonds", 10.6, 7),
    ("bonds_intl", "International Bonds", 0.9, 8),
    ("real_assets", "Real Assets / TIPS / Other", 1.8, 9),
    ("cash", "Cash / Short Term", 0.9, 10),
]

# Best-effort symbol -> bucket key map for the user's known holdings AND the
# ingested asset-class proxy ETFs. Anything not listed is left Unclassified.
SYMBOL_MAP = {
    # --- proxy ETFs (map to the sleeve they represent) ---
    "SPYG": "us_large", "VOO": "us_large", "SPY": "us_large",
    "VB": "us_small", "VEA": "intl_dev_large", "VXUS": "intl_dev_large",
    "VWO": "emerging", "BND": "bonds_us_ig", "BNDX": "bonds_intl",
    "TIP": "real_assets", "TLT": "bonds_us_ig", "VNQ": "real_assets",
    "GLD": "real_assets",
    # --- individual holdings ---
    "MSFT": "us_large", "GOOGL": "us_large", "PLTR": "us_large",
    "MA": "us_large", "V": "us_large", "SPGI": "us_large",
    "LIN": "us_large", "TXN": "us_large", "PG": "us_large",
    "PEP": "us_large", "MCD": "us_large", "SBUX": "us_large",
    "RCL": "us_mid",
    "PDD": "emerging", "TSM": "emerging",
}


class Command(BaseCommand):
    help = "Seed the advisor's allocation model and classify current holdings."

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
            "NOTE: targets reflect the Fidelity Aggressive Growth proposal "
            "(2026-10-30). Edit AssetClass.target_pct if the plan changes, then "
            "GET /api/v1/portfolio/allocation/ for drift + rebalance trades."
        )
