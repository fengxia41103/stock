"""SEC 8-K current report — structured filing metadata from data.sec.gov.

8-K filings are event-driven "current reports" (material events). We store
only structured metadata from the SEC submissions JSON API: the reported Item
codes (e.g. 2.02 Results of Operations, 5.02 Director/Officer changes, 7.01
Reg FD, 8.01 Other Events), filing/event dates, and a reference URL to the
primary document. No HTML scraping, no narrative body text.
"""

from django.db import models


class Filing8K(models.Model):
    """SEC 8-K current report (structured metadata only)."""

    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="filings_8k"
    )
    # SEC accession number uniquely identifies a single filing.
    accession_number = models.CharField(max_length=64, unique=True)
    filed_date = models.DateField(null=True, blank=True)
    event_date = models.DateField(null=True, blank=True)  # "date of earliest event"

    # Reported item codes, e.g. ["2.02", "9.01"], and their human titles.
    items = models.JSONField(default=list, blank=True)
    item_titles = models.JSONField(default=list, blank=True)

    # Reference to the primary document on EDGAR (not fetched/scraped).
    primary_document = models.CharField(max_length=256, blank=True, default="")
    source_url = models.URLField(max_length=512, blank=True, default="")

    # Structured flags from the submissions API.
    size = models.BigIntegerField(default=0)
    is_xbrl = models.BooleanField(default=False)
    is_inline_xbrl = models.BooleanField(default=False)

    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-filed_date"]
        indexes = [
            models.Index(fields=["stock", "-filed_date"]),
        ]

    def __str__(self):
        items = ",".join(self.items) if self.items else "?"
        return f"{self.stock.symbol} 8-K [{items}] {self.filed_date}"
