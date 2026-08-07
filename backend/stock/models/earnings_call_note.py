"""EarningsCallNote model — structured post-earnings review scorecard.

Step 6 of the deep-dive research framework:
Absorb the current stock narrative by tracking management tone,
guidance shifts, and key driver updates after each earnings call.
"""

from django.conf import settings
from django.db import models


class EarningsCallNote(models.Model):
    """Structured earnings call review linked to thesis drivers."""

    TONE_CHOICES = [
        ("confident", "Confident"),
        ("cautious", "Cautious"),
        ("defensive", "Defensive"),
        ("neutral", "Neutral"),
        ("evasive", "Evasive"),
    ]

    GUIDANCE_CHOICES = [
        ("raised", "Raised"),
        ("maintained", "Maintained"),
        ("lowered", "Lowered"),
        ("withdrawn", "Withdrawn"),
        ("none", "No Guidance Given"),
    ]

    stock = models.ForeignKey(
        "stock.MyStock", on_delete=models.CASCADE, related_name="earnings_call_notes"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="earnings_call_notes"
    )

    # Call identification
    quarter = models.CharField(
        max_length=8, help_text="e.g., 'Q4 2026'"
    )
    call_date = models.DateField(help_text="Date of the earnings call")
    replay_url = models.URLField(
        blank=True, default="",
        help_text="Link to earnings call replay or transcript"
    )

    # Management assessment
    management_tone = models.CharField(
        max_length=16, choices=TONE_CHOICES, default="neutral",
        help_text="Overall tone of management during the call"
    )
    key_quote = models.TextField(
        blank=True, default="",
        help_text="Most important quote from the call (verbatim or paraphrased)"
    )
    guidance_direction = models.CharField(
        max_length=16, choices=GUIDANCE_CHOICES, default="maintained",
        help_text="Did management raise, maintain, or lower guidance?"
    )

    # Thesis driver updates (tied to StockThesis.driver_1/2/3)
    driver_1_update = models.TextField(
        blank=True, default="",
        help_text="Update on primary thesis driver (e.g., 'Azure guided 45%, was 40%')"
    )
    driver_2_update = models.TextField(
        blank=True, default="",
        help_text="Update on secondary thesis driver"
    )
    driver_3_update = models.TextField(
        blank=True, default="",
        help_text="Update on tertiary thesis driver"
    )

    # Kill criteria check
    kill_triggered = models.BooleanField(
        default=False,
        help_text="Did any kill criterion from the thesis trigger this quarter?"
    )
    kill_notes = models.TextField(
        blank=True, default="",
        help_text="If kill triggered, which criterion and why"
    )

    # Analyst Q&A highlights
    analyst_pushback = models.TextField(
        blank=True, default="",
        help_text="What did analysts push back on? (reveals where debate lives)"
    )
    what_management_avoided = models.TextField(
        blank=True, default="",
        help_text="What questions did management dodge or give non-answers to?"
    )

    # Outcome
    stock_reaction_pct = models.FloatField(
        null=True, blank=True,
        help_text="Stock price change on earnings day (%)"
    )
    surprise_vs_consensus = models.TextField(
        blank=True, default="",
        help_text="Brief: beat/miss by how much on what metric"
    )

    # Meta
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-call_date"]
        unique_together = ("stock", "user", "quarter")

    def __str__(self):
        return f"{self.stock.symbol} {self.quarter} — {self.management_tone}"
