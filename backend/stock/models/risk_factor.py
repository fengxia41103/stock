"""RiskFactor model — curated risk factors from 10-K reading.

Step 2 (lite) of the deep-dive research framework:
Store key risk factors per stock from annual 10-K Risk Factors section.
Track which risks are currently materializing to link to kill criteria.
"""

from django.conf import settings
from django.db import models


class RiskFactor(models.Model):
    """A curated risk factor for a stock, entered from 10-K reading."""

    CATEGORY_CHOICES = [
        ("regulatory", "Regulatory / Legal"),
        ("competitive", "Competitive"),
        ("operational", "Operational"),
        ("financial", "Financial"),
        ("macro", "Macro / Economic"),
        ("technology", "Technology / Disruption"),
        ("management", "Management / Governance"),
    ]

    SEVERITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("existential", "Existential"),
    ]

    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="risk_factors"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="risk_factors"
    )

    category = models.CharField(
        max_length=32, choices=CATEGORY_CHOICES,
        help_text="Type of risk"
    )
    description = models.TextField(
        help_text="Specific risk factor (e.g., 'OpenAI may terminate partnership')"
    )
    severity = models.CharField(
        max_length=16, choices=SEVERITY_CHOICES, default="medium",
        help_text="How bad if this materializes?"
    )
    currently_materializing = models.BooleanField(
        default=False,
        help_text="Is this risk currently happening / showing early signs?"
    )
    materializing_evidence = models.TextField(
        blank=True, default="",
        help_text="What evidence suggests this risk is materializing?"
    )
    source = models.CharField(
        max_length=64, blank=True, default="10-K",
        help_text="Where this was identified (10-K, proxy, earnings call, etc.)"
    )
    last_assessed = models.DateField(
        auto_now=True,
        help_text="Last time this risk factor was reviewed"
    )
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-currently_materializing", "-severity", "category"]

    def __str__(self):
        flag = "🔴" if self.currently_materializing else "⚪"
        return f"{flag} {self.stock.symbol}: [{self.category}] {self.description[:50]}"
