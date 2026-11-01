#!/usr/bin/env python3
"""Retirement income planning model.

Projects year-by-year retirement income from four sources, kept as separate
accounts:
  1. Social Security   (claim-age schedule, supply figures from ssa.gov)
  2. Pension           (DB formula: final-avg-salary * accrual * years / 12)
  3. Rollover/trad IRA (compounds on an equity/bond GLIDEPATH, then drawn down)
  4. Employer DC plans (e.g. 401(k)/457, own return + ongoing contributions)

The IRA return is driven by an equity/bond glidepath that de-risks (raises the
bond weight) as retirement approaches.

This is a PLANNING model, NOT financial or tax advice. Verify the pension
accrual factor and vesting with your plan administrator, and your Social
Security figures at ssa.gov. Tax math is a simplified estimate.

Your REAL numbers are read from a gitignored `my_inputs.json` (or supplied via
the UI / Excel upload); the defaults in this file are generic placeholders so
no personal data lives in the repo.

Usage:
    python3 retirement_model.py                 # default scenarios
    python3 retirement_model.py --json          # machine-readable output
    python3 retirement_model.py --retire-age 67 # single scenario detail table
    python3 retirement_model.py --optimize      # optimal-age sweep
"""

from __future__ import annotations

import argparse
import json
import os
from dataclasses import dataclass, field, asdict
from datetime import date


# ---------------------------------------------------------------------------
# INPUTS — edit these to match your confirmed numbers
# ---------------------------------------------------------------------------


@dataclass
class Assumptions:
    """Generic, non-personal defaults. Real values come from my_inputs.json
    (gitignored) or the UI / Excel upload. Edit nothing here for your own
    numbers — put them in my_inputs.json so they stay out of version control."""

    # --- Personal (generic placeholders) ---
    current_age: int = 50
    current_year: int = 2026
    life_expectancy: int = 90  # plan-to age for drawdown longevity

    # --- Employment / pension (state DB-pension, TSERS-style formula) ---
    employment_start: date = date(2020, 1, 1)
    salary: float = 100_000.0
    salary_growth: float = 0.025  # annual raise assumption
    # Pension = final_avg_salary * accrual_factor * years_of_service / 12 (monthly)
    # Accrual/vesting are plan-specific — VERIFY with your plan administrator.
    pension_accrual: float = 0.0182
    pension_vesting_years: int = 5  # no benefit if under; VERIFY.
    # Final-average-salary basis: highest N consecutive years.
    pension_fas_years: int = 4

    # --- Social Security (from ssa.gov; you supply) ---
    ss_by_claim_age: dict = field(
        default_factory=lambda: {62: 2000.0, 63: 2150.0, 67: 2900.0, 70: 3600.0}
    )
    ss_cola: float = 0.02  # assumed annual cost-of-living adjustment

    # Many public DB-pension COLAs are AD HOC (legislature must act) and have
    # been near-zero — so default the pension to FLAT nominal (loses purchasing
    # power to inflation). Set >0 only if your plan has a guaranteed COLA.
    pension_cola: float = 0.0

    # --- IRA (rollover / traditional, pre-tax) ---
    ira_balance: float = 300_000.0
    roth_balance: float = 10_000.0
    annual_contribution: float = 0.0  # set if still contributing
    withdrawal_rate: float = 0.04  # sustainable draw once retired (4% rule)

    # --- Employer DC plans (e.g. 401(k) + 457) — SEPARATE accounts ---
    # Pre-tax. Kept distinct from the IRA; they grow on their OWN (typically
    # more conservative) mix, with ongoing contributions while working.
    nc_401k_balance: float = 50_000.0
    nc_457_balance: float = 25_000.0
    nc_annual_contribution: float = 20_000.0
    nc_blended_return: float = 0.062  # more conservative (bond-heavier) mix
    nc_contrib_grows_with_salary: bool = True  # contributions scale with pay

    # --- Asset allocation glidepath ---
    # Expected TOTAL-return assumptions. Deliberately conservative for a
    # multi-decade forward plan.
    equity_return: float = 0.075  # long-run nominal equity total return
    bond_return: float = 0.035
    # Glidepath: bond weight rises as retirement approaches.
    bond_weight_now: float = 0.10
    bond_weight_at_retire: float = 0.25
    bond_weight_in_retirement: float = 0.40  # de-risk further once drawing down

    # --- Taxes (simplified estimate) ---
    # Federal: single-filer bracket approximation on taxable income.
    # State: flat income-tax placeholder; SS assumed not state-taxed.
    state_tax_rate: float = 0.0425
    state_taxes_ss: bool = False
    standard_deduction: float = 15_000.0  # single; +extra once 65 (approx)
    fed_brackets: tuple = (
        (0.0, 0.10),
        (11_925.0, 0.12),
        (48_475.0, 0.22),
        (103_350.0, 0.24),
        (197_300.0, 0.32),
        (250_525.0, 0.35),
        (626_350.0, 0.37),
    )


