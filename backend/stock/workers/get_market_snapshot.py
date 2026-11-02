# -*- coding: utf-8 -*-

"""Capture point-in-time market quotes (incl. pre-/post-market) for a set of
symbols and store them as MarketSnapshot rows.

Data source: yahooquery `Ticker(...).price`, which exposes `marketState` and
`preMarketPrice` / `regularMarketPrice` / `postMarketPrice` (+ change %). This
lets us record the "overnight wind" (after-hours and pre-market moves) that the
end-of-day daily bars miss.
"""

import logging

from django.utils import timezone
from yahooquery import Ticker

from stock.models import MarketSnapshot, MyStock

logger = logging.getLogger("stock")


class MarketSnapshotWorker:
    def __init__(self, symbols):
        # Normalize to a de-duplicated, upper-cased list.
        self.symbols = sorted({str(s).upper() for s in symbols if s})

    def _num(self, val):
        try:
            if val is None:
                return None
            return float(val)
        except (TypeError, ValueError):
            return None

    def _pct(self, val):
        """yahooquery returns change pct as a fraction (e.g. 0.002 = 0.2%)."""
        n = self._num(val)
        return n * 100 if n is not None else None

    def capture(self):
        """Fetch quotes and write one MarketSnapshot per resolvable symbol.

        Returns the list of created MarketSnapshot rows.
        """
        if not self.symbols:
            return []

        now = timezone.now()
        t = Ticker(self.symbols)
        price = t.price or {}

        created = []
        for sym in self.symbols:
            data = price.get(sym)
            # yahooquery returns a string (error msg) for unresolved symbols.
            if not isinstance(data, dict):
                logger.warning("MarketSnapshot: no price data for %s", sym)
                continue

            try:
                stock = MyStock.objects.get(symbol=sym)
            except MyStock.DoesNotExist:
                logger.warning("MarketSnapshot: %s not in MyStock; skipping", sym)
                continue

            snap = MarketSnapshot.objects.create(
                stock=stock,
                captured_at=now,
                market_state=data.get("marketState") or "",
                regular_price=self._num(data.get("regularMarketPrice")),
                regular_change_pct=self._pct(data.get("regularMarketChangePercent")),
                regular_previous_close=self._num(
                    data.get("regularMarketPreviousClose")
                ),
                pre_price=self._num(data.get("preMarketPrice")),
                pre_change_pct=self._pct(data.get("preMarketChangePercent")),
                post_price=self._num(data.get("postMarketPrice")),
                post_change_pct=self._pct(data.get("postMarketChangePercent")),
                source="yahooquery",
            )
            created.append(snap)

        logger.info(
            "MarketSnapshot: captured %d/%d symbols", len(created), len(self.symbols)
        )
        return created


def default_symbols():
    """Symbols to snapshot by default: everything held in an open position,
    plus any stock flagged on a watchlist-style basis (all tracked stocks is
    too broad for frequent polling, so we scope to the portfolio book).
    """
    from stock.models.portfolio import Position

    held = (
        Position.objects.filter(closed_at__isnull=True, shares__gt=0)
        .select_related("stock")
        .values_list("stock__symbol", flat=True)
        .distinct()
    )
    return sorted({s for s in held if s})
