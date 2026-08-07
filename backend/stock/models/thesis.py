"""StockThesis model — structured investment thesis per stock.

Bridges Steps 4, 5, 14, 15, 16 of the deep-dive research framework:
- Step 4: Key fundamental drivers
- Step 5: Embedded expectations (implied growth)
- Step 14: Re-rating mechanism
- Step 15: Bull/base/bear scenarios
- Step 16: Kill criteria and position rules
"""

from django.conf import settings
from django.db import models


class StockThesis(models.Model):
    """Structured investment thesis for a stock position."""

    EDGE_TYPES = [
        ("behavioral", "Behavioral / Time-Arbitrage"),
        ("analytical", "Analytical"),
        ("informational", "Informational"),
    ]

    GROWTH_ASSESSMENTS = [
        ("too_high", "Too High (market too optimistic)"),
        ("about_right", "About Right"),
        ("too_low", "Too Low (market too pessimistic)"),
    ]

    REFLEXIVITY_CHOICES = [
        ("low", "Low (price doesn't affect business)"),
        ("medium", "Medium"),
        ("high", "High (price drop can hurt fundamentals)"),
    ]

    CYCLE_PHASES = [
        ("peak", "Peak Returns / Max Investment"),
        ("falling", "Falling Returns / Investment Slowing"),
        ("trough", "Trough Returns / Min Investment"),
        ("rising", "Rising Returns / Investment Resuming"),
        ("", "Not Applicable"),
    ]

    STATUS_CHOICES = [
        ("active", "Active Position"),
        ("watchlist", "Watchlist"),
        ("avoid", "Avoid"),
    ]

    stock = models.OneToOneField(
        "stock.MyStock", on_delete=models.CASCADE, related_name="thesis"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="theses"
    )

    # --- Step 1: Edge & Variant Perception ---
    edge_type = models.CharField(
        max_length=32, choices=EDGE_TYPES, default="behavioral",
        help_text="What type of edge do you have?"
    )
    variant_perception = models.TextField(
        blank=True, default="",
        help_text="One-liner: what does the market not understand?"
    )

    # --- Step 4: Key Fundamental Drivers ---
    driver_1 = models.CharField(
        max_length=256, blank=True, default="",
        help_text="Primary driver (e.g., 'Azure growth rate')"
    )
    driver_2 = models.CharField(
        max_length=256, blank=True, default="",
        help_text="Secondary driver (e.g., 'Copilot seat count')"
    )
    driver_3 = models.CharField(
        max_length=256, blank=True, default="",
        help_text="Tertiary driver (e.g., 'CapEx ROI timeline')"
    )

    # --- Step 5: Embedded Expectations ---
    implied_growth_rate = models.FloatField(
        null=True, blank=True,
        help_text="Implied growth rate from reverse DCF (decimal, e.g., 0.13 = 13%)"
    )
    growth_assessment = models.CharField(
        max_length=32, choices=GROWTH_ASSESSMENTS, default="about_right",
        help_text="Is the market's implied growth reasonable?"
    )

    # --- Step 14: Re-Rating Mechanism ---
    rerate_mechanism = models.TextField(
        blank=True, default="",
        help_text="WHY the market will converge to your view"
    )
    rerate_timeframe = models.CharField(
        max_length=64, blank=True, default="",
        help_text="WHEN — e.g., 'Q4 2026 earnings' or '6-12 months'"
    )
    reflexivity_risk = models.CharField(
        max_length=16, choices=REFLEXIVITY_CHOICES, default="low",
        help_text="Does the stock price path alter the fundamentals?"
    )

    # --- Step 15: Bull / Base / Bear Scenarios ---
    bull_price = models.FloatField(null=True, blank=True)
    bull_probability = models.FloatField(
        null=True, blank=True, help_text="Probability 0-100"
    )
    base_price = models.FloatField(null=True, blank=True)
    base_probability = models.FloatField(
        null=True, blank=True, help_text="Probability 0-100"
    )
    bear_price = models.FloatField(null=True, blank=True)
    bear_probability = models.FloatField(
        null=True, blank=True, help_text="Probability 0-100"
    )

    # --- Step 16: Kill Criteria ---
    kill_criterion_1 = models.CharField(
        max_length=256, blank=True, default="",
        help_text="Primary sell trigger (e.g., 'Azure <25% two quarters')"
    )
    kill_criterion_2 = models.CharField(
        max_length=256, blank=True, default="",
        help_text="Secondary sell trigger"
    )
    kill_criterion_3 = models.CharField(
        max_length=256, blank=True, default="",
        help_text="Tertiary sell trigger"
    )
    stop_loss_price = models.FloatField(
        null=True, blank=True,
        help_text="Hard stop-loss price"
    )

    # --- Step 9: Capital Cycle ---
    capital_cycle_phase = models.CharField(
        max_length=32, choices=CYCLE_PHASES, default="", blank=True,
        help_text="Where is this industry in the capital cycle?"
    )

    # --- Meta ---
    status = models.CharField(
        max_length=16, choices=STATUS_CHOICES, default="active"
    )
    last_reviewed = models.DateField(
        auto_now=True,
        help_text="Auto-updated on save — tracks thesis freshness"
    )
    created = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(
        blank=True, default="",
        help_text="Free-form additional context"
    )

    class Meta:
        verbose_name_plural = "stock theses"
        ordering = ["-last_reviewed"]

    def __str__(self):
        return f"{self.stock.symbol} thesis ({self.status})"

    @property
    def expected_value(self):
        """Probability-weighted expected value from scenarios."""
        if not all([
            self.bull_price, self.bull_probability,
            self.base_price, self.base_probability,
            self.bear_price, self.bear_probability,
        ]):
            return None
        return (
            self.bull_price * self.bull_probability / 100
            + self.base_price * self.base_probability / 100
            + self.bear_price * self.bear_probability / 100
        )

    @property
    def reward_risk_ratio(self):
        """Expected value vs current price vs bear case."""
        ev = self.expected_value
        if ev is None or self.bear_price is None:
            return None
        current = self.stock.latest_close_price
        if current is None or current <= self.bear_price:
            return None
        upside = ev - current
        downside = current - self.bear_price
        if downside <= 0:
            return None
        return round(upside / downside, 2)

    @property
    def days_since_review(self):
        """Days since thesis was last reviewed/updated."""
        from datetime import date
        if self.last_reviewed is None:
            return None
        return (date.today() - self.last_reviewed).days

    @property
    def is_stale(self):
        """True if thesis hasn't been reviewed in >30 days."""
        days = self.days_since_review
        return days is not None and days > 30
