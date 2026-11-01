#!/usr/bin/env python3
"""Generate an Excel input template for the retirement planner.

Produces `my_inputs_template.xlsx` with labeled fields you fill in OFFLINE, then
upload in the UI (or convert to my_inputs.json). The sheet layout maps 1:1 to
the model's input keys so the server can parse it directly.

    python3 retirement/build_template.py              # -> my_inputs_template.xlsx
    python3 retirement/build_template.py --out foo.xlsx

Requires openpyxl (`pip install openpyxl`). The GENERATOR is committed; the
filled-in workbook is yours to keep private (gitignored).
"""

from __future__ import annotations

import argparse
import os

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation

HEAD = Font(bold=True, color="FFFFFF", size=12)
HEAD_FILL = PatternFill("solid", fgColor="2F5496")
SECTION = Font(bold=True, size=11, color="2F5496")
NOTE = Font(italic=True, size=9, color="808080")
WRAP = Alignment(wrap_text=True, vertical="top")

# (key, label, placeholder value, notes). key="" marks a section header.
FIELDS = [
    ("", "PERSONAL", "", ""),
    ("current_age", "Current age", 50, "Your age today."),
    ("current_year", "Current year", 2026, ""),
    ("life_expectancy", "Plan-to age", 90, "Longevity for drawdown planning."),
    ("", "EMPLOYMENT / PENSION", "", ""),
    ("employment_start", "Employment start (YYYY-MM-DD)", "2020-01-01",
     "Date you started the pensionable job."),
    ("salary", "Current salary ($)", 100000, ""),
    ("salary_growth", "Salary growth (decimal)", 0.025, "0.025 = 2.5%/yr."),
    ("pension_accrual", "Pension accrual factor", 0.0182,
     "VERIFY with your plan. e.g. 0.0182 = 1.82%."),
    ("pension_vesting_years", "Pension vesting (years)", 5,
     "No benefit if under; VERIFY."),
    ("pension_cola", "Pension COLA (decimal)", 0.0,
     "0 if ad-hoc/none; set only if guaranteed."),
    ("", "SOCIAL SECURITY (from ssa.gov)", "", ""),
    ("ss_62", "SS monthly if claim at 62 ($)", 2000, ""),
    ("ss_63", "SS monthly if claim at 63 ($)", 2150, ""),
    ("ss_67", "SS monthly if claim at 67 ($)", 2900, "Full retirement age-ish."),
    ("ss_70", "SS monthly if claim at 70 ($)", 3600, "Max."),
    ("ss_cola", "SS COLA (decimal)", 0.02, ""),
    ("", "IRA (rollover / traditional)", "", ""),
    ("ira_balance", "IRA balance ($)", 300000, "Pre-tax."),
    ("roth_balance", "Roth balance ($)", 10000, ""),
    ("annual_contribution", "IRA annual contribution ($)", 0, ""),
    ("withdrawal_rate", "Withdrawal rate (decimal)", 0.04, "0.04 = 4% rule."),
    ("", "EMPLOYER DC PLANS (401k / 457)", "", ""),
    ("nc_401k_balance", "401(k) balance ($)", 50000, ""),
    ("nc_457_balance", "457 balance ($)", 25000, ""),
    ("nc_annual_contribution", "DC annual contribution ($/yr)", 20000,
     "Total you add to 401k+457 per year."),
    ("nc_blended_return", "DC expected return (decimal)", 0.062,
     "Lower if bond-heavy."),
    ("", "RETURNS / TAX", "", ""),
    ("equity_return", "Equity expected return (decimal)", 0.075, ""),
    ("bond_return", "Bond expected return (decimal)", 0.035, ""),
    ("state_tax_rate", "State income tax rate (decimal)", 0.0425,
     "0 for no-income-tax states."),
]


def build(out_path: str) -> None:
    wb = Workbook()

    # --- Inputs sheet ---
    ws = wb.active
    ws.title = "Inputs"
    ws.column_dimensions["A"].width = 34
    ws.column_dimensions["B"].width = 16
    ws.column_dimensions["C"].width = 48
    ws.column_dimensions["D"].width = 18  # hidden key column

    # header row
    for col, text in zip("ABC", ["Field", "Your value", "Notes"]):
        c = ws.cell(row=1, column="ABC".index(col) + 1, value=text)
        c.font = HEAD
        c.fill = HEAD_FILL
    ws["D1"] = "key (do not edit)"
    ws["D1"].font = NOTE

    r = 2
    for key, label, value, notes in FIELDS:
        if key == "":
            cell = ws.cell(row=r, column=1, value=label)
            cell.font = SECTION
            ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=3)
            r += 1
            continue
        ws.cell(row=r, column=1, value=label)
        ws.cell(row=r, column=2, value=value)
        n = ws.cell(row=r, column=3, value=notes)
        n.font = NOTE
        n.alignment = WRAP
        ws.cell(row=r, column=4, value=key)  # machine key for parsing
        r += 1
    ws.column_dimensions["D"].hidden = True

    # --- DC Plans sheet (fund-level balances for the household allocation) ---
    dc = wb.create_sheet("DC Plan Funds")
    dc.column_dimensions["A"].width = 14
    dc.column_dimensions["B"].width = 30
    dc.column_dimensions["C"].width = 16
    for col, text in zip("ABC", ["Plan (401k/457)", "Fund name", "Balance ($)"]):
        c = dc.cell(row=1, column="ABC".index(col) + 1, value=text)
        c.font = HEAD
        c.fill = HEAD_FILL
    example_rows = [
        ("401k", "NC International Fund", 20000),
        ("401k", "NC Large Cap Index Fund", 18000),
        ("401k", "NC Fixed Income Fund", 12000),
        ("457", "NC Large Cap Index Fund", 15000),
        ("457", "NC Fixed Income Fund", 10000),
    ]
    for i, (plan, fund, bal) in enumerate(example_rows, start=2):
        dc.cell(row=i, column=1, value=plan)
        dc.cell(row=i, column=2, value=fund)
        dc.cell(row=i, column=3, value=bal)
    dv = DataValidation(type="list", formula1='"401k,457"', allow_blank=True)
    dc.add_data_validation(dv)
    dv.add(f"A2:A200")

    # --- Readme sheet ---
    rm = wb.create_sheet("Readme")
    rm.column_dimensions["A"].width = 100
    lines = [
        "RETIREMENT PLANNER — input template",
        "",
        "1. Fill in column B on the 'Inputs' sheet with your real numbers.",
        "2. (Optional) On 'DC Plan Funds', list each 401k/457 fund + balance for",
        "   the household-allocation analysis.",
        "3. Save the file. In the planner UI, click 'Upload Excel' and pick it.",
        "   The form fills in and computes automatically.",
        "",
        "Privacy: this filled workbook contains YOUR private numbers. Keep it",
        "out of any shared repo (save to Google Drive, etc.). The planner never",
        "stores it; it only reads the values to compute in your browser/session.",
        "",
        "Planning tool, NOT financial or tax advice. Verify pension rules with",
        "your plan administrator and Social Security figures at ssa.gov.",
    ]
    for i, line in enumerate(lines, start=1):
        c = rm.cell(row=i, column=1, value=line)
        if i == 1:
            c.font = Font(bold=True, size=13, color="2F5496")

    wb.save(out_path)
    print(f"Wrote {out_path}")


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    p = argparse.ArgumentParser(description="Generate the Excel input template")
    p.add_argument("--out", default=os.path.join(here, "my_inputs_template.xlsx"))
    args = p.parse_args()
    build(args.out)


if __name__ == "__main__":
    main()
