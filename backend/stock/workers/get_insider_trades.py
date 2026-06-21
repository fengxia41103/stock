# -*- coding: utf-8 -*-

import logging
import os
import time
import xml.etree.ElementTree as ET

import requests

from stock.models import MyStock
from stock.models.insider_trade import InsiderTrade

logger = logging.getLogger("stock")

HEADERS = {
    "User-Agent": os.environ.get(
        "SEC_EDGAR_USER_AGENT", "StockApp/1.0 (dev@example.com)"
    ),
    "Accept-Encoding": "gzip, deflate",
}

# Cache ticker→CIK mapping in memory for the process lifetime
_CIK_CACHE = {}


def _get_cik(ticker):
    """Map ticker → CIK using SEC's tickers.json."""
    if ticker in _CIK_CACHE:
        return _CIK_CACHE[ticker]

    resp = requests.get(
        "https://www.sec.gov/files/company_tickers.json", headers=HEADERS, timeout=15
    )
    if resp.status_code != 200:
        logger.error(f"[SEC] Failed to fetch tickers.json: {resp.status_code}")
        return None

    data = resp.json()
    for entry in data.values():
        _CIK_CACHE[entry["ticker"].upper()] = str(entry["cik_str"]).zfill(10)

    return _CIK_CACHE.get(ticker.upper())


class InsiderTradeWorker:
    """Fetch Form 4 insider trades from SEC EDGAR."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        cik = _get_cik(self.stock.symbol)
        if not cik:
            logger.warning(f"[SEC] No CIK found for {self.stock.symbol}")
            return

        filings = self._get_form4_filings(cik, count=40)
        for url in filings:
            try:
                self._parse_form4(url, cik)
                time.sleep(0.12)  # Respect 10 req/sec limit
            except Exception as e:
                logger.error(f"[SEC] Failed to parse {url}: {e}")

    def _get_form4_filings(self, cik, count=40):
        """Get URLs of recent Form 4 filing XMLs."""
        url = f"https://data.sec.gov/submissions/CIK{cik}.json"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return []

        data = resp.json()
        filings = data.get("filings", {}).get("recent", {})
        forms = filings.get("form", [])
        accessions = filings.get("accessionNumber", [])
        primary_docs = filings.get("primaryDocument", [])

        urls = []
        cik_num = cik.lstrip("0")
        for i, form_type in enumerate(forms):
            if form_type == "4" and i < len(accessions):
                accession = accessions[i].replace("-", "")
                # primaryDocument may be "xslF345X06/form4.xml" — strip XSL prefix
                doc = primary_docs[i] if i < len(primary_docs) else "form4.xml"
                if "/" in doc:
                    doc = doc.split("/")[-1]
                urls.append(
                    f"https://www.sec.gov/Archives/edgar/data/{cik_num}/{accession}/{doc}"
                )
                if len(urls) >= count:
                    break
        return urls

    def _parse_form4(self, url, cik):
        """Parse a Form 4 XML filing into InsiderTrade records."""
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return

        try:
            root = ET.fromstring(resp.text)
        except ET.ParseError:
            return

        # Get period of report (filing date)
        period_el = root.find("periodOfReport")
        filed_on = period_el.text if period_el is not None and period_el.text else None

        # Get insider info
        owner = root.find(".//reportingOwner")
        if owner is None:
            return

        owner_id = owner.find("reportingOwnerId")
        owner_rel = owner.find("reportingOwnerRelationship")

        insider_name = ""
        insider_cik_val = ""
        insider_title = ""

        if owner_id is not None:
            name_el = owner_id.find("rptOwnerName")
            cik_el = owner_id.find("rptOwnerCik")
            insider_name = name_el.text if name_el is not None and name_el.text else ""
            insider_cik_val = cik_el.text if cik_el is not None and cik_el.text else ""

        if owner_rel is not None:
            title_el = owner_rel.find("officerTitle")
            if title_el is not None and title_el.text:
                insider_title = title_el.text
            else:
                # Check relationship flags
                if self._flag_true(owner_rel, "isDirector"):
                    insider_title = "Director"
                elif self._flag_true(owner_rel, "isTenPercentOwner"):
                    insider_title = "10% Owner"
                elif self._flag_true(owner_rel, "isOfficer"):
                    insider_title = "Officer"

        # Parse non-derivative transactions
        for txn in root.findall(".//nonDerivativeTransaction"):
            self._save_transaction(txn, insider_name, insider_cik_val, insider_title, filed_on)

    def _save_transaction(self, txn, insider_name, insider_cik_val, insider_title, filed_on):
        """Extract and save one transaction element."""
        date_el = txn.find(".//transactionDate/value")
        type_el = txn.find(".//transactionCoding/transactionCode")
        shares_el = txn.find(".//transactionAmounts/transactionShares/value")
        price_el = txn.find(".//transactionAmounts/transactionPricePerShare/value")
        owned_el = txn.find(".//postTransactionAmounts/sharesOwnedFollowingTransaction/value")
        direct_el = txn.find(".//ownershipNature/directOrIndirectOwnership/value")

        if date_el is None or shares_el is None:
            return

        trade_date = date_el.text
        transaction_type = type_el.text if type_el is not None and type_el.text else "?"
        shares = self._float(shares_el.text)
        price = self._float(price_el.text) if price_el is not None else None
        owned_after = self._float(owned_el.text) if owned_el is not None else None
        is_direct = True
        if direct_el is not None and direct_el.text:
            is_direct = direct_el.text.upper() == "D"

        total_value = shares * price if price and shares else None

        InsiderTrade.objects.get_or_create(
            stock=self.stock,
            trade_date=trade_date,
            insider_cik=insider_cik_val,
            transaction_type=transaction_type,
            shares=shares,
            defaults={
                "filed_on": filed_on or trade_date,
                "insider_name": insider_name,
                "insider_title": insider_title,
                "price_per_share": price,
                "total_value": total_value,
                "shares_owned_after": owned_after,
                "is_direct": is_direct,
            },
        )

    @staticmethod
    def _flag_true(el, tag):
        child = el.find(tag)
        return child is not None and child.text and child.text.strip() in ("1", "true")

    @staticmethod
    def _float(val):
        try:
            return float(val) if val else None
        except (ValueError, TypeError):
            return None
