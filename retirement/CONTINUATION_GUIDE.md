# Retirement Planning — Session Continuation Guide

A runbook for resuming the retirement-planning work in a future AI session.
Contains **no personal numbers** (those live only in the gitignored
`my_inputs.json` / your Excel). Safe to commit.

---

## 0. One-line context for the AI

> "Continue the retirement planning work. The model + UI live in `retirement/`.
> My real numbers are in `retirement/my_inputs.json` (gitignored). Refresh the
> computation, the optimal-age analysis, and the household asset-allocation
> examination against my updated numbers. Keep my private numbers out of git."

---

## 1. Before the session — refresh YOUR numbers (you do this)

Update whichever you prefer; both feed the same model.

**Option A — edit the JSON directly**
- File: `retirement/my_inputs.json`
- Update any of: `salary`, `ira_balance`, `roth_balance`, `nc_401k_balance`,
  `nc_457_balance`, `nc_annual_contribution`, `ss_by_claim_age`, `current_age`,
  etc. See `my_inputs.example.json` for every supported key.
- For the household allocation, also refresh `positions_csv` (path to a fresh
  brokerage export) and the `dc_plans` fund balances.

**Option C — upload in the UI + refresh live prices (easiest for a refresh)**
- Start the stock app (for live prices) and the planner: `python3 retirement/server.py`.
- In the UI, **Upload** your fresh Fidelity `.csv`, Empower `.pdf`, or master
  `.json`. The form fills in automatically.
- Click **🔄 Refresh live prices** to re-price brokerage holdings against the
  app's live prices (recomputes projection + household allocation drift).
- Click **💾 Save to my_inputs.json** to persist. Requires `django_token` /
  `django_base_url` in `my_inputs.json` (or env) for live pricing; falls back to
  statement values if the app is down.

**Option B — use the Excel**
- Generate a blank template: `python3 retirement/build_template.py`
  → `my_inputs_template.xlsx`
- Fill the **Inputs** sheet (column B) and the **DC Plan Funds** sheet.
- In the next session, upload it in the UI (⬆ Upload Excel) OR ask the AI to
  convert it to `my_inputs.json`.

**Fresh source documents to download (re-save privately, not in repo):**
- Brokerage positions CSV (e.g. Fidelity "Portfolio Positions" export).
- Employer DC-plan statement (401(k)/457 provider portal) — current fund balances.
- Latest Social Security estimate from **ssa.gov/myaccount** (the 62/67/70
  monthly figures), since these change with another year of earnings.
- Pension: confirm years of service and the current salary.

---

## 2. During the session — what to ask the AI to do

1. **Recompute scenarios** with the refreshed numbers:
   `python3 retirement/retirement_model.py`
   → retire-age comparison (IRA | NC | Pool | net/mo).
2. **Re-run the optimal-age analysis:**
   `python3 retirement/retirement_model.py --optimize`
   → lifetime-net sweep (nominal + present value); note the PV-optimal age and
   the "PV gained per extra year worked" sweet spot.
3. **Re-examine household asset allocation:**
   `python3 retirement/household_allocation.py`
   → household sleeves vs target + the DC-adjusted brokerage/IRA rebalance.
   Ask: did the mix drift? Does the Fidelity rebalance still hold given the
   current NC 401k/457 balances?
4. **Use the UI if preferred:** `python3 retirement/server.py` → localhost:8099
   (auto-loads `my_inputs.json`; upload Excel to override).

---

## 3. Key assumptions to re-check each time (they go stale)

- **Social Security figures** — re-pull from ssa.gov; they rise with earnings.
- **TSERS pension**: accrual 1.82%, 5-yr vesting, AFC = highest 4 yrs, **ad-hoc
  (≈0%) COLA**, early-retirement reduction below age 65. VERIFY the exact
  early-reduction factor with NC Retirement Systems if retiring before 65.
- **Return assumptions**: model uses conservative equity 7.5% / bond 3.5% on a
  glidepath (bonds 10%→25%→40%), NC plans ~6.2%. Adjust if your view changes.
- **Contributions**: `annual_contribution` (IRA) and `nc_annual_contribution`
  (401k/457) — update if your savings rate changed.
- **State tax**: default NC 4.25% flat (SS exempt). Use `--state-tax 0.0` to
  model a no-income-tax-state move.

---

## 4. Standing findings (carry forward unless numbers change materially)

- Social Security claim age is the biggest lever; delaying toward 70 maximizes
  lifetime value, but **65–67 captures most of it** (first unreduced-pension
  year is 65). Below ~63 leaves significant lifetime income on the table.
- The pension is a small slice (late DHHS start) and is effectively flat
  (no COLA) — treat SS + the invested accounts as the real pillars.
- Household is still heavily US-large-cap concentrated even with the NC plans;
  the Nov-2026 Fidelity rebalance (de-risk SPYG → diversified) stands, with only
  a small reduction in the BND buy since the NC plans already hold bonds.

---

## 5. Privacy rules (do not break)

- NEVER commit `my_inputs.json`, any filled `*.xlsx`, raw statements, or a
  writeup containing real figures. All are gitignored; keep the writeup in
  `~/Documents/retirement-private/` (→ Google Drive).
- The committed code must keep only generic placeholder defaults.
- This is planning analysis, NOT financial or tax advice. Verify with the plan
  administrators, ssa.gov, and a CPA before acting.
