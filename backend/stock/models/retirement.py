# -*- coding: utf-8 -*-
"""Retirement planning models.

A ``RetirementProfile`` holds one user's planning inputs (assumptions). Each
on-demand ``RetirementSnapshot`` captures the inputs + computed results at a
point in time so the user can chart their retirement outlook over time. A
``RetirementHolding`` is a single priced position belonging to a snapshot,
stored in its own table for per-ticker/per-sleeve analysis.

Privacy: real financial values live only in the local DB. Nothing here is seeded
with personal numbers; defaults are generic placeholders.
"""

from django.conf import settings
from django.db import models


def _default_ss_by_claim_age():
    return {"62": 2000.0, "63": 2150.0, "67": 2900.0, "70": 3600.0}


def _default_fed_brackets():
    # (rate, upper_bound) ordered; single filer placeholder.
    return [
        [0.10, 11600],
        [0.12, 47150],
        [0.22, 100525],
        [0.24, 191950],
        [0.32, 243725],
        [0.35, 609350],
        [0.37, None],
    ]


class RetirementProfile(models.Model):
    """One user's retirement planning assumptions."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="retirement_profile",
    )

    # Timeline
    current_age = models.IntegerField(default=50)
    current_year = models.IntegerField(default=2026)
    life_expectancy = models.IntegerField(default=90)
    employment_start = models.DateField(null=True, blank=True)

    # Income
    salary = models.FloatField(default=100_000.0)
    salary_growth = models.FloatField(default=0.025)

    # Pension
    pension_accrual = models.FloatField(default=0.0182)
    pension_vesting_years = models.IntegerField(default=5)
    pension_fas_years = models.IntegerField(default=4)
    pension_cola = models.FloatField(default=0.0)

    # Social Security
    ss_by_claim_age = models.JSONField(default=_default_ss_by_claim_age)
    ss_cola = models.FloatField(default=0.02)

    # Balances / contributions
    ira_balance = models.FloatField(default=300_000.0)
    roth_balance = models.FloatField(default=10_000.0)
    annual_contribution = models.FloatField(default=0.0)
    withdrawal_rate = models.FloatField(default=0.04)

    # NC 401(k)/457 deferred-comp accounts
    nc_401k_balance = models.FloatField(default=50_000.0)
    nc_457_balance = models.FloatField(default=25_000.0)
    nc_annual_contribution = models.FloatField(default=20_000.0)
    nc_blended_return = models.FloatField(default=0.062)
    nc_contrib_grows_with_salary = models.BooleanField(default=True)

    # Market return assumptions / glidepath
    equity_return = models.FloatField(default=0.075)
    bond_return = models.FloatField(default=0.035)
    bond_weight_now = models.FloatField(default=0.10)
    bond_weight_at_retire = models.FloatField(default=0.25)
    bond_weight_in_retirement = models.FloatField(default=0.40)

    # Taxes
    state_tax_rate = models.FloatField(default=0.0425)
    state_taxes_ss = models.BooleanField(default=False)
    standard_deduction = models.FloatField(default=15_000.0)
    fed_brackets = models.JSONField(default=_default_fed_brackets)

    # Allocation inputs
    positions_csv = models.CharField(max_length=512, blank=True, default="")
    skip_accounts = models.JSONField(default=list)
    dc_plans = models.JSONField(default=dict)

    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-last_updated"]

    def __str__(self):
        return f"RetirementProfile({self.user.username})"


class RetirementSnapshot(models.Model):
    """An on-demand, point-in-time capture of inputs + computed results."""

    profile = models.ForeignKey(
        RetirementProfile,
        on_delete=models.CASCADE,
        related_name="snapshots",
    )
    taken_at = models.DateTimeField(auto_now_add=True)
    label = models.CharField(max_length=128, blank=True, default="")

    # Frozen copy of the inputs used and the results produced.
    inputs = models.JSONField(default=dict)
    results = models.JSONField(default=dict)

    class Meta:
        ordering = ["-taken_at"]

    def __str__(self):
        return f"RetirementSnapshot({self.profile.user.username} @ {self.taken_at:%Y-%m-%d})"


class RetirementHolding(models.Model):
    """A single priced position belonging to a snapshot."""

    SOURCE_LIVE = "live"
    SOURCE_FALLBACK = "fallback"
    SOURCE_CHOICES = [
        (SOURCE_LIVE, "live"),
        (SOURCE_FALLBACK, "fallback"),
    ]

    snapshot = models.ForeignKey(
        RetirementSnapshot,
        on_delete=models.CASCADE,
        related_name="holdings",
    )
    symbol = models.CharField(max_length=32)
    quantity = models.FloatField(default=0.0)
    price = models.FloatField(default=0.0)
    value = models.FloatField(default=0.0)
    sleeve = models.CharField(max_length=64, blank=True, default="")
    source = models.CharField(max_length=16, choices=SOURCE_CHOICES, default=SOURCE_FALLBACK)

    class Meta:
        ordering = ["snapshot", "-value"]
        indexes = [models.Index(fields=["snapshot", "symbol"])]

    def __str__(self):
        return f"{self.symbol}: {self.value:,.2f} ({self.sleeve})"
