# Retirement Planner (CLI)

A self-contained retirement-income model. Projects monthly income from Social
Security + a defined-benefit pension + an IRA + employer DC plans (401(k)/457),
with an asset-allocation glidepath, and finds the income-optimal retirement age.

> Planning tool, **not** financial or tax advice. Verify pension rules with your
> plan administrator and Social Security figures at ssa.gov.

## The interactive planner now lives in the app

The web UI has been **migrated into the main stock app** as a first-class,
DB-backed feature. Open the app and go to **Retirement** (route `/retirement`):

- edit your assumptions (saved to your account, never committed),
- compare retirement-age scenarios and see the income-optimal age,
- upload a Fidelity CSV / Empower PDF to reprice holdings against the app's own
  live prices and view household allocation vs target,
- **Save snapshot** on demand and chart your outlook over time under
  **Retirement → History**.

Seed your profile from a private inputs file:

```bash
python manage.py seed_retirement --path /path/to/my_inputs.json
```

The former standalone web server (`server.py` + `index.html`) and its dev-only
Docker service (`:8086`) have been removed. The pure-Python **model and CLI**
below remain for offline/scripted use.

## Your private numbers stay out of git

The code ships with **generic placeholder** defaults only. Put your real figures
in a gitignored `my_inputs.json` next to the scripts — they are never committed.
Copy `my_inputs.example.json` to start, or run the Excel template generator and
fill it in offline.

## Command line

```bash
python3 retirement/retirement_model.py                 # compare 62/67/70
python3 retirement/retirement_model.py --retire-age 67 # year-by-year detail
python3 retirement/retirement_model.py --optimize      # optimal-age sweep
python3 retirement/retirement_model.py --state-tax 0.0 # model a no-tax state
python3 retirement/retirement_model.py --json          # machine-readable
```

## Files
- `retirement_model.py` — the model (core functions + CLI).
- `household_allocation.py` — household IRA + DC-plan allocation analysis.
- `parsers.py` — parse Fidelity CSV / Empower PDF / master JSON uploads.
- `live_prices.py` — fetch live prices from the stock app (token + fallback).
- `reprice.py` — re-price holdings and roll up the household allocation.
- `build_template.py` — generates the Excel input template.
- `my_inputs.example.json` — example inputs (copy to `my_inputs.json`).
- `CONTINUATION_GUIDE.md` — runbook for resuming planning in a later session.

> The in-app version is the canonical implementation (`backend/stock/retirement/`
> + `backend/stock/api/retirement.py` + the `/retirement` React views). These
> standalone modules mirror that logic for offline use.
