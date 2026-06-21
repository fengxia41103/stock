# -*- coding: utf-8 -*-

"""Fetch institutional holdings from SEC EDGAR 13F filings.

Strategy: For each tracked stock, query SEC EFTS (full-text search) for
13F-HR filings that reference the stock's CIK. Parse the infotable XML
to extract holder name, shares, and value.

Note: This is rate-limited and can be slow. Run quarterly.
"""

import logging
import os
import time
import xml.etree.ElementTree as ET

import requests

from stock.models import MyStock
from stock.models.institutional_holding import InstitutionalHolding
from stock.workers.get_insider_trades import _get_cik

logger = logging.getLogger("stock")

HEADERS = {
    "User-Agent": os.environ.get(
        "SEC_EDGAR_USER_AGENT", "StockApp/1.0 (dev@example.com)"
    ),
    "Accept-Encoding": "gzip, deflate",
}

# Top institutional filers we specifically track (by CIK)
# These are the largest asset managers whose 13F filings we parse
TOP_FILERS = {
    "Vanguard": "0000102909",
    "BlackRock": "0001364742",
    "State Street": "0000093751",
    "Fidelity (FMR)": "0000315066",
    "JP Morgan": "0000019617",
    "Morgan Stanley": "0000895421",
    "Goldman Sachs": "0000886982",
    "T. Rowe Price": "0001218978",
    "Geode Capital": "0001214717",
    "Capital Research": "0000044517",
}


