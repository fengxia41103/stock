#!/usr/bin/env python3
"""Tiny stdlib HTTP server for the retirement planning UI.

No third-party dependencies — just Python's http.server. Serves:
  GET  /               -> the single-page UI (index.html)
  POST /api/compute    -> {assumptions, ages:[...]}  -> scenario summaries
  POST /api/optimize   -> {assumptions, lo, hi, discount} -> optimal-age sweep

Run:
    python3 retirement/server.py           # http://localhost:8099
    python3 retirement/server.py --port 9000

Endpoints:
  GET  /                 -> the single-page UI (index.html)
  POST /api/compute      -> {assumptions, ages:[...]}  -> scenario summaries
  POST /api/optimize     -> {assumptions, lo, hi, discount} -> optimal-age sweep
  POST /api/upload-excel -> xlsx bytes -> parsed assumptions
  POST /api/load         -> raw file bytes (?type=csv|pdf|json or ?filename=)
                            -> {assumptions, holdings, source, kind}
  POST /api/refresh      -> {holdings, assumptions} -> live re-priced assumptions
                            + allocation + per-ticker price source/as-of
  POST /api/save         -> writes retirement/my_inputs.json (gitignored)

This is a planning tool, not financial advice.
"""

from __future__ import annotations

import argparse
import json
import os
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import retirement_model as rm
import parsers
import live_prices
import reprice

HERE = os.path.dirname(os.path.abspath(__file__))
MY_INPUTS_PATH = os.path.join(HERE, "my_inputs.json")

# Keys allowed into the saved my_inputs.json (keeps arbitrary junk out).
_SAVE_WHITELIST = {
    "current_age", "current_year", "life_expectancy", "employment_start",
    "salary", "salary_growth", "pension_accrual", "pension_vesting_years",
    "pension_cola", "ss_by_claim_age", "ss_cola", "ira_balance",
    "roth_balance", "annual_contribution", "withdrawal_rate",
    "nc_401k_balance", "nc_457_balance", "nc_annual_contribution",
    "nc_blended_return", "equity_return", "bond_return", "bond_weight_now",
    "bond_weight_at_retire", "bond_weight_in_retirement", "state_tax_rate",
    "standard_deduction", "positions_csv", "skip_accounts", "dc_plans",
    "holdings", "django_base_url", "django_token",
}


def parse_excel(raw: bytes) -> dict:
    """Parse the uploaded template workbook into an assumptions dict.

    Reads the 'Inputs' sheet (column D = machine key, column B = value) and the
    optional 'DC Plan Funds' sheet (plan, fund, balance). Maps ss_62/63/67/70
    into ss_by_claim_age and the DC funds into dc_plans.
    """
    import io
    from openpyxl import load_workbook

    wb = load_workbook(io.BytesIO(raw), data_only=True)
    out: dict = {}

    if "Inputs" in wb.sheetnames:
        ws = wb["Inputs"]
        for r in range(2, ws.max_row + 1):
            key = ws.cell(row=r, column=4).value  # hidden machine key
            val = ws.cell(row=r, column=2).value
            if not key or val in (None, ""):
                continue
            out[str(key).strip()] = val

    # SS claim-age fields -> nested dict the model expects.
    ss = {}
    for age in (62, 63, 67, 70):
        k = f"ss_{age}"
        if k in out:
            try:
                ss[str(age)] = float(out.pop(k))
            except (TypeError, ValueError):
                out.pop(k, None)
    if ss:
        out["ss_by_claim_age"] = ss

    # DC plan funds -> dc_plans + roll up to nc_401k/457 balances.
    if "DC Plan Funds" in wb.sheetnames:
        dc_ws = wb["DC Plan Funds"]
        dc_plans: dict = {}
        totals = {"401k": 0.0, "457": 0.0}
        for r in range(2, dc_ws.max_row + 1):
            plan = (dc_ws.cell(row=r, column=1).value or "")
            fund = (dc_ws.cell(row=r, column=2).value or "")
            bal = dc_ws.cell(row=r, column=3).value
            plan = str(plan).strip().lower().replace("(", "").replace(")", "")
            fund = str(fund).strip()
            if plan not in ("401k", "457") or not fund or bal in (None, ""):
                continue
            try:
                bal = float(bal)
            except (TypeError, ValueError):
                continue
            dc_plans.setdefault(plan, {})[fund] = bal
            totals[plan] += bal
        if dc_plans:
            out["dc_plans"] = dc_plans
            if totals["401k"]:
                out.setdefault("nc_401k_balance", totals["401k"])
            if totals["457"]:
                out.setdefault("nc_457_balance", totals["457"])

    return out


