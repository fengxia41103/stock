# -*- coding: utf-8 -*-
"""Retirement income planning model (pure computation).

Ported from the standalone planner. Projects year-by-year retirement income
from four separate accounts:
  1. Social Security   (claim-age schedule)
  2. Pension           (DB formula: final-avg-salary * accrual * years / 12)
  3. Rollover/trad IRA (equity/bond GLIDEPATH, then drawn down)
  4. Employer DC plans (e.g. 401(k)/457, own return + ongoing contributions)

This module is intentionally free of file IO, CLI and Django imports so it is
trivially unit-testable. ``Assumptions`` is built from a ``RetirementProfile``
by ``assumptions_from_profile`` in ``.service``.

PLANNING model, NOT financial or tax advice.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import date


@dataclass
class Assumptions:
    """Planning assumptions. Generic placeholder defaults; real values come
    from the user's RetirementProfile."""

    # Personal
    current_age: int = 50
    current_year: int = 2026
    life_expectancy: int = 90

    # Employment / pension
    employment_start: date = date(2020, 1, 1)
    salary: float = 100_000.0
    salary_growth: float = 0.025
    pension_accrual: float = 0.0182
    pension_vesting_years: int = 5
    pension_fas_years: int = 4

    # Social Security
    ss_by_claim_age: dict = field(
        default_factory=lambda: {62: 2000.0, 63: 2150.0, 67: 2900.0, 70: 3600.0}
    )
    ss_cola: float = 0.02
    pension_cola: float = 0.0

    # IRA (pre-tax)
    ira_balance: float = 300_000.0
    roth_balance: float = 10_000.0
    annual_contribution: float = 0.0
    withdrawal_rate: float = 0.04

    # Employer DC plans (401k + 457), separate accounts
    nc_401k_balance: float = 50_000.0
    nc_457_balance: float = 25_000.0
    nc_annual_contribution: float = 20_000.0
    nc_blended_return: float = 0.062
    nc_contrib_grows_with_salary: bool = True

    # Glidepath / returns
    equity_return: float = 0.075
    bond_return: float = 0.035
    bond_weight_now: float = 0.10
    bond_weight_at_retire: float = 0.25
    bond_weight_in_retirement: float = 0.40

    # Taxes
    state_tax_rate: float = 0.0425
    state_taxes_ss: bool = False
    standard_deduction: float = 15_000.0
    fed_brackets: tuple = (
        (0.0, 0.10),
        (11_925.0, 0.12),
        (48_475.0, 0.22),
        (103_350.0, 0.24),
        (197_300.0, 0.32),
        (250_525.0, 0.35),
        (626_350.0, 0.37),
    )


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------


def years_of_service(a: Assumptions, retire_year: int) -> float:
    """Completed years of pensionable service at the given retirement year."""
    retire = date(retire_year, a.employment_start.month, a.employment_start.day)
    return max(0.0, (retire - a.employment_start).days / 365.25)


def final_avg_salary(a: Assumptions, retire_age: int) -> float:
    """Average of the highest (final) N years of salary with annual growth."""
    years_from_now = retire_age - a.current_age
    final_year_salary = a.salary * (1 + a.salary_growth) ** max(0, years_from_now - 1)
    sals = [
        a.salary * (1 + a.salary_growth) ** max(0, years_from_now - 1 - k)
        for k in range(a.pension_fas_years)
    ]
    return sum(sals) / len(sals) if sals else final_year_salary


def unreduced_eligible(a: Assumptions, retire_age: int, svc: float) -> bool:
    """UNREDUCED service retirement (TSERS-style): age 65 w/ >=5y, age 60 w/
    >=25y, or >=30y at any age."""
    return (
        (retire_age >= 65 and svc >= 5)
        or (retire_age >= 60 and svc >= 25)
        or (svc >= 30)
    )


def early_reduction_factor(a: Assumptions, retire_age: int, svc: float) -> float:
    """Approximate early-retirement reduction (~5%/yr short of age 65) when
    vested but not yet unreduced-eligible."""
    if unreduced_eligible(a, retire_age, svc):
        return 1.0
    years_short = max(0, 65 - retire_age)
    return max(0.0, 1.0 - 0.05 * years_short)


