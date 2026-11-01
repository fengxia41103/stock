#!/usr/bin/env python3
"""Fetch live stock prices from the stock Django app for the retirement tool.

For each ticker, GET {base_url}/stocks/?symbol=TICKER with a Token header and
read 'latest_close_price'. On any failure (app down, 401, missing field), that
ticker is marked source='fallback' so the caller can use the statement value.

Config (never committed): token + base URL come from the gitignored
my_inputs.json ('django_token' / 'django_base_url') or the environment
(RETIRE_DJANGO_TOKEN / RETIRE_DJANGO_URL). The token is NEVER logged or printed.
Pure stdlib (urllib).
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request

DEFAULT_BASE = "http://localhost:8083/api/v1"
_TIMEOUT = 6  # seconds per request


def _config_from_inputs():
    """Return (base_url, token) from env or my_inputs.json (gitignored)."""
    base = os.environ.get("RETIRE_DJANGO_URL")
    token = os.environ.get("RETIRE_DJANGO_TOKEN")
    if not base or not token:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                            "my_inputs.json")
        try:
            with open(path, encoding="utf-8") as f:
                cfg = json.load(f)
            base = base or cfg.get("django_base_url")
            token = token or cfg.get("django_token")
        except (FileNotFoundError, ValueError):
            pass
    return base or DEFAULT_BASE, token


def _get_json(url: str, token: str):
    req = urllib.request.Request(url)
    if token:
        req.add_header("Authorization", f"Token {token}")
    try:
        with urllib.request.urlopen(req, timeout=_TIMEOUT) as resp:
            return json.loads(resp.read().decode("utf-8", "replace"))
    except (urllib.error.URLError, urllib.error.HTTPError, ValueError,
            TimeoutError, OSError):
        return None


def _symbol_id_map(base_url: str, token: str) -> dict:
    """Fetch the stock list once -> {SYMBOL: id}. {} on failure."""
    data = _get_json(f"{base_url.rstrip('/')}/stocks/", token)
    rows = data.get("results", data) if isinstance(data, dict) else data
    if not isinstance(rows, list):
        return {}
    out = {}
    for r in rows:
        sym = (r.get("symbol") or "").strip().upper()
        if sym and "id" in r:
            out[sym] = r["id"]
    return out


def _detail_price(stock_id, base_url: str, token: str):
    """Return (price, as_of) from the detail endpoint, or (None, None)."""
    data = _get_json(f"{base_url.rstrip('/')}/stocks/{stock_id}/", token)
    if not isinstance(data, dict):
        return None, None
    price = data.get("latest_close_price")
    as_of = data.get("last_price_date")
    try:
        return (float(price) if price is not None else None), as_of
    except (TypeError, ValueError):
        return None, as_of


def fetch_prices(tickers, base_url=None, token=None) -> dict:
    """Return {ticker: {'price': float|None, 'source': 'live'|'fallback',
    'as_of': str|None}}. Never raises for network issues; individual tickers
    degrade to source='fallback'. One list call + a detail call per matched
    ticker (the list serializer omits price; the detail serializer has it)."""
    cfg_base, cfg_token = _config_from_inputs()
    base_url = base_url or cfg_base
    token = token or cfg_token

    sym_id = _symbol_id_map(base_url, token)  # {} if app down / unauthorized
    out = {}
    for t in tickers:
        t = (t or "").strip().upper()
        if not t:
            continue
        sid = sym_id.get(t)
        price = as_of = None
        if sid is not None:
            price, as_of = _detail_price(sid, base_url, token)
        if price is not None and price > 0:
            out[t] = {"price": price, "source": "live", "as_of": as_of}
        else:
            out[t] = {"price": None, "source": "fallback", "as_of": None}
    return out
