# -*- coding: utf-8 -*-

import csv
import io
import logging
import os

import requests

from stock.models import MyStock
from stock.models.earnings import EarningsEvent

logger = logging.getLogger("stock")

AV_API_KEY = os.environ.get("ALPHA_VANTAGE_API_KEY", "")
AV_BASE = "https://www.alphavantage.co/query"


def _float(val):
    try:
        return float(val) if val and val != "None" and val != "" else None
    except (ValueError, TypeError):
        return None


class EarningsCalendarWorker:
    """Fetch upcoming earnings calendar for all tracked stocks (1 API call)."""

    def get(self):
        if not AV_API_KEY:
            logger.warning("[AV] No API key set (ALPHA_VANTAGE_API_KEY)")
            return

        url = f"{AV_BASE}?function=EARNINGS_CALENDAR&horizon=3month&apikey={AV_API_KEY}"
        resp = requests.get(url, timeout=30)
        if resp.status_code != 200:
            logger.error(f"[AV] Calendar failed: {resp.status_code}")
            return

        tracked = set(MyStock.objects.values_list("symbol", flat=True))
        reader = csv.DictReader(io.StringIO(resp.text))

        count = 0
        for row in reader:
            symbol = row.get("symbol", "")
            if symbol not in tracked:
                continue

            stock = MyStock.objects.get(symbol=symbol)
            report_date = row.get("reportDate")
            if not report_date:
                continue

            EarningsEvent.objects.update_or_create(
                stock=stock,
                report_date=report_date,
                defaults={
                    "fiscal_date_ending": row.get("fiscalDateEnding") or None,
                    "estimated_eps": _float(row.get("estimate")),
                },
            )
            count += 1

        logger.info(f"[AV] Calendar: {count} events updated")


class EarningsSurpriseWorker:
    """Fetch historical earnings surprises for a single stock."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        if not AV_API_KEY:
            return

        url = f"{AV_BASE}?function=EARNINGS&symbol={self.stock.symbol}&apikey={AV_API_KEY}"
        resp = requests.get(url, timeout=15)
        if resp.status_code != 200:
            return

        data = resp.json()
        for q in data.get("quarterlyEarnings", []):
            report_date = q.get("reportedDate")
            if not report_date:
                continue

            EarningsEvent.objects.update_or_create(
                stock=self.stock,
                report_date=report_date,
                defaults={
                    "fiscal_date_ending": q.get("fiscalDateEnding") or None,
                    "estimated_eps": _float(q.get("estimatedEPS")),
                    "reported_eps": _float(q.get("reportedEPS")),
                    "surprise": _float(q.get("surprise")),
                    "surprise_pct": _float(q.get("surprisePercentage")),
                },
            )
