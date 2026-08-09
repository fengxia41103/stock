"""Download and parse SEC 10-K filings using edgartools.

Extracts Item 1 (Business), Item 1A (Risk Factors), Item 7 (MD&A)
and stores raw text in Filing10K model.

Requires: pip install edgartools>=5.16
SEC EDGAR rate limit: 10 requests/second (respected by edgartools).
"""

import logging
import os

from stock.models import MyStock
from stock.models.filing import Filing10K

logger = logging.getLogger("stock")

# SEC requires a User-Agent identifying your app
SEC_USER_AGENT = os.environ.get(
    "SEC_EDGAR_USER_AGENT", "StockApp/1.0 (dev@example.com)"
)


class Filing10KWorker:
    """Download and parse 10-K from SEC EDGAR using edgartools."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self, years=2):
        """Fetch last N years of 10-K filings.
        
        Returns number of filings processed.
        """
        try:
            from edgartools import Company, set_identity
        except ImportError:
            logger.error("edgartools not installed. Run: pip install edgartools>=5.16")
            return 0

        set_identity(SEC_USER_AGENT)

        try:
            company = Company(self.stock.symbol)
        except Exception as e:
            logger.warning(f"[10-K] Could not find company for {self.stock.symbol}: {e}")
            return 0

        try:
            filings = company.get_filings(form="10-K").head(years)
        except Exception as e:
            logger.warning(f"[10-K] Could not get filings for {self.stock.symbol}: {e}")
            return 0

        count = 0
        for filing in filings:
            try:
                count += self._process_filing(filing)
            except Exception as e:
                logger.warning(f"[10-K] Error processing {self.stock.symbol} filing: {e}")
                continue

        return count

    def _process_filing(self, filing):
        """Process a single 10-K filing."""
        # Check if we already have this filing
        accession = getattr(filing, "accession_number", "") or ""
        filing_date = getattr(filing, "filing_date", None)
        fiscal_year = filing_date.year if filing_date else 2024

        existing = Filing10K.objects.filter(
            stock=self.stock, fiscal_year=fiscal_year
        ).first()

        # Skip if already has raw data
        if existing and existing.has_raw_data:
            return 0

        # Parse the 10-K into structured sections
        try:
            tenk = filing.obj()
        except Exception as e:
            logger.warning(f"[10-K] Could not parse {self.stock.symbol} FY{fiscal_year}: {e}")
            return 0

        # Extract key sections
        business = self._extract_section(tenk, "item1", "Item 1")
        risks = self._extract_section(tenk, "item1a", "Item 1A")
        mda = self._extract_section(tenk, "item7", "Item 7")

        if not (business or risks or mda):
            logger.info(f"[10-K] No sections extracted for {self.stock.symbol} FY{fiscal_year}")
            return 0

        # Store
        Filing10K.objects.update_or_create(
            stock=self.stock,
            fiscal_year=fiscal_year,
            defaults={
                "filed_date": filing_date,
                "accession_number": accession,
                "business_description": business[:50000],
                "risk_factors_raw": risks[:50000],
                "mda_raw": mda[:50000],
            },
        )

        logger.info(
            f"[10-K] {self.stock.symbol} FY{fiscal_year}: "
            f"business={len(business)} chars, risks={len(risks)} chars, mda={len(mda)} chars"
        )
        return 1

    def _extract_section(self, tenk, attr_name, display_name):
        """Safely extract a section from parsed 10-K."""
        try:
            # edgartools TenK object has attributes like .item1, .item1a, .item7
            section = getattr(tenk, attr_name, None)
            if section is None:
                # Try dictionary-style access
                section = tenk.get(display_name, None) if hasattr(tenk, "get") else None
            if section is None:
                return ""
            return str(section).strip()
        except Exception:
            return ""
