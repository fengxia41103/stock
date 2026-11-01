# Retirement Planner

A self-contained retirement-income model. Projects monthly income from Social
Security + a defined-benefit pension + an IRA + employer DC plans (401(k)/457),
with an asset-allocation glidepath, and finds the income-optimal retirement age.

> Planning tool, **not** financial or tax advice. Verify pension rules with your
> plan administrator and Social Security figures at ssa.gov.

No third-party dependencies for the model/server — pure Python 3 standard
library. (The Excel template generator uses `openpyxl`, if you want it.)

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
- `server.py` — stdlib HTTP server exposing `/api/compute` and `/api/optimize`.
- `index.html` — the single-page UI (vanilla JS, no build step).
