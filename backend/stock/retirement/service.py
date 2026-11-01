# -*- coding: utf-8 -*-
"""Glue between the Django ``RetirementProfile`` model and the pure
``Assumptions`` dataclass used by the computation model."""

from __future__ import annotations

from datetime import date

from stock.retirement.model import Assumptions


def _coerce_ss(raw) -> dict:
    """ss_by_claim_age is stored as JSON with string keys; coerce to
    {int age: float monthly}."""
    out = {}
    if isinstance(raw, dict):
        for k, v in raw.items():
            try:
                out[int(k)] = float(v)
            except (TypeError, ValueError):
                continue
    return out or {62: 2000.0, 63: 2150.0, 67: 2900.0, 70: 3600.0}


def _coerce_brackets(raw):
    """fed_brackets is stored as JSON list-of-[lo, rate]; coerce to the tuple
    of (lo, rate) pairs the model expects. If malformed, fall back to the
    dataclass default."""
    try:
        pairs = tuple((float(lo), float(rate)) for lo, rate in raw)
        if pairs:
            return pairs
    except (TypeError, ValueError):
        pass
    return Assumptions().fed_brackets


def _coerce_date(raw):
    if isinstance(raw, date):
        return raw
    if isinstance(raw, str) and raw:
        try:
            return date.fromisoformat(raw)
        except ValueError:
            pass
    return Assumptions().employment_start


def assumptions_from_profile(profile, overrides: dict | None = None) -> Assumptions:
    """Build an ``Assumptions`` from a ``RetirementProfile``, optionally layering
    a whitelisted ``overrides`` dict (e.g. from a transient "what-if" request)
    on top.
    """
    a = Assumptions(
        current_age=profile.current_age,
        current_year=profile.current_year,
        life_expectancy=profile.life_expectancy,
        employment_start=_coerce_date(profile.employment_start),
        salary=profile.salary,
        salary_growth=profile.salary_growth,
        pension_accrual=profile.pension_accrual,
        pension_vesting_years=profile.pension_vesting_years,
        pension_fas_years=profile.pension_fas_years,
        ss_by_claim_age=_coerce_ss(profile.ss_by_claim_age),
        ss_cola=profile.ss_cola,
        pension_cola=profile.pension_cola,
        ira_balance=profile.ira_balance,
        roth_balance=profile.roth_balance,
        annual_contribution=profile.annual_contribution,
        withdrawal_rate=profile.withdrawal_rate,
        nc_401k_balance=profile.nc_401k_balance,
        nc_457_balance=profile.nc_457_balance,
        nc_annual_contribution=profile.nc_annual_contribution,
        nc_blended_return=profile.nc_blended_return,
        nc_contrib_grows_with_salary=profile.nc_contrib_grows_with_salary,
        equity_return=profile.equity_return,
        bond_return=profile.bond_return,
        bond_weight_now=profile.bond_weight_now,
        bond_weight_at_retire=profile.bond_weight_at_retire,
        bond_weight_in_retirement=profile.bond_weight_in_retirement,
        state_tax_rate=profile.state_tax_rate,
        state_taxes_ss=profile.state_taxes_ss,
        standard_deduction=profile.standard_deduction,
        fed_brackets=_coerce_brackets(profile.fed_brackets),
    )

    if overrides:
        _apply_overrides(a, overrides)
    return a


# Fields the UI may override for a transient "what-if" compute, with casters.
_OVERRIDABLE = {
    "current_age": int,
    "current_year": int,
    "life_expectancy": int,
    "salary": float,
    "salary_growth": float,
    "pension_accrual": float,
    "pension_vesting_years": int,
    "pension_cola": float,
    "ss_cola": float,
    "ira_balance": float,
    "roth_balance": float,
    "annual_contribution": float,
    "withdrawal_rate": float,
    "nc_401k_balance": float,
    "nc_457_balance": float,
    "nc_annual_contribution": float,
    "nc_blended_return": float,
    "equity_return": float,
    "bond_return": float,
    "bond_weight_now": float,
    "bond_weight_at_retire": float,
    "bond_weight_in_retirement": float,
    "state_tax_rate": float,
    "standard_deduction": float,
}


def _apply_overrides(a: Assumptions, overrides: dict) -> None:
    for key, caster in _OVERRIDABLE.items():
        if key in overrides and overrides[key] not in (None, ""):
            try:
                setattr(a, key, caster(overrides[key]))
            except (TypeError, ValueError):
                pass
    es = overrides.get("employment_start")
    if isinstance(es, str) and es:
        try:
            a.employment_start = date.fromisoformat(es)
        except ValueError:
            pass
    ss = overrides.get("ss_by_claim_age")
    if isinstance(ss, dict) and ss:
        a.ss_by_claim_age = _coerce_ss(ss)
