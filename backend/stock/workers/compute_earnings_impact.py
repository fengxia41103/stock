# -*- coding: utf-8 -*-

"""Compute price impact of earnings announcements.

For each earnings event where reported_eps is available and report_date
has passed (+ 7 days for 5-day reaction data), compute:
- 1-day price reaction
- 5-day price reaction
- Overnight gap
- Volume ratio vs 20-day average
"""

import logging
from datetime import date, timedelta

from django.db.models import Avg

from stock.models import MyStock
from stock.models.earnings import EarningsEvent

logger = logging.getLogger("stock")


def compute_earnings_impact(symbol):
    """Compute post-earnings price impact for a stock's past earnings events."""
    stock = MyStock.objects.get(symbol=symbol)
    events = stock.earnings_events.filter(
        reported_eps__isnull=False,
        report_date__lte=date.today() - timedelta(days=7),
    ).order_by("-report_date")

    updated = 0
    for event in events:
        # Skip if already has impact fields populated via surprise_pct
        # We store impact directly on the event for simplicity
        if hasattr(event, "_impact_computed"):
            continue

        historicals = stock.historicals.filter(
            on__gte=event.report_date - timedelta(days=5),
            on__lte=event.report_date + timedelta(days=10),
        ).order_by("on")

        before = historicals.filter(on__lt=event.report_date).last()
        after_1d = historicals.filter(on__gte=event.report_date).first()

        if not (before and after_1d):
            continue

        after_records = list(historicals.filter(on__gt=event.report_date)[:5])
        after_5d = after_records[-1] if len(after_records) >= 5 else None

        # Compute volume ratio
        avg_vol = stock.historicals.filter(
            on__lt=event.report_date
        ).order_by("-on")[:20].aggregate(Avg("vol"))["vol__avg"]

        vol_ratio = after_1d.vol / avg_vol if avg_vol and after_1d.vol else None

        # Store as JSON note on the event (lightweight, no new model needed)
        # We'll just log for now — the real value is the frontend chart
        gap_pct = (after_1d.open_price / before.close_price - 1) * 100 if before.close_price else 0
        reaction_1d = (after_1d.close_price / before.close_price - 1) * 100 if before.close_price else 0
        reaction_5d = (after_5d.close_price / before.close_price - 1) * 100 if after_5d and before.close_price else None

        logger.info(
            f"[Earnings Impact] {symbol} {event.report_date}: "
            f"gap={gap_pct:.1f}% 1d={reaction_1d:.1f}% 5d={reaction_5d or 'N/A'} vol_ratio={vol_ratio or 'N/A'}"
        )
        updated += 1

    return updated


def compute_all_earnings_impact():
    """Run earnings impact computation for all stocks with earnings data."""
    for stock in MyStock.objects.filter(earnings_events__isnull=False).distinct():
        try:
            compute_earnings_impact(stock.symbol)
        except Exception as e:
            logger.error(f"[Earnings Impact] {stock.symbol}: {e}")
