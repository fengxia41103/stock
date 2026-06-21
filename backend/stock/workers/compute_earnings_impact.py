# -*- coding: utf-8 -*-

import logging
from datetime import date, timedelta

from django.db.models import Avg

from stock.models import MyStock
from stock.models.earnings import EarningsEvent, EarningsPriceImpact

logger = logging.getLogger("stock")


def compute_earnings_impact(symbol):
    """Compute and store post-earnings price impact for a stock."""
    stock = MyStock.objects.get(symbol=symbol)
    events = stock.earnings_events.filter(
        reported_eps__isnull=False,
        report_date__lte=date.today() - timedelta(days=7),
    ).exclude(price_impact__isnull=False)

    updated = 0
    for event in events:
        historicals = stock.historicals.filter(
            on__gte=event.report_date - timedelta(days=5),
            on__lte=event.report_date + timedelta(days=10),
        ).order_by("on")

        before = historicals.filter(on__lt=event.report_date).last()
        after_1d = historicals.filter(on__gte=event.report_date).first()
        if not (before and after_1d and before.close_price):
            continue

        after_records = list(historicals.filter(on__gt=event.report_date)[:5])
        after_5d = after_records[-1] if len(after_records) >= 5 else None

        avg_vol = stock.historicals.filter(
            on__lt=event.report_date
        ).order_by("-on")[:20].aggregate(Avg("vol"))["vol__avg"]

        vol_ratio = after_1d.vol / avg_vol if avg_vol and after_1d.vol else None

        EarningsPriceImpact.objects.update_or_create(
            earnings_event=event,
            defaults={
                "price_before": before.close_price,
                "price_after_1d": after_1d.close_price,
                "price_after_5d": after_5d.close_price if after_5d else None,
                "gap_pct": (after_1d.open_price / before.close_price - 1) * 100,
                "reaction_1d_pct": (after_1d.close_price / before.close_price - 1) * 100,
                "reaction_5d_pct": (after_5d.close_price / before.close_price - 1) * 100 if after_5d else None,
                "volume_ratio": vol_ratio,
            },
        )
        updated += 1

    return updated


def compute_all_earnings_impact():
    """Run for all stocks with earnings data."""
    total = 0
    for stock in MyStock.objects.filter(earnings_events__reported_eps__isnull=False).distinct():
        total += compute_earnings_impact(stock.symbol)
    logger.info(f"[Earnings Impact] Computed {total} new records")
    return total