class Handler(BaseHTTPRequestHandler):
    server_version = "RetirementUI/1.0"

    # --- helpers ---
    def _send(self, code, body, content_type="application/json"):
        data = body.encode("utf-8") if isinstance(body, str) else body
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return {}

    # --- routes ---
    def do_GET(self):
        if self.path in ("/", "/index.html"):
            try:
                with open(os.path.join(HERE, "index.html"), "rb") as f:
                    self._send(200, f.read(), "text/html; charset=utf-8")
            except FileNotFoundError:
                self._send(404, "index.html not found", "text/plain")
        else:
            self._send(404, json.dumps({"error": "not found"}))

    def do_POST(self):
        # Separate the route path from its query string.
        parsed_url = urllib.parse.urlparse(self.path)
        route = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        # --- Raw-binary routes (handle before _json_body()) ---

        # Excel upload is raw binary (not JSON).
        if route == "/api/upload-excel":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length) if length else b""
            try:
                assumptions = parse_excel(raw)
            except Exception as e:  # noqa: BLE001 - surface parse errors to UI
                self._send(400, json.dumps({"error": f"could not read Excel: {e}"}))
                return
            self._send(200, json.dumps({"assumptions": assumptions}, default=str))
            return

        # Unified file load: CSV (Fidelity) / PDF (Empower) / JSON (master).
        if route == "/api/load":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length) if length else b""
            kind = (query.get("type", [None])[0])
            filename = (query.get("filename", [None])[0])
            try:
                parsed = parsers.parse(raw, kind=kind, filename=filename)
            except Exception as e:  # noqa: BLE001 - surface parse errors to UI
                self._send(400, json.dumps({"error": f"could not parse file: {e}"}))
                return
            norm = parsed["normalized"]
            holdings = norm.get("holdings", [])
            # assumptions = normalized minus the non-Assumptions pass-through.
            assumptions = {k: v for k, v in norm.items() if k != "holdings"}
            source = {
                "kind": parsed["kind"],
                "holdings_count": len(holdings),
                "has_dc_plans": "dc_plans" in norm,
                "ira_balance": norm.get("ira_balance"),
                "nc_401k_balance": norm.get("nc_401k_balance"),
                "nc_457_balance": norm.get("nc_457_balance"),
            }
            self._send(200, json.dumps({
                "kind": parsed["kind"],
                "assumptions": assumptions,
                "holdings": holdings,
                "source": source,
            }, default=str))
            return

        body = self._json_body()

        # --- /api/refresh: live re-pricing of holdings (no Assumptions needed) ---
        if route == "/api/refresh":
            holdings = body.get("holdings") or []
            assumptions = body.get("assumptions", {}) or {}
            skip_accounts = (assumptions.get("skip_accounts")
                             or body.get("skip_accounts") or [])
            tickers = sorted({
                (h.get("symbol") or "").strip().upper()
                for h in holdings if h.get("symbol")
            })
            try:
                prices = live_prices.fetch_prices(tickers)
            except Exception as e:  # noqa: BLE001 - never leak token in errors
                self._send(500, json.dumps({"error": f"price fetch failed: {e}"}))
                return
            result = reprice.reprice_and_allocate(
                holdings, prices, skip_accounts=skip_accounts,
                dc_plans=assumptions.get("dc_plans"))
            # Merge the live IRA balance into the assumptions echo.
            live_assumptions = dict(assumptions)
            if result["ira_balance"]:
                live_assumptions["ira_balance"] = result["ira_balance"]
            source_counts = result["repriced"]["sources"]
            self._send(200, json.dumps({
                "assumptions": live_assumptions,
                "ira_balance": result["ira_balance"],
                "per_ticker": result["repriced"]["per_ticker"],
                "sleeves": result["repriced"]["sleeves"],
                "allocation": result["allocation"],
                "sources": source_counts,
            }, default=str))
            return

        # --- /api/save: persist to the gitignored my_inputs.json ---
        if route == "/api/save":
            payload = body.get("assumptions", body) or {}
            holdings = body.get("holdings")
            if isinstance(holdings, list):
                payload = dict(payload)
                payload["holdings"] = holdings
            # Whitelist keys; never persist unexpected fields.
            to_save = {k: v for k, v in payload.items() if k in _SAVE_WHITELIST}
            try:
                with open(MY_INPUTS_PATH, "w", encoding="utf-8") as f:
                    json.dump(to_save, f, indent=2)
            except OSError as e:
                self._send(500, json.dumps({"error": f"could not save: {e}"}))
                return
            self._send(200, json.dumps({
                "saved": True,
                "path": "my_inputs.json",
                "keys": sorted(to_save.keys()),
            }))
            return

        assumptions = body.get("assumptions", {})
        try:
            a = rm.assumptions_from(assumptions)
        except Exception as e:  # noqa: BLE001 - surface config errors to UI
            self._send(400, json.dumps({"error": f"bad assumptions: {e}"}))
            return

        if route == "/api/compute":
            ages = body.get("ages") or [62, 65, 67, 70]
            try:
                ages = [int(x) for x in ages]
            except (TypeError, ValueError):
                ages = [62, 65, 67, 70]
            out = {"scenarios": [rm.scenario_summary(a, age) for age in ages]}
            self._send(200, json.dumps(out, default=str))

        elif route == "/api/optimize":
            lo = int(body.get("lo", 58))
            hi = int(body.get("hi", 72))
            discount = float(body.get("discount", 0.03))
            out = rm.optimize_retirement_age(a, lo, hi, discount)
            self._send(200, json.dumps(out, default=str))

        else:
            self._send(404, json.dumps({"error": "not found"}))

    def log_message(self, fmt, *args):  # quieter logs
        return


def main():
    p = argparse.ArgumentParser(description="Retirement UI server")
    p.add_argument("--port", type=int, default=8099)
    p.add_argument("--host", default="127.0.0.1")
    args = p.parse_args()
    srv = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"Retirement planner UI  ->  http://{args.host}:{args.port}")
    print("Ctrl-C to stop.")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        srv.server_close()


if __name__ == "__main__":
    main()
