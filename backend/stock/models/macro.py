# -*- coding: utf-8 -*-

from django.db import models


class MacroSeries(models.Model):
    """FRED economic time series metadata."""

    series_id = models.CharField(max_length=32, unique=True)
    title = models.CharField(max_length=256)
    frequency = models.CharField(max_length=16, default="")
    units = models.CharField(max_length=128, default="")
    category = models.CharField(max_length=64, default="misc")
    last_updated = models.DateTimeField(null=True)

    class Meta:
        ordering = ["category", "series_id"]

    def __str__(self):
        return f"{self.series_id}: {self.title}"


class MacroDataPoint(models.Model):
    """Individual FRED observation."""

    series = models.ForeignKey(
        MacroSeries, on_delete=models.CASCADE, related_name="data_points"
    )
    date = models.DateField()
    value = models.FloatField()

    class Meta:
        unique_together = ("series", "date")
        indexes = [
            models.Index(fields=["series", "-date"]),
        ]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.series.series_id} {self.date}: {self.value}"