# Fields the web UI is allowed to override (whitelist, with target types).
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

# Private, gitignored file holding the user's REAL numbers. Never committed.
MY_INPUTS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                              "my_inputs.json")


def load_my_inputs(path=MY_INPUTS_PATH):
    """Load the user's private numbers from a gitignored JSON file, if present.
    Returns {} when absent so the tool runs with generic placeholders."""
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, ValueError):
        return {}


def assumptions_from(overrides=None, use_my_inputs=True):
    """Build Assumptions, applying a whitelisted, type-coerced overrides dict.

    Layering (later wins): generic defaults  <  my_inputs.json (private)  <
    explicit `overrides` (e.g. from the UI / Excel upload). Used by both the CLI
    and the web server. my_inputs.json keeps real data out of the repo.
    """
    merged = {}
    if use_my_inputs:
        merged.update(load_my_inputs())
    if overrides:
        merged.update(overrides)

    a = Assumptions()
    if not merged:
        return a
    for key, caster in _OVERRIDABLE.items():
        if key in merged and merged[key] not in (None, ""):
            try:
                setattr(a, key, caster(merged[key]))
            except (TypeError, ValueError):
                pass  # ignore malformed field, keep default
    # Employment start date (YYYY-MM-DD string)
    es = merged.get("employment_start")
    if isinstance(es, str) and es:
        try:
            a.employment_start = date.fromisoformat(es)
        except ValueError:
            pass
    # Social Security schedule (dict of claim-age -> monthly)
    ss = merged.get("ss_by_claim_age")
    if isinstance(ss, dict) and ss:
        try:
            a.ss_by_claim_age = {int(k): float(v) for k, v in ss.items()}
        except (TypeError, ValueError):
            pass
    return a


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
    # salary in the final year before retiring
    final_year_salary = a.salary * (1 + a.salary_growth) ** max(0, years_from_now - 1)
    # average the last fas_years leading up to retirement
    sals = [
        a.salary * (1 + a.salary_growth) ** max(0, years_from_now - 1 - k)
        for k in range(a.pension_fas_years)
    ]
    return sum(sals) / len(sals) if sals else final_year_salary


def unreduced_eligible(a: Assumptions, retire_age: int, svc: float) -> bool:
    """UNREDUCED service retirement (TSERS-style public DB-pension rules):
      - age 65 with >=5 yrs, OR
      - age 60 with >=25 yrs, OR
      - >=30 yrs at any age.
    """
    return (
        (retire_age >= 65 and svc >= 5)
        or (retire_age >= 60 and svc >= 25)
        or (svc >= 30)
    )


def early_reduction_factor(a: Assumptions, retire_age: int, svc: float) -> float:
    """Approximate early-retirement reduction when vested but NOT yet
    unreduced-eligible. The plan reduces by a schedule based on how far you are
    from the nearest unreduced milestone; exact factors are set by the plan's
    actuary. This uses ~5%/yr short of the age-65 milestone as a planning
    approximation (VERIFY exact factor with NC Retirement Systems).
    """
    if unreduced_eligible(a, retire_age, svc):
        return 1.0
    # nearest realistic milestone for a late-career starter is age 65 w/ 5 yrs
    years_short = max(0, 65 - retire_age)
    return max(0.0, 1.0 - 0.05 * years_short)


def monthly_pension(a: Assumptions, retire_age: int) -> tuple[float, bool, float]:
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
    # Single-filer provisional-income thresholds (approx, static).
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


