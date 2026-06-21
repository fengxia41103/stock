# -*- coding: utf-8 -*-

"""Compute rolling correlations between stock returns and FRED macro series.

Usage: python manage.py compute_macro_correlations
"""

import numpy as np
from django.core.management.base import BaseCommand

from stock.models import MyStock
from stock.models.macro import MacroDataPoint, MacroSeries


class Command(BaseCommand):
    help = "Compute stock vs macro series correlations"

    def handle(self, *args, **options):
        key_series = ["DGS10", "T10Y2Y", "CPIAUCSL", "UNRATE", "INDPRO"]
        windows = [90, 180, 365]

        for stock in MyStock.objects.all():
            prices = list(
                stock.historicals.order_by("on").values_list("on", "close_price")
            )
            if len(prices) < 90:
                continue

            # Compute daily returns
            returns = {}
            for i in range(1, len(prices)):
                if prices[i - 1][1] and prices[i - 1][1] != 0:
                    returns[prices[i][0]] = (
                        (prices[i][1] - prices[i - 1][1]) / prices[i - 1][1]
                    )

            for series_id in key_series:
                series = MacroSeries.objects.filter(series_id=series_id).first()
                if not series:
                    continue

                macro_points = dict(
                    series.data_points.order_by("date").values_list("date", "value")
                )
                if len(macro_points) < 30:
                    continue

                # Compute macro changes
                macro_dates = sorted(macro_points.keys())
                macro_changes = {}
                for i in range(1, len(macro_dates)):
                    prev_val = macro_points[macro_dates[i - 1]]
                    curr_val = macro_points[macro_dates[i]]
                    if prev_val and prev_val != 0:
                        macro_changes[macro_dates[i]] = (curr_val - prev_val) / abs(prev_val)

                for window in windows:
                    # Align dates
                    common_dates = sorted(set(returns.keys()) & set(macro_changes.keys()))
                    if len(common_dates) < window // 2:
                        continue

                    recent = common_dates[-window:]
                    stock_vals = [returns[d] for d in recent]
                    macro_vals = [macro_changes[d] for d in recent]

                    if len(stock_vals) < 20:
                        continue

                    try:
                        corr = np.corrcoef(stock_vals, macro_vals)[0, 1]
                        if not np.isnan(corr):
                            self.stdout.write(
                                f"  {stock.symbol} vs {series_id} ({window}d): r={corr:.3f}"
                            )
                    except Exception:
                        pass

        self.stdout.write(self.style.SUCCESS("Done"))
