"""Lightweight client for the official SEC EDGAR JSON API (data.sec.gov).

Structured data only — no HTML scraping. Provides:
  - ticker -> CIK resolution (cached)
  - company submissions (filings metadata) as parsed JSON rows

SEC requires a descriptive User-Agent and rate-limits to 10 req/sec.
Set SEC_EDGAR_USER_AGENT="YourApp you@example.com".

Endpoints used:
  https://www.sec.gov/files/company_tickers.json   (ticker -> CIK map)
  https://data.sec.gov/submissions/CIK##########.json  (filings metadata)
"""

import json
import logging
import os
import time
import urllib.request

logger = logging.getLogger("stock")

SEC_USER_AGENT = os.environ.get(
    "SEC_EDGAR_USER_AGENT", "StockApp/1.0 (dev@example.com)"
)

TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"
SUBMISSIONS_URL = "https://data.sec.gov/submissions/CIK{cik:010d}.json"

# Module-level cache for the ticker->CIK map (fetched once per process).
_TICKER_CIK_CACHE = {}


def _get(url):
    """HTTP GET returning parsed JSON, with SEC-compliant headers."""
    req = urllib.request.Request(url, headers={"User-Agent": SEC_USER_AGENT})
    # Gentle self-throttle to stay well under SEC's 10 req/sec limit.
    time.sleep(0.15)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def resolve_cik(symbol):
    """Resolve a ticker symbol to its integer CIK, or None if not found."""
    global _TICKER_CIK_CACHE
    if not _TICKER_CIK_CACHE:
        try:
            data = _get(TICKERS_URL)
            _TICKER_CIK_CACHE = {
                v["ticker"].upper(): int(v["cik_str"]) for v in data.values()
            }
        except Exception as e:
            logger.warning(f"[SEC] Could not fetch ticker->CIK map: {e}")
            return None
    return _TICKER_CIK_CACHE.get(symbol.upper())


def get_submissions(symbol):
    """Return (cik, company_metadata, filing_rows) for a ticker.

    filing_rows is a list of dicts, one per recent filing, with keys:
      accession_number, form, filing_date, report_date, items,
      primary_document, primary_doc_description, size, is_xbrl, is_inline_xbrl.

    Returns (None, None, []) if the symbol can't be resolved.
    """
    cik = resolve_cik(symbol)
    if cik is None:
        logger.warning(f"[SEC] No CIK for symbol {symbol}")
        return None, None, []

    try:
        data = _get(SUBMISSIONS_URL.format(cik=cik))
    except Exception as e:
        logger.warning(f"[SEC] submissions fetch failed for {symbol} (CIK {cik}): {e}")
        return cik, None, []

    recent = data.get("filings", {}).get("recent", {})
    rows = _zip_recent(recent)
    meta = {
        "cik": cik,
        "name": data.get("name", ""),
        "sic": data.get("sic", ""),
        "sic_description": data.get("sicDescription", ""),
        "fiscal_year_end": data.get("fiscalYearEnd", ""),
    }
    return cik, meta, rows


def _zip_recent(recent):
    """Convert the parallel-array 'recent' filings block into row dicts."""
    if not recent or "accessionNumber" not in recent:
        return []

    def col(name):
        return recent.get(name, [])

    n = len(recent["accessionNumber"])

    def at(name, i, default=""):
        arr = col(name)
        return arr[i] if i < len(arr) else default

    rows = []
    for i in range(n):
        rows.append({
            "accession_number": at("accessionNumber", i),
            "form": at("form", i),
            "filing_date": at("filingDate", i) or None,
            "report_date": at("reportDate", i) or None,
            "items": at("items", i),
            "primary_document": at("primaryDocument", i),
            "primary_doc_description": at("primaryDocDescription", i),
            "size": at("size", i, 0) or 0,
            "is_xbrl": bool(at("isXBRL", i, 0)),
            "is_inline_xbrl": bool(at("isInlineXBRL", i, 0)),
        })
    return rows


def filing_url(cik, accession_number, primary_document):
    """Construct the canonical EDGAR URL for a filing's primary document.

    Stored for reference only (we do not fetch/scrape it).
    """
    accn_nodash = accession_number.replace("-", "")
    return (
        f"https://www.sec.gov/Archives/edgar/data/{cik}/"
        f"{accn_nodash}/{primary_document}"
    )
