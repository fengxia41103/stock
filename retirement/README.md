# Retirement Planner

A self-contained retirement-income model. Projects monthly income from Social
Security + a defined-benefit pension + an IRA + employer DC plans (401(k)/457),
with an asset-allocation glidepath, and finds the income-optimal retirement age.

> Planning tool, **not** financial or tax advice. Verify pension rules with your
> plan administrator and Social Security figures at ssa.gov.

No third-party dependencies for the model/server — pure Python 3 standard
library. (The Excel template generator uses `openpyxl`, if you want it.)

> **Resuming planning in a later session?** See
> [`CONTINUATION_GUIDE.md`](CONTINUATION_GUIDE.md) — how to refresh your numbers
> and what to ask the AI to recompute.

## Your private numbers stay out of git

The code ships with **generic placeholder** defaults only. Put your real figures
in a gitignored `my_inputs.json` next to the scripts (or upload an Excel in the
UI) — they are never committed. Copy `my_inputs.example.json` to start, or run
the Excel template generator and fill it in offline.

## Web UI (interactive)

```bash
python3 retirement/server.py            # then open http://localhost:8099
python3 retirement/server.py --port 9000
```

Edit any input (age, salary, SS schedule, IRA, returns, glidepath, tax,
discount), then:
- **Compute** → scenario comparison table (retire at 62 / 65 / 67 / 70).
- **Optimize age** → full age sweep ranked by lifetime after-tax income
  (nominal and present-value), with a chart and the optimal age highlighted.

The page auto-runs both on load with the default assumptions.

### Load latest numbers (live data)

Use the **Upload** control to load current figures from any of three sources:
- **Fidelity `.csv`** (Portfolio Positions export) → brokerage holdings
- **Empower `.pdf`** (401(k)/457 statement) → DC-plan balances
- **Master `.json`** (`my_inputs.json`) → everything

Then:
- **🔄 Refresh live prices** re-prices the brokerage holdings against the stock
  app's live `latest_close_price` (on-demand), recomputes the projection, and
  shows the household allocation drift + a per-ticker table (live vs fallback,
  with an "as of" date). Tickers not tracked by the app or cash sweeps fall back
  to the statement value, clearly flagged.
- **💾 Save to my_inputs.json** persists the current inputs (gitignored).

Live pricing needs the stock Django app running (default
`http://localhost:8083/api/v1`) and an API token. Put `django_base_url` and
`django_token` in `my_inputs.json`, or set `RETIRE_DJANGO_URL` /
`RETIRE_DJANGO_TOKEN`. If the app is down, everything degrades to statement
values — the tool still works.

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
- `server.py` — stdlib HTTP server (compute, optimize, load, refresh, save).
- `index.html` — the single-page UI (vanilla JS, no build step).
- `household_allocation.py` — household IRA + DC-plan allocation analysis.
- `parsers.py` — parse Fidelity CSV / Empower PDF / master JSON uploads.
- `live_prices.py` — fetch live prices from the stock app (token + fallback).
- `reprice.py` — re-price holdings and roll up the household allocation.
- `build_template.py` — generates the Excel input template.
- `my_inputs.example.json` — example inputs (copy to `my_inputs.json`).
- `CONTINUATION_GUIDE.md` — runbook for resuming planning in a later session.
