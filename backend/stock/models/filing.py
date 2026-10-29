"""SEC 10-K annual report — structured filing metadata from data.sec.gov.

Structured data only: we record the filing's identity and dates from the SEC
submissions JSON API (accession, fiscal year, filed/period dates, primary
document reference, XBRL flags). No narrative section text, no HTML scraping.
Financial fundamentals live in the IncomeStatement/BalanceSheet/CashFlow
models; this model is the authoritative index of a company's 10-K filings.
"""

from django.db import models


class Filing10K(models.Model):
    """SEC 10-K annual report (structured metadata only)."""

    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="filings_10k"
    )
    fiscal_year = models.IntegerField()
    accession_number = models.CharField(max_length=64, blank=True, default="")
    filed_date = models.DateField(null=True, blank=True)
    period_of_report = models.DateField(null=True, blank=True)  # reportDate

    # Reference to the primary document on EDGAR (not fetched/scraped).
    primary_document = models.CharField(max_length=256, blank=True, default="")
    source_url = models.URLField(max_length=512, blank=True, default="")

    # Structured flags from the submissions API.
    size = models.BigIntegerField(default=0)
    is_xbrl = models.BooleanField(default=False)
    is_inline_xbrl = models.BooleanField(default=False)

    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("stock", "fiscal_year")
        ordering = ["-fiscal_year"]

    def __str__(self):
        return f"{self.stock.symbol} 10-K FY{self.fiscal_year}"
