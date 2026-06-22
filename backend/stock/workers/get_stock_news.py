# -*- coding: utf-8 -*-

import logging
from datetime import datetime

from yfinance import Ticker

from stock.models import MyNews, MyStock

logger = logging.getLogger("stock")


class StockNewsWorker:
    """Fetch per-stock news from Yahoo Finance."""

    def __init__(self, symbol):
        self.stock = MyStock.objects.get(symbol=symbol)

    def get(self):
        t = Ticker(self.stock.symbol)
        news = t.news or []
        count = 0

        for item in news:
            c = item.get("content", {})
            title = c.get("title", "")
            link = (
                c.get("canonicalUrl", {}).get("url", "")
                or c.get("clickThroughUrl", {}).get("url", "")
            )
            pub = c.get("pubDate", "")
            summary = c.get("summary", "") or c.get("description", "")
            provider = c.get("provider", {}).get("displayName", "Yahoo")

            if not title or not link:
                continue

            try:
                pub_time = datetime.fromisoformat(pub.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                pub_time = datetime.now()

            _, created = MyNews.objects.get_or_create(
                source=provider,
                topic=self.stock.symbol,
                link=link,
                defaults={
                    "title": title[:512],
                    "pub_time": pub_time,
                    "summary": summary[:1000],
                },
            )
            if created:
                count += 1

        if count:
            logger.info(f"[News] {self.stock.symbol}: {count} new articles")
        return count
