"""Backtest result model for async execution."""

import uuid

from django.conf import settings
from django.db import models


class BacktestResult(models.Model):
    """Stores async backtest task status and results."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="backtest_results")

    # Configuration
    strategy = models.CharField(max_length=64)
    params = models.JSONField(default=dict)
    symbols = models.JSONField(default=list)
    start_date = models.DateField()
    end_date = models.DateField()
    initial_cash = models.IntegerField(default=100000)
    mode = models.CharField(max_length=16, default="run")  # "run" or "optimize"

    # Status
    state = models.CharField(max_length=20, default="PENDING")
    progress = models.IntegerField(default=0)

    # Results
    result = models.JSONField(null=True, blank=True)
    error = models.TextField(null=True, blank=True)

    created = models.DateTimeField(auto_now_add=True)
    completed = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created"]

    def __str__(self):
        return f"{self.strategy} ({self.state}) - {self.user.username}"