class InstitutionalHoldingsWorker:
    """Fetch 13F holdings for a stock from top institutional filers."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)
        self.stock_cusip = None  # Would need CUSIP mapping

    def get(self):
        """Parse recent 13F filings from top filers for this stock's holdings."""
        stock_cik = _get_cik(self.stock.symbol)
        if not stock_cik:
            return

        # Use SEC EFTS to find 13F filings mentioning this company
        # This searches filing text for the company name/ticker
        search_url = (
            f"https://efts.sec.gov/LATEST/search-index?"
            f"q=%22{self.stock.symbol}%22&forms=13F-HR&dateRange=custom"
            f"&startdt=2024-01-01&enddt=2026-12-31"
        )
        try:
            resp = requests.get(search_url, headers=HEADERS, timeout=30)
            if resp.status_code != 200:
                # Fallback: try the company submissions API for holder count
                self._update_from_yahoo()
                return
        except Exception:
            self._update_from_yahoo()
            return

        # For now, use a simpler approach: parse the top filers' latest 13F
        for filer_name, filer_cik in TOP_FILERS.items():
            try:
                self._parse_filer_13f(filer_name, filer_cik)
                time.sleep(0.15)  # Rate limit
            except Exception as e:
                logger.debug(f"[13F] {filer_name} skip: {e}")

    def _parse_filer_13f(self, filer_name, filer_cik):
        """Get this filer's latest 13F and check if they hold our stock."""
        # Get filing index
        url = f"https://data.sec.gov/submissions/CIK{filer_cik}.json"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return

        data = resp.json()
        filings = data.get("filings", {}).get("recent", {})
        forms = filings.get("form", [])
        accessions = filings.get("accessionNumber", [])
        filing_dates = filings.get("filingDate", [])

        # Find latest 13F-HR
        for i, form in enumerate(forms):
            if form in ("13F-HR", "13F-HR/A"):
                accession = accessions[i].replace("-", "")
                report_date = filing_dates[i] if i < len(filing_dates) else None
                self._parse_infotable(filer_name, filer_cik, accession, report_date)
                return  # Only latest filing

    def _parse_infotable(self, filer_name, filer_cik, accession, report_date):
        """Parse 13F infotable XML for our stock's CUSIP/name."""
        cik_num = filer_cik.lstrip("0")
        # Get filing index to find infotable document
        index_url = f"https://www.sec.gov/Archives/edgar/data/{cik_num}/{accession}/"
        resp = requests.get(index_url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return

        # Look for infotable XML
        import re
        xml_files = re.findall(r'href="([^"]*infotable[^"]*\.xml)"', resp.text, re.IGNORECASE)
        if not xml_files:
            # Try other patterns
            xml_files = re.findall(r'href="([^"]*13f[^"]*\.xml)"', resp.text, re.IGNORECASE)
        if not xml_files:
            return

        table_url = f"https://www.sec.gov{xml_files[0]}" if xml_files[0].startswith("/") else \
            f"https://www.sec.gov/Archives/edgar/data/{cik_num}/{accession}/{xml_files[0]}"

        resp = requests.get(table_url, headers=HEADERS, timeout=30)
        if resp.status_code != 200:
            return

        # Parse XML — look for our stock by name
        try:
            # Strip namespaces for easier parsing
            content = re.sub(r'\sxmlns[^"]*"[^"]*"', "", resp.text)
            root = ET.fromstring(content)
        except ET.ParseError:
            return

        symbol_upper = self.stock.symbol.upper()
        # Search infoTable entries for matching nameOfIssuer
        for entry in root.iter():
            if entry.tag.endswith("infoTable") or entry.tag == "infoTable":
                name_el = entry.find(".//{*}nameOfIssuer")
                if name_el is None:
                    # Try without namespace
                    name_el = entry.find(".//nameOfIssuer")
                if name_el is None:
                    continue

                issuer_name = (name_el.text or "").upper()
                # Match by symbol or common name variations
                if not self._matches_stock(issuer_name, symbol_upper):
                    continue

                # Extract shares and value
                shares_el = entry.find(".//{*}sshPrnamt") or entry.find(".//sshPrnamt")
                value_el = entry.find(".//{*}value") or entry.find(".//value")

                shares = self._int(shares_el.text if shares_el is not None else None)
                value = self._float(value_el.text if value_el is not None else None)

                if shares and shares > 0:
                    InstitutionalHolding.objects.update_or_create(
                        stock=self.stock,
                        report_date=report_date or "2026-03-31",
                        institution_cik=filer_cik,
                        defaults={
                            "institution_name": filer_name,
                            "shares": shares,
                            "value": value or 0,
                        },
                    )
                    return  # Found our stock in this filer's 13F

    def _matches_stock(self, issuer_name, symbol):
        """Check if issuer name matches our stock."""
        # Common name mappings
        name_map = {
            "AAPL": ["APPLE"],
            "MSFT": ["MICROSOFT"],
            "GOOGL": ["ALPHABET"],
            "V": ["VISA"],
            "MA": ["MASTERCARD"],
            "COST": ["COSTCO"],
            "PEP": ["PEPSICO"],
            "PG": ["PROCTER", "P&G"],
            "BKNG": ["BOOKING"],
            "NFLX": ["NETFLIX"],
            "ADBE": ["ADOBE"],
            "TXN": ["TEXAS INSTRUMENTS", "TEXAS INSTR"],
            "UNP": ["UNION PACIFIC"],
            "SHW": ["SHERWIN"],
            "CME": ["CME GROUP"],
            "ISRG": ["INTUITIVE SURG"],
            "FICO": ["FAIR ISAAC"],
            "ORLY": ["O'REILLY", "OREILLY"],
            "IDXX": ["IDEXX"],
            "ZTS": ["ZOETIS"],
            "WM": ["WASTE MANAGEMENT", "WASTE MGMT"],
            "AMAT": ["APPLIED MATERIAL"],
            "LRCX": ["LAM RESEARCH", "LAM RES"],
            "KLAC": ["KLA"],
            "SNPS": ["SYNOPSYS"],
            "CDNS": ["CADENCE"],
            "SPGI": ["S&P GLOBAL"],
            "MCO": ["MOODY"],
            "INTU": ["INTUIT"],
            "ADP": ["AUTOMATIC DATA"],
            "CTAS": ["CINTAS"],
            "CPRT": ["COPART"],
            "FAST": ["FASTENAL"],
            "ODFL": ["OLD DOMINION"],
            "ICE": ["INTERCONTINENTAL EX"],
            "PANW": ["PALO ALTO"],
            "LIN": ["LINDE"],
            "AMD": ["ADVANCED MICRO"],
        }
        names = name_map.get(symbol, [symbol])
        return any(n in issuer_name for n in names)

    def _update_from_yahoo(self):
        """Fallback: Yahoo already provides institution_count and top_ten_ownership."""
        pass

    @staticmethod
    def _int(val):
        try:
            return int(val) if val else None
        except (ValueError, TypeError):
            return None

    @staticmethod
    def _float(val):
        try:
            return float(val) if val else None
        except (ValueError, TypeError):
            return None
