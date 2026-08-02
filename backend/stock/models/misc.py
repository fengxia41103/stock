# -*- coding: utf-8 -*-

import uuid

from django.contrib.auth.models import User
from django.db import models
from django_celery_results.models import TaskResult

from stock.models.historical import MyStockHistorical
from stock.models.stock import MyStock


class MyDiary(models.Model):
    """User journal entries with bull/bear predictions."""

    JUDGEMENT_CHOICES = [(1, "bull"), (2, "bear")]

    user = models.ForeignKey(User, related_name="diaries", on_delete=models.CASCADE)
    stock = models.ForeignKey(
        "stock.MyStock", blank=True, null=True, on_delete=models.CASCADE, related_name="diaries"
    )
    position = models.ForeignKey(
        "stock.Position", blank=True, null=True, on_delete=models.SET_NULL, related_name="diary_entries",
        help_text="Optional link to a portfolio position (trade journal)"
    )
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    content = models.TextField(default="")
    judgement = models.IntegerField(default=1, choices=JUDGEMENT_CHOICES)

    @property
    def price(self):
        stock = self.stock or MyStock.objects.get_or_create(symbol="SPY")[0]
        historical = (
            MyStockHistorical.objects.filter(stock=stock, on__lte=self.created.date())
            .order_by("-on")
            .first()
        )
        return historical.close_price if historical else 0

    @property
    def is_correct(self):
        """Was bull/bear prediction correct vs current price."""
        stock = self.stock or MyStock.objects.get_or_create(symbol="SPY")[0]
        if stock.latest_close_price:
            if stock.latest_close_price >= self.price and self.judgement == 1:
                return True
            if stock.latest_close_price <= self.price and self.judgement == 2:
                return True
        return False


class MyNews(models.Model):
    source = models.CharField(max_length=64)
    topic = models.CharField(max_length=32)
    title = models.CharField(max_length=512)
    link = models.URLField()
    pub_time = models.DateTimeField()
    summary = models.TextField()

    class Meta:
        unique_together = [["source", "topic", "link"]]
        indexes = [models.Index(fields=["source", "topic", "title"])]
        ordering = ["-pub_time"]

    def __str__(self):
        return self.title


class MyTask(models.Model):
    """Tracks Celery task execution with user ownership."""

    user = models.ForeignKey(User, related_name="tasks", on_delete=models.CASCADE)
    result = models.OneToOneField(
        TaskResult, on_delete=models.CASCADE, null=True, blank=True, related_name="mytask"
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    state = models.CharField(max_length=128)
    stocks = models.ManyToManyField("stock.MyStock", related_name="tasks")


class RankingCache(models.Model):
    """Pre-computed ranking results, refreshed periodically."""

    rank_type = models.CharField(max_length=32, unique=True)
    data = models.JSONField(default=list)
    computed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.rank_type} ({self.computed_at})"
