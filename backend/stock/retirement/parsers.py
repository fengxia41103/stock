#!/usr/bin/env python3
"""Server-side parsers for the three 'load latest numbers' source types:

  - Fidelity "Portfolio Positions" CSV  -> brokerage holdings
  - Empower / DC-plan statement PDF      -> 401(k)/457 fund balances
  - Master JSON (my_inputs.json)         -> everything

Each returns a NORMALIZED dict the retirement model consumes (ira_balance,
dc_plans, nc_*_balance, ...) plus, for the CSV, a 'holdings' list so prices can
be refreshed live later.

No personal data lives here — these only parse whatever file the user uploads
in-session. Pure stdlib + openpyxl (already a dependency for xlsx).
"""

from __future__ import annotations

import csv
import io
import json
import re


# ---------------------------------------------------------------------------
# Fidelity positions CSV
# ---------------------------------------------------------------------------


def _money(s):
    if s is None:
        return None
    s = str(s).strip().lstrip("$").replace(",", "")
    if s in ("", "-", "--"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def parse_fidelity_csv(raw: bytes, skip_accounts=None) -> dict:
    """Parse a Fidelity Portfolio Positions CSV into holdings.

    Returns {'holdings': [{account, symbol, quantity, value}], 'ira_balance'}.
    Accounts in skip_accounts (e.g. 529/HSA) are excluded from holdings.
    Robust to the trailing disclaimer rows and blank lines.
    """
    skip = {s.strip().lower() for s in (skip_accounts or [])}
    text = raw.decode("utf-8-sig", "replace")
    reader = csv.DictReader(io.StringIO(text))
    holdings = []
    for row in reader:
        # Disclaimer/footer rows have no Symbol column populated.
        sym = (row.get("Symbol") or "").strip().rstrip("*")
        if not sym or sym.lower().startswith("pending"):
            continue
        account = (row.get("Account name") or "").strip()
        if account.lower() in skip:
            continue
        qty = _money(row.get("Quantity"))
        value = _money(row.get("Current value"))
        if value is None and qty is None:
            continue
        holdings.append({
            "account": account,
            "symbol": sym,
            "quantity": qty,
            "value": value or 0.0,
        })
    ira_balance = round(sum(h["value"] for h in holdings), 2)
    return {"holdings": holdings, "ira_balance": ira_balance, "source": "fidelity_csv"}


# ---------------------------------------------------------------------------
# Empower / DC-plan statement PDF
# ---------------------------------------------------------------------------


def _pdf_to_text(raw: bytes) -> str:
    """Extract text from a PDF. Prefer pypdf; fall back to the pdftotext CLI.
    No shell is used (argv list + stdin bytes)."""
    try:
        from pypdf import PdfReader  # type: ignore
        reader = PdfReader(io.BytesIO(raw))
        return "\n".join((p.extract_text() or "") for p in reader.pages)
    except Exception:  # noqa: BLE001 - fall through to CLI
        pass
    try:
        from PyPDF2 import PdfReader  # type: ignore
        reader = PdfReader(io.BytesIO(raw))
        return "\n".join((p.extract_text() or "") for p in reader.pages)
    except Exception:  # noqa: BLE001
        pass
    import shutil
    import subprocess
    if shutil.which("pdftotext"):
        proc = subprocess.run(
            ["pdftotext", "-layout", "-", "-"],
            input=raw, capture_output=True, shell=False, timeout=30,
        )
        if proc.returncode == 0:
            return proc.stdout.decode("utf-8", "replace")
    raise RuntimeError(
        "Could not read PDF: install 'pypdf' (pip install pypdf) or the "
        "'pdftotext' CLI (poppler-utils)."
    )


# A fund activity row starts with the fund name at column 0 (NOT the "32% NC
# ... Fund" allocation lines, which start with a percentage). Columns are:
#   name  Beginning  Deposits  Change  [Transfers]  Expenses  ENDING  Units
# We take the ENDING balance = the money token (d+.dd) immediately BEFORE the
# final units/shares token (which has 3 decimals).
_NUM = re.compile(r"-?[\d,]+\.\d+")
_FUND_START = re.compile(r"^(NC [A-Za-z0-9/&.\-]+(?: [A-Za-z0-9/&.\-]+)*)\s{2,}(.+)$")


def _parse_fund_line(line: str):
    """Return (fund_name, ending_balance) or None."""
    s = line.rstrip()
    # Skip allocation lines like "   32% NC International Fund"
    if re.match(r"^\s*\d", s):
        return None
    m = _FUND_START.match(s.strip())
    if not m:
        return None
    name = re.sub(r"\s+", " ", m.group(1)).strip()
    nums = _NUM.findall(m.group(2))
    if len(nums) < 2:
        return None
    # last token = units/shares (3 decimals); ending balance = the one before it
    ending = None
    for tok in reversed(nums):
        dec = tok.split(".")[-1]
        if len(dec) == 2:  # money has 2 decimals; units have 3
            ending = float(tok.replace(",", ""))
            break
    if ending is None:
        ending = float(nums[-2].replace(",", ""))
    return name, ending


def parse_empower_pdf(raw: bytes) -> dict:
    """Extract 401(k)/457 fund balances from an Empower/DC statement PDF.

    Splits on the '401(k)' and '457' section markers and pulls each fund row's
    ENDING balance. Returns dc_plans + nc_401k/457_balance.
    """
    text = _pdf_to_text(raw)
    plan = None
    dc_plans = {"401k": {}, "457": {}}
    for ln in text.splitlines():
        low = ln.lower()
        if "401(k)" in low or " 401k" in low:
            plan = "401k"
        elif "457 plan" in low or "nc 457" in low:
            plan = "457"
        if plan is None:
            continue
        parsed = _parse_fund_line(ln)
        if not parsed:
            continue
        name, bal = parsed
        if not name.lower().startswith("nc "):
            continue
        # Fund may appear once per section; keep the value (last seen wins).
        dc_plans[plan][name] = bal

    out = {"dc_plans": {k: v for k, v in dc_plans.items() if v},
           "source": "empower_pdf"}
    if dc_plans["401k"]:
        out["nc_401k_balance"] = round(sum(dc_plans["401k"].values()), 2)
    if dc_plans["457"]:
        out["nc_457_balance"] = round(sum(dc_plans["457"].values()), 2)
    return out


# ---------------------------------------------------------------------------
# Master JSON
# ---------------------------------------------------------------------------


def parse_master_json(raw: bytes) -> dict:
    data = json.loads(raw.decode("utf-8", "replace"))
    if not isinstance(data, dict):
        raise ValueError("JSON root must be an object")
    data.setdefault("source", "master_json")
    return data


# ---------------------------------------------------------------------------
# Dispatch by type/filename
# ---------------------------------------------------------------------------


def parse_upload(raw: bytes, kind: str) -> dict:
    """kind is 'csv' | 'pdf' | 'json' (or a filename to sniff the extension)."""
    k = (kind or "").lower()
    if k.endswith(".csv") or k == "csv":
        return parse_fidelity_csv(raw)
    if k.endswith(".pdf") or k == "pdf":
        return parse_empower_pdf(raw)
    if k.endswith(".json") or k == "json":
        return parse_master_json(raw)
    raise ValueError(f"Unsupported file type: {kind!r} (use .csv, .pdf, or .json)")


def _sniff_kind(kind, filename):
    """Resolve an explicit kind or a filename extension to 'csv'/'pdf'/'json'."""
    for cand in (kind, filename):
        if not cand:
            continue
        c = str(cand).lower()
        if c.endswith(".csv") or c == "csv":
            return "csv"
        if c.endswith(".pdf") or c == "pdf":
            return "pdf"
        if c.endswith(".json") or c == "json":
            return "json"
    raise ValueError("Unknown file type — expected .csv, .pdf, or .json")


def parse(raw: bytes, kind=None, filename=None) -> dict:
    """Server-facing entry: resolve type, parse, and return
    {'kind': <csv|pdf|json>, 'normalized': <assumptions-style dict>}.
    """
    resolved = _sniff_kind(kind, filename)
    if resolved == "csv":
        normalized = parse_fidelity_csv(raw)
    elif resolved == "pdf":
        normalized = parse_empower_pdf(raw)
    else:
        normalized = parse_master_json(raw)
    return {"kind": resolved, "normalized": normalized}
