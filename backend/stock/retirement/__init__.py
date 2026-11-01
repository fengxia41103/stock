# -*- coding: utf-8 -*-
"""In-app retirement planning package.

Pure computation lives in ``model``; the Django-facing glue (building
``Assumptions`` from a ``RetirementProfile``) lives in ``service``.
"""

from stock.retirement.model import (
    Assumptions,
    lifetime_metrics,
    optimize_retirement_age,
    project,
    scenario_summary,
    vesting_status,
)
from stock.retirement.service import assumptions_from_profile

__all__ = [
    "Assumptions",
    "assumptions_from_profile",
    "lifetime_metrics",
    "optimize_retirement_age",
    "project",
    "scenario_summary",
    "vesting_status",
]