def project(a: Assumptions, retire_age: int) -> list[YearRow]:
    rows: list[YearRow] = []
    ira = a.ira_balance
    nc = a.nc_401k_balance + a.nc_457_balance  # NC 401k + 457, tracked together
    pension_m, vested, _rf = monthly_pension(a, retire_age)
    ss_claim_m = ss_monthly_at_claim(a, retire_age)  # claim at retirement
    years_total = a.life_expectancy - a.current_age

    for i in range(years_total + 1):
        age = a.current_age + i
        year = a.current_year + i
        retired = age >= retire_age
        bond_w = glide_bond_weight(a, age, retire_age)
        exp_r = blended_return(a, bond_w)

        # Grow accounts for the year first (start-of-year balance compounds).
        if not retired:
            ira = ira * (1 + exp_r) + a.annual_contribution
            # NC 401k/457: own return + ongoing contributions (scale w/ salary).
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
            # SS grows with COLA after claiming
            ss_annual = ss_claim_m * 12 * (1 + a.ss_cola) ** years_retired
            # Pension: many public-plan COLAs are ad hoc (default 0% => flat nominal).
            pension_annual = pension_m * 12 * (1 + a.pension_cola) ** years_retired
            # Withdraw first (start-of-year), then grow remainder
            ira_draw = ira * a.withdrawal_rate
            ira = (ira - ira_draw) * (1 + exp_r)
            # NC accounts draw at the same rate, grow on their own return.
            nc_draw = nc * a.withdrawal_rate
            nc = (nc - nc_draw) * (1 + a.nc_blended_return)

        gross = ss_annual + pension_annual + ira_draw + nc_draw

        # --- Taxes (simplified) ---
        # Pre-tax IRA + NC 401k/457 + pension are all ordinary income.
        ordinary = pension_annual + ira_draw + nc_draw
        provisional = ordinary + 0.5 * ss_annual
        ss_taxable = ss_annual * taxable_ss_fraction(provisional, ordinary)
        fed_taxable = ordinary + ss_taxable
        fed = federal_tax(a, fed_taxable) if retired else 0.0
        # State: NC flat, excludes SS
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
# REPORTING
# ---------------------------------------------------------------------------


def money(x: float) -> str:
    return f"${x:,.0f}"


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


def print_scenarios(a: Assumptions, ages: list[int]) -> None:
    print("=" * 78)
    print("RETIREMENT INCOME MODEL — scenario comparison")
    print(f"Current age {a.current_age} ({a.current_year}) | "
          f"salary {money(a.salary)} +{a.salary_growth:.1%}/yr | "
          f"IRA {money(a.ira_balance)} | "
          f"NC 401k/457 {money(a.nc_401k_balance + a.nc_457_balance)} "
          f"(+{money(a.nc_annual_contribution)}/yr)")
    print(f"Allocation glidepath: bonds {a.bond_weight_now:.0%} now -> "
          f"{a.bond_weight_at_retire:.0%} at retirement -> "
          f"{a.bond_weight_in_retirement:.0%} drawing down")
    print(f"Expected return: IRA equity {a.equity_return:.1%} / bond "
          f"{a.bond_return:.1%} on glidepath; NC plans {a.nc_blended_return:.1%}")
    print("=" * 94)

    hdr = (f"{'Retire':>6} {'Svc':>4} {'Vest':>5} {'IRA':>11} {'NC':>10} "
           f"{'Pool':>11} {'SS/mo':>7} {'Pens/mo':>8} {'Net/mo':>8}")
    print(hdr)
    print("-" * 94)
    for age in ages:
        s = scenario_summary(a, age)
        print(f"{age:>6} {s['years_of_service']:>4.0f} "
              f"{'yes' if s['pension_vested'] else 'NO':>5} "
              f"{money(s['ira_at_retirement']):>11} "
              f"{money(s['nc_at_retirement']):>10} "
              f"{money(s['retirement_pool_at_retirement']):>11} "
              f"{money(s['ss_monthly_at_claim']):>7} "
              f"{money(s['pension_monthly']):>8} "
              f"{money(s['first_year_net_monthly']):>8}")
    print("-" * 94)
    print("Pool = IRA + NC 401k/457 (separate accounts, summed). "
          "Net = after fed + NC tax; SS untaxed by NC.")
    print("Net is FIRST full retirement year; grows with SS COLA after.")


def print_detail(a: Assumptions, retire_age: int) -> None:
    s = scenario_summary(a, retire_age)
    print("=" * 96)
    print(f"DETAIL — retire at {retire_age} ({s['retire_year']})  |  "
          f"service {s['years_of_service']}y vested={s['pension_vested']}  |  "
          f"pension {money(s['pension_monthly'])}/mo  SS {money(s['ss_monthly_at_claim'])}/mo")
    print("=" * 96)
    cols = (f"{'Year':>4} {'Age':>3} {'R':>1} {'IRA bal':>12} {'bondW':>5} "
            f"{'ret%':>5} {'SS':>9} {'Pension':>9} {'IRA draw':>9} "
            f"{'Gross':>10} {'Tax':>9} {'Net/mo':>9}")
    print(cols)
    print("-" * 96)
    for r in s["rows"]:
        if r["age"] % 1 == 0:
            print(f"{r['year']:>4} {r['age']:>3} {'R' if r['retired'] else '.':>1} "
                  f"{money(r['ira_balance']):>12} {r['bond_weight']:>5.2f} "
                  f"{r['exp_return']*100:>5.1f} {money(r['ss_annual']):>9} "
                  f"{money(r['pension_annual']):>9} {money(r['ira_draw_annual']):>9} "
                  f"{money(r['gross_annual']):>10} "
                  f"{money(r['fed_tax']+r['state_tax']):>9} "
                  f"{money(r['net_monthly']):>9}")


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


