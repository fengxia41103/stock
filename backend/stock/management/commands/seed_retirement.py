# -*- coding: utf-8 -*-

"""Seed a user's RetirementProfile from a private inputs JSON file.

Reads a gitignored ``my_inputs.json`` (the same file the standalone planner
used) and upserts the matching ``RetirementProfile`` columns for a user. Only
whitelisted profile fields are imported — any extra keys (e.g. ``django_token``,
``django_base_url``) are ignored so no secrets land in the DB profile.

The inputs file holds REAL personal numbers and is never committed. Point the
command at it with ``--path``; the default is the standalone tool's location.

Usage:
    python manage.py seed_retirement --path /path/to/my_inputs.json
    python manage.py seed_retirement --user bob --path ./my_inputs.json
"""

import json
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from stock.models import RetirementProfile

User = get_user_model()

# Default location: the standalone planner's gitignored inputs file, relative
# to the repo root (…/backend/stock/management/commands → repo/retirement).
_DEFAULT_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..", "..", "..", "..", "retirement", "my_inputs.json",
    )
)

# Scalar profile columns that may be set directly from matching JSON keys.
_SCALAR_FIELDS = {
    "current_age", "current_year", "life_expectancy",
    "salary", "salary_growth",
    "pension_accrual", "pension_vesting_years", "pension_fas_years",
    "pension_cola",
    "ss_cola",
    "ira_balance", "roth_balance", "annual_contribution", "withdrawal_rate",
    "nc_401k_balance", "nc_457_balance", "nc_annual_contribution",
    "nc_blended_return", "nc_contrib_grows_with_salary",
    "equity_return", "bond_return",
    "bond_weight_now", "bond_weight_at_retire", "bond_weight_in_retirement",
    "state_tax_rate", "state_taxes_ss", "standard_deduction",
    "positions_csv",
}

# JSON object/array fields that map straight through as JSON.
_JSON_FIELDS = {"skip_accounts", "dc_plans", "fed_brackets"}


class Command(BaseCommand):
    help = "Upsert a user's RetirementProfile from a private inputs JSON file."

    def add_arguments(self, parser):
        parser.add_argument("--user", default="fengxia")
        parser.add_argument(
            "--path",
            default=_DEFAULT_PATH,
            help="Path to the private inputs JSON (default: repo/retirement/my_inputs.json).",
        )

    def handle(self, *args, **opts):
        username = opts["user"]
        path = opts["path"]

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f"User '{username}' not found")

        if not os.path.exists(path):
            raise CommandError(
                f"Inputs file not found: {path}\n"
                "Pass --path to point at your private my_inputs.json."
            )

        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
        except ValueError as exc:
            raise CommandError(f"Could not parse JSON: {exc}")
        if not isinstance(data, dict):
            raise CommandError("Inputs JSON root must be an object.")

        defaults = {}

        for key in _SCALAR_FIELDS:
            if key in data and data[key] not in (None, ""):
                defaults[key] = data[key]

        for key in _JSON_FIELDS:
            if key in data and data[key] is not None:
                defaults[key] = data[key]

        # employment_start: keep as an ISO date string; DateField accepts it.
        es = data.get("employment_start")
        if isinstance(es, str) and es:
            defaults["employment_start"] = es

        # ss_by_claim_age: store with string keys (JSONField convention).
        ss = data.get("ss_by_claim_age")
        if isinstance(ss, dict) and ss:
            defaults["ss_by_claim_age"] = {str(k): float(v) for k, v in ss.items()}

        profile, created = RetirementProfile.objects.update_or_create(
            user=user, defaults=defaults
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"{'Created' if created else 'Updated'} RetirementProfile for "
                f"'{username}' from {os.path.basename(path)} "
                f"({len(defaults)} fields set)."
            )
        )
        # Report which fields were set WITHOUT echoing personal values.
        self.stdout.write("Fields set: " + ", ".join(sorted(defaults.keys())))
        skipped = sorted(set(data) - set(defaults) - {"employment_start",
                                                       "ss_by_claim_age"})
        if skipped:
            self.stdout.write(
                "Ignored keys (not profile fields / secrets): "
                + ", ".join(skipped)
            )
