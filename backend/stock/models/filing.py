"""SEC 10-K filing model with extracted sections and LLM summaries."""

from django.db import models


class Filing10K(models.Model):
    """SEC 10-K filing with extracted and summarized sections."""

    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="filings_10k"
    )
    fiscal_year = models.IntegerField()
    filed_date = models.DateField(null=True, blank=True)
    accession_number = models.CharField(max_length=64, blank=True, default="")

    # Raw extracted sections (from edgartools)
    business_description = models.TextField(blank=True, default="")  # Item 1
    risk_factors_raw = models.TextField(blank=True, default="")      # Item 1A
    mda_raw = models.TextField(blank=True, default="")               # Item 7

    # LLM-generated summaries (via AWS Bedrock)
    business_summary = models.TextField(blank=True, default="")      # 3-5 bullet points
    revenue_segments = models.JSONField(default=dict, blank=True)    # {segment: pct}
    customer_concentration = models.TextField(blank=True, default="")
    moat_assessment = models.TextField(blank=True, default="")
    top_risks = models.JSONField(default=list, blank=True)           # [{risk, severity, category}]
    mda_highlights = models.TextField(blank=True, default="")
    competitive_position = models.TextField(blank=True, default="")

    # Meta
    summarized_at = models.DateTimeField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("stock", "fiscal_year")
        ordering = ["-fiscal_year"]

    def __str__(self):
        return f"{self.stock.symbol} 10-K FY{self.fiscal_year}"

    @property
    def has_raw_data(self):
        return bool(self.business_description or self.risk_factors_raw or self.mda_raw)

    @property
    def has_summary(self):
        return self.summarized_at is not None
