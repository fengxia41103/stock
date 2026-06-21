# -*- coding: utf-8 -*-

import logging
import os
from datetime import date, timedelta

import requests

from stock.models.macro import MacroDataPoint, MacroSeries

logger = logging.getLogger("stock")

FRED_API_KEY = os.environ.get("FRED_API_KEY", "")
FRED_BASE = "https://api.stlouisfed.org/fred"

SERIES_CONFIG = {
    "rates": ["DGS10", "DGS2", "FEDFUNDS", "BAMLH0A0HYM2"],
    "employment": ["UNRATE", "PAYEMS", "ICSA"],
    "inflation": ["CPIAUCSL", "CPILFESL", "T5YIE"],
    "gdp": ["GDP", "INDPRO", "RSAFS"],
    "recession": ["T10Y2Y", "SAHM", "USREC"],
    "housing": ["HOUST", "MORTGAGE30US"],
}


class FredWorker:
    """Fetch FRED economic data series using raw REST API."""

    def get_all(self):
        """Fetch all configured series."""
        if not FRED_API_KEY:
            logger.warning("[FRED] No API key set (FRED_API_KEY)")
            return
        for category, series_ids in SERIES_CONFIG.items():
            for series_id in series_ids:
                self._fetch_series(series_id, category)

    def get_series(self, series_id, category="misc"):
        """Fetch a single series."""
        if not FRED_API_KEY:
            return
        self._fetch_series(series_id, category)

    def _fetch_series(self, series_id, category):
        """Fetch metadata + observations for one series."""
        try:
            # Get series info
            info_url = (
                f"{FRED_BASE}/series?series_id={series_id}"
                f"&api_key={FRED_API_KEY}&file_type=json"
            )
            resp = requests.get(info_url, timeout=15)
            if resp.status_code != 200:
                logger.error(f"[FRED] Info failed for {series_id}: {resp.status_code}")
                return

            info = resp.json().get("seriess", [{}])[0]
            series_obj, _ = MacroSeries.objects.update_or_create(
                series_id=series_id,
                defaults={
                    "title": info.get("title", series_id),
                    "frequency": info.get("frequency_short", ""),
                    "units": info.get("units_short", ""),
                    "category": category,
                },
            )

            # Determine start date
            last_point = series_obj.data_points.order_by("-date").first()
            start = last_point.date if last_point else date.today() - timedelta(days=730)

            # Get observations
            obs_url = (
                f"{FRED_BASE}/series/observations?series_id={series_id}"
                f"&observation_start={start}&api_key={FRED_API_KEY}&file_type=json"
            )
            resp = requests.get(obs_url, timeout=15)
            if resp.status_code != 200:
                return

            observations = resp.json().get("observations", [])
            points = []
            for obs in observations:
                val = obs.get("value", ".")
                if val == "." or val is None:
                    continue
                try:
                    points.append(
                        MacroDataPoint(
                            series=series_obj,
                            date=obs["date"],
                            value=float(val),
                        )
                    )
                except (ValueError, TypeError):
                    continue

            if points:
                MacroDataPoint.objects.bulk_create(
                    points, ignore_conflicts=True, batch_size=500
                )
                logger.info(f"[FRED] {series_id}: {len(points)} points stored")

        except Exception as e:
            logger.error(f"[FRED] Failed {series_id}: {e}")
