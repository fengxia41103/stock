"""Fetch SEC 8-K current-report metadata from the data.sec.gov JSON API.

Structured data only — no HTML scraping. Reads filing metadata (item codes,
filing/event dates, primary document reference) from the SEC submissions API
and stores it in the Filing8K model.
"""

import datetime
import logging
import re

from stock.models import MyStock
from stock.models.filing_8k import Filing8K
from stock.workers.sec_edgar_api import filing_url, get_submissions

logger = logging.getLogger("stock")

# SEC Form 8-K item code -> human-readable title.
ITEM_TITLES = {
    "1.01": "Entry into a Material Definitive Agreement",
    "1.02": "Termination of a Material Definitive Agreement",
    "1.03": "Bankruptcy or Receivership",
    "2.01": "Completion of Acquisition or Disposition of Assets",
    "2.02": "Results of Operations and Financial Condition",
    "2.03": "Creation of a Direct Financial Obligation",
    "2.04": "Triggering Events That Accelerate a Financial Obligation",
    "2.05": "Costs Associated with Exit or Disposal Activities",
    "2.06": "Material Impairments",
    "3.01": "Notice of Delisting or Failure to Satisfy a Listing Rule",
    "3.02": "Unregistered Sales of Equity Securities",
    "3.03": "Material Modification to Rights of Security Holders",
    "4.01": "Changes in Registrant's Certifying Accountant",
    "4.02": "Non-Reliance on Previously Issued Financial Statements",
    "5.01": "Changes in Control of Registrant",
    "5.02": "Departure/Election of Directors or Officers",
    "5.03": "Amendments to Articles of Incorporation or Bylaws",
    "5.07": "Submission of Matters to a Vote of Security Holders",
    "7.01": "Regulation FD Disclosure",
    "8.01": "Other Events",
    "9.01": "Financial Statements and Exhibits",
}


class Filing8KWorker:
    """Fetch and store 8-K metadata from data.sec.gov."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self, limit=10):
        """Fetch the most recent `limit` 8-K filings. Returns number stored."""
        cik, _meta, rows = get_submissions(self.stock.symbol)
        if cik is None:
            logger.warning(f"[8-K] Could not resolve {self.stock.symbol} on SEC EDGAR")
            return 0

        eight_ks = [r for r in rows if r["form"] == "8-K"][:limit]
        count = 0
        for row in eight_ks:
            try:
                count += self._store(cik, row)
            except Exception as e:
                logger.warning(
                    f"[8-K] Error storing {self.stock.symbol} "
                    f"{row.get('accession_number')}: {e}"
                )
                continue
        return count

    def _store(self, cik, row):
        accession = row["accession_number"]
        if not accession:
            return 0
        if Filing8K.objects.filter(accession_number=accession).exists():
            return 0

        items = self._parse_items(row.get("items"))
        titles = [ITEM_TITLES.get(code, "") for code in items]
        primary = row.get("primary_document", "")
        url = filing_url(cik, accession, primary) if primary else ""

        Filing8K.objects.create(
            stock=self.stock,
            accession_number=accession,
            filed_date=self._to_date(row.get("filing_date")),
            event_date=(
                self._to_date(row.get("report_date"))
                or self._to_date(row.get("filing_date"))
            ),
            items=items,
            item_titles=titles,
            primary_document=row.get("primary_document", ""),
            source_url=url,
            size=row.get("size", 0) or 0,
            is_xbrl=row.get("is_xbrl", False),
            is_inline_xbrl=row.get("is_inline_xbrl", False),
        )
        logger.info(f"[8-K] {self.stock.symbol} {accession} items={items}")
        return 1

    @staticmethod
    def _to_date(value):
        if not value:
            return None
        try:
            return datetime.date.fromisoformat(str(value)[:10])
        except (ValueError, TypeError):
            return None

    @staticmethod
    def _parse_items(raw):
        """Parse the comma-separated item string into codes like ['2.02','9.01']."""
        if not raw:
            return []
        codes = []
        for tok in re.split(r"[,\s]+", str(raw)):
            m = re.search(r"\d+\.\d+", tok)
            if m:
                codes.append(m.group(0))
        return codes