def optimize_retirement_age(a: Assumptions, lo: int, hi: int,
                            discount: float) -> dict:
    """Sweep retirement ages; identify the age that maximizes present-value
    lifetime net income (the economically 'optimal' claim/retire age), and the
    age that maximizes nominal lifetime net. Returns full sweep + picks."""
    sweep = [lifetime_metrics(a, age, discount) for age in range(lo, hi + 1)]
    best_pv = max(sweep, key=lambda m: m["lifetime_net_pv"])
    best_nom = max(sweep, key=lambda m: m["lifetime_net_nominal"])
    # Efficiency: present-value net gained per extra working year vs earliest age
    base = sweep[0]
    for m in sweep:
        extra_years = m["working_years_added"] - base["working_years_added"]
        gain = m["lifetime_net_pv"] - base["lifetime_net_pv"]
        m["pv_gain_vs_earliest"] = round(gain)
        m["pv_gain_per_extra_year"] = round(gain / extra_years) if extra_years else 0
    return {"sweep": sweep, "best_pv": best_pv, "best_nominal": best_nom,
            "discount_rate": discount}


def print_optimize(a: Assumptions, lo: int, hi: int, discount: float) -> None:
    res = optimize_retirement_age(a, lo, hi, discount)
    print("=" * 92)
    print("OPTIMAL RETIREMENT AGE — lifetime net income sweep")
    print(f"Plan-to age {a.life_expectancy} | discount {discount:.1%}/yr "
          f"(for present-value) | net = after fed+NC tax")
    print("=" * 92)
    hdr = (f"{'Age':>4} {'WorkYrs':>7} {'RetYrs':>6} {'Unred':>5} "
           f"{'1stYr Net/mo':>12} {'Lifetime Net':>14} {'PV Lifetime':>13} "
           f"{'PV/ExtraYr':>11}")
    print(hdr)
    print("-" * 92)
    for m in res["sweep"]:
        star = " *" if m["retire_age"] == res["best_pv"]["retire_age"] else "  "
        print(f"{m['retire_age']:>4} {m['working_years_added']:>7} "
              f"{m['retirement_years']:>6} "
              f"{'yes' if m['pension_unreduced'] else 'no':>5} "
              f"{money(m['first_year_net_monthly']):>12} "
              f"{money(m['lifetime_net_nominal']):>14} "
              f"{money(m['lifetime_net_pv']):>13} "
              f"{money(m['pv_gain_per_extra_year']):>11}{star}")
    print("-" * 92)
    bp = res["best_pv"]
    bn = res["best_nominal"]
    print(f"* Optimal by PRESENT VALUE: retire at {bp['retire_age']} "
          f"(PV lifetime net {money(bp['lifetime_net_pv'])})")
    print(f"  Optimal by NOMINAL total: retire at {bn['retire_age']} "
          f"(total net {money(bn['lifetime_net_nominal'])})")
    print("  PV/ExtraYr = present-value net gained per extra year worked vs the "
          "earliest age.\n  When that drops below what a year of your time is "
          "worth to you, stop working.")


def main() -> None:
    p = argparse.ArgumentParser(description="Retirement income planning model")
    p.add_argument("--retire-age", type=int, help="single-scenario detail table")
    p.add_argument("--json", action="store_true", help="JSON output")
    p.add_argument("--ages", type=int, nargs="+", default=[62, 67, 70],
                   help="scenario ages to compare")
    p.add_argument("--optimize", action="store_true",
                   help="sweep ages and find the optimal retirement age")
    p.add_argument("--opt-range", type=int, nargs=2, default=[58, 72],
                   metavar=("LO", "HI"), help="age range for --optimize")
    p.add_argument("--discount", type=float, default=0.03,
                   help="discount rate for present-value optimization")
    p.add_argument("--state-tax", type=float, help="override state tax rate (e.g. 0.0)")
    args = p.parse_args()

    a = assumptions_from()
    if args.state_tax is not None:
        a.state_tax_rate = args.state_tax

    if args.json:
        if args.optimize:
            out = optimize_retirement_age(a, args.opt_range[0],
                                          args.opt_range[1], args.discount)
        else:
            out = {
                "assumptions": {k: (v.isoformat() if isinstance(v, date) else v)
                                for k, v in asdict(a).items()},
                "scenarios": [scenario_summary(a, age) for age in args.ages],
            }
        print(json.dumps(out, indent=2, default=str))
        return

    if args.optimize:
        print_optimize(a, args.opt_range[0], args.opt_range[1], args.discount)
    elif args.retire_age:
        print_detail(a, args.retire_age)
    else:
        print_scenarios(a, args.ages)


if __name__ == "__main__":
    main()
