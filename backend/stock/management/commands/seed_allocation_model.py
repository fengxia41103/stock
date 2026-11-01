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
#
# TARGET (revised 2026-11-01): "Aggressive-Diversified" core + satellite, 70/30.
# 90% equity / 10% bonds — stays aggressive for a ~10yr horizon while removing
# the single-factor US-large-growth concentration. Core (~70%) = diversified
# index ETFs; satellite (~30%) = 11 individual conviction names, each capped
# ~$30K. Revised from the 2026-10-30 75/25 cut to RETAIN quality compounders
# (LIN, SPGI, PG, PEP) and TXN (documented analog-duopoly thesis, panning out),
# trimming only PLTR (unplanned one-off win), PDD, SBUX.
#
# target_pct is the WHOLE-PORTFOLIO weight per sleeve (core ETFs + satellite
# stocks both map into these sleeves via SYMBOL_MAP).
DEFAULT_BUCKETS = [
    ("us_large", "US Large Cap", 42.0, 1),
    ("us_mid", "US Mid Cap", 8.0, 2),
    ("us_small", "US Small Cap", 6.0, 3),
    ("intl_dev_large", "International Developed", 20.0, 4),
    ("emerging", "Emerging Markets", 7.0, 5),
    ("bonds_us_ig", "Bonds / Fixed Income", 10.0, 6),
    ("real_assets", "Real Assets / REIT", 4.0, 7),
    ("cash", "Cash / Short Term", 3.0, 8),
]

# Symbol -> sleeve. Covers the retained SATELLITE stocks, the CORE proxy ETFs,
# and names being trimmed (left here for drift classification).
# RETAINED satellite (11): MSFT, MA, V, RCL, GOOGL, TXN, TSM, LIN, SPGI, PEP, PG.
# TRIMMED OUT: PLTR (unplanned one-off), PDD, SBUX. MCD folded into core index.
SYMBOL_MAP = {
    # --- core proxy ETFs ---
    "VOO": "us_large", "SPY": "us_large", "SPYG": "us_large",
    "VO": "us_mid", "VB": "us_small",
    "VEA": "intl_dev_large", "VXUS": "intl_dev_large",
    "VWO": "emerging", "BND": "bonds_us_ig", "BNDX": "bonds_us_ig",
    "VNQ": "real_assets", "TIP": "real_assets",
    # --- retained satellite (conviction names, capped ~$30K each) ---
    "MSFT": "us_large", "GOOGL": "us_large", "MA": "us_large",
    "V": "us_large", "TXN": "us_large", "LIN": "us_large",
    "SPGI": "us_large", "PEP": "us_large", "PG": "us_large",
    "RCL": "us_mid", "TSM": "emerging",
    # --- trimmed / folded to core (classified for drift reporting) ---
    "PLTR": "us_large", "MCD": "us_large",
    "PDD": "emerging", "SBUX": "us_large",
}


class Command(BaseCommand):
    help = "Seed the Aggressive-Diversified target model and classify holdings."

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
            "NOTE: targets = the chosen Aggressive-Diversified plan (2026-10-30): "
            "90% equity / 10% bonds, 70% index core + 30% capped satellite. Edit "
            "AssetClass.target_pct to adjust, then GET /api/v1/portfolio/allocation/ "
            "for drift + rebalance trades."
        )