def monthly_pension(a: Assumptions, retire_age: int):
    """Return (monthly_pension, vested?, reduction_factor)."""
    retire_year = a.current_year + (retire_age - a.current_age)
    svc = years_of_service(a, retire_year)
    vested = svc >= a.pension_vesting_years
    if not vested:
        return 0.0, False, 0.0
    fas = final_avg_salary(a, retire_age)
    rf = early_reduction_factor(a, retire_age, svc)
    annual = fas * a.pension_accrual * svc * rf
    return annual / 12.0, True, rf


def ss_monthly_at_claim(a: Assumptions, claim_age: int) -> float:
    """Interpolate the SS monthly benefit for a claim age from the schedule."""
    sched = a.ss_by_claim_age
    if claim_age in sched:
        return sched[claim_age]
    ages = sorted(sched)
    if claim_age <= ages[0]:
        return sched[ages[0]]
    if claim_age >= ages[-1]:
        return sched[ages[-1]]
    lo = max(x for x in ages if x <= claim_age)
    hi = min(x for x in ages if x >= claim_age)
    frac = (claim_age - lo) / (hi - lo)
    return sched[lo] + frac * (sched[hi] - sched[lo])


def glide_bond_weight(a: Assumptions, age: int, retire_age: int) -> float:
    """Bond weight for a given age along the glidepath."""
    if age >= retire_age:
        return a.bond_weight_in_retirement
    span = retire_age - a.current_age
    if span <= 0:
        return a.bond_weight_at_retire
    frac = (age - a.current_age) / span
    return a.bond_weight_now + frac * (a.bond_weight_at_retire - a.bond_weight_now)


def blended_return(a: Assumptions, bond_w: float) -> float:
    return (1 - bond_w) * a.equity_return + bond_w * a.bond_return


def federal_tax(a: Assumptions, taxable: float) -> float:
    taxable = max(0.0, taxable - a.standard_deduction)
    tax = 0.0
    brackets = a.fed_brackets
    for i, (lo, rate) in enumerate(brackets):
        hi = brackets[i + 1][0] if i + 1 < len(brackets) else float("inf")
        if taxable > lo:
            tax += (min(taxable, hi) - lo) * rate
        else:
            break
    return tax


def taxable_ss_fraction(provisional: float, other_income: float) -> float:
    """Simplified: up to 85% of SS is federally taxable above thresholds."""
    if provisional < 25_000:
        return 0.0
    if provisional < 34_000:
        return 0.5
    return 0.85


# ---------------------------------------------------------------------------
# PROJECTION
# ---------------------------------------------------------------------------


@dataclass
class YearRow:
    year: int
    age: int
    retired: bool
    ira_balance: float
    nc_balance: float
    bond_weight: float
    exp_return: float
    ss_annual: float
    pension_annual: float
    ira_draw_annual: float
    nc_draw_annual: float
    gross_annual: float
    fed_tax: float
    state_tax: float
    net_annual: float
    net_monthly: float


def project(a: Assumptions, retire_age: int):
    rows = []
    ira = a.ira_balance
    nc = a.nc_401k_balance + a.nc_457_balance
    pension_m, vested, _rf = monthly_pension(a, retire_age)
    ss_claim_m = ss_monthly_at_claim(a, retire_age)
    years_total = a.life_expectancy - a.current_age

    for i in range(years_total + 1):
        age = a.current_age + i
        year = a.current_year + i
        retired = age >= retire_age
        bond_w = glide_bond_weight(a, age, retire_age)
        exp_r = blended_return(a, bond_w)

        if not retired:
            ira = ira * (1 + exp_r) + a.annual_contribution
            nc_contrib = a.nc_annual_contribution
            if a.nc_contrib_grows_with_salary:
                nc_contrib *= (1 + a.salary_growth) ** i
            nc = nc * (1 + a.nc_blended_return) + nc_contrib
            ss_annual = 0.0
            pension_annual = 0.0
            ira_draw = 0.0
            nc_draw = 0.0
        else:
            years_retired = age - retire_age
            ss_annual = ss_claim_m * 12 * (1 + a.ss_cola) ** years_retired
            pension_annual = pension_m * 12 * (1 + a.pension_cola) ** years_retired
            ira_draw = ira * a.withdrawal_rate
            ira = (ira - ira_draw) * (1 + exp_r)
            nc_draw = nc * a.withdrawal_rate
            nc = (nc - nc_draw) * (1 + a.nc_blended_return)

        gross = ss_annual + pension_annual + ira_draw + nc_draw

        ordinary = pension_annual + ira_draw + nc_draw
        provisional = ordinary + 0.5 * ss_annual
        ss_taxable = ss_annual * taxable_ss_fraction(provisional, ordinary)
        fed_taxable = ordinary + ss_taxable
        fed = federal_tax(a, fed_taxable) if retired else 0.0
        state_base = ordinary + (ss_annual if a.state_taxes_ss else 0.0)
        state = state_base * a.state_tax_rate if retired else 0.0

        net = gross - fed - state
        rows.append(
            YearRow(
                year=year,
                age=age,
                retired=retired,
                ira_balance=round(ira),
                nc_balance=round(nc),
                bond_weight=round(bond_w, 3),
                exp_return=round(exp_r, 4),
                ss_annual=round(ss_annual),
                pension_annual=round(pension_annual),
                ira_draw_annual=round(ira_draw),
                nc_draw_annual=round(nc_draw),
                gross_annual=round(gross),
                fed_tax=round(fed),
                state_tax=round(state),
                net_annual=round(net),
                net_monthly=round(net / 12),
            )
        )
    return rows


