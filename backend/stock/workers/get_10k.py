"""Fetch SEC 10-K annual-report metadata from the data.sec.gov JSON API.

Structured data only — no HTML scraping, no narrative text. Reads filing
metadata (accession, filing/period dates, primary document reference, XBRL
flags) from the SEC submissions API and stores it in the Filing10K model.
Fiscal year is derived from the period-of-report (reportDate).
"""

import datetime
import logging

from stock.models import MyStock
from stock.models.filing import Filing10K
from stock.workers.sec_edgar_api import filing_url, get_submissions

logger = logging.getLogger("stock")


class Filing10KWorker:
    """Fetch and store 10-K metadata from data.sec.gov."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self, years=5):
        """Fetch the most recent `years` 10-K filings. Returns number stored."""
        cik, _meta, rows = get_submissions(self.stock.symbol)
        if cik is None:
            logger.warning(f"[10-K] Could not resolve {self.stock.symbol} on SEC EDGAR")
            return 0

        ten_ks = [r for r in rows if r["form"] == "10-K"][:years]
        count = 0
        for row in ten_ks:
            try:
                count += self._store(cik, row)
            except Exception as e:
                logger.warning(
                    f"[10-K] Error storing {self.stock.symbol} "
                    f"{row.get('accession_number')}: {e}"
                )
                continue
        return count

    def _store(self, cik, row):
        accession = row["accession_number"]
        period = self._to_date(row.get("report_date"))
        filed = self._to_date(row.get("filing_date"))
        # Fiscal year from period-of-report, else filing year.
        fiscal_year = period.year if period else (filed.year if filed else None)
        if fiscal_year is None:
            return 0

        if Filing10K.objects.filter(stock=self.stock, fiscal_year=fiscal_year).exists():
            return 0

        url = filing_url(cik, accession, row.get("primary_document", "")) \
            if row.get("primary_document") else ""

        Filing10K.objects.create(
            stock=self.stock,
            fiscal_year=fiscal_year,
            accession_number=accession,
            filed_date=filed,
            period_of_report=period,
            primary_document=row.get("primary_document", ""),
            source_url=url,
            size=row.get("size", 0) or 0,
            is_xbrl=row.get("is_xbrl", False),
            is_inline_xbrl=row.get("is_inline_xbrl", False),
        )
        logger.info(f"[10-K] {self.stock.symbol} FY{fiscal_year} {accession}")
        return 1

    @staticmethod
    def _to_date(value):
        if not value:
            return None
        try:
            return datetime.date.fromisoformat(str(value)[:10])
        except (ValueError, TypeError):
            return None