# ---------------------------------------------------------------------------
# REPORTING / METRICS
# ---------------------------------------------------------------------------


def scenario_summary(a: Assumptions, retire_age: int) -> dict:
    rows = project(a, retire_age)
    first_retired = next((r for r in rows if r.retired), None)
    pension_m, vested, rf = monthly_pension(a, retire_age)
    retire_year = a.current_year + (retire_age - a.current_age)
    svc = years_of_service(a, retire_year)
    return {
        "retire_age": retire_age,
        "retire_year": retire_year,
        "years_of_service": round(svc, 1),
        "pension_vested": vested,
        "pension_unreduced": unreduced_eligible(a, retire_age, svc),
        "pension_reduction_factor": round(rf, 3),
        "pension_monthly": round(pension_m),
        "ss_monthly_at_claim": round(ss_monthly_at_claim(a, retire_age)),
        "ira_at_retirement": first_retired.ira_balance if first_retired else None,
        "nc_at_retirement": first_retired.nc_balance if first_retired else None,
        "retirement_pool_at_retirement": (
            first_retired.ira_balance + first_retired.nc_balance
            if first_retired else None
        ),
        "first_year_gross_monthly": round(first_retired.gross_annual / 12)
        if first_retired
        else None,
        "first_year_net_monthly": first_retired.net_monthly
        if first_retired
        else None,
        "rows": [asdict(r) for r in rows],
    }


def lifetime_metrics(a: Assumptions, retire_age: int, discount: float) -> dict:
    """Cumulative net income from retirement to life expectancy, nominal and
    present-value (discounted to today), plus ending IRA balance."""
    rows = project(a, retire_age)
    total_net = 0.0
    pv_net = 0.0
    for r in rows:
        if not r.retired:
            continue
        total_net += r.net_annual
        yrs_from_now = r.age - a.current_age
        pv_net += r.net_annual / (1 + discount) ** yrs_from_now
    ending_ira = rows[-1].ira_balance if rows else 0.0
    retire_years = a.life_expectancy - retire_age + 1
    s = scenario_summary(a, retire_age)
    return {
        "retire_age": retire_age,
        "working_years_added": retire_age - a.current_age,
        "retirement_years": retire_years,
        "lifetime_net_nominal": round(total_net),
        "lifetime_net_pv": round(pv_net),
        "ending_ira": ending_ira,
        "first_year_net_monthly": s["first_year_net_monthly"],
        "pension_unreduced": s["pension_unreduced"],
    }


def optimize_retirement_age(a: Assumptions, lo: int, hi: int, discount: float) -> dict:
    """Sweep retirement ages; identify the age that maximizes present-value
    lifetime net income, and the age that maximizes nominal lifetime net."""
    sweep = [lifetime_metrics(a, age, discount) for age in range(lo, hi + 1)]
    best_pv = max(sweep, key=lambda m: m["lifetime_net_pv"])
    best_nom = max(sweep, key=lambda m: m["lifetime_net_nominal"])
    base = sweep[0]
    for m in sweep:
        extra_years = m["working_years_added"] - base["working_years_added"]
        gain = m["lifetime_net_pv"] - base["lifetime_net_pv"]
        m["pv_gain_vs_earliest"] = round(gain)
        m["pv_gain_per_extra_year"] = round(gain / extra_years) if extra_years else 0
    return {
        "sweep": sweep,
        "best_pv": best_pv,
        "best_nominal": best_nom,
        "discount_rate": discount,
    }
