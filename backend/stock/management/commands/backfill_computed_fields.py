# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from stock.models import MyStock, MyStockHistorical


class Command(BaseCommand):
    help = "Backfill denormalized computed fields on historicals and stocks."

    def handle(self, *args, **options):
        self._backfill_historicals()
        self._backfill_stocks()

    def _backfill_historicals(self):
        stocks = MyStock.objects.all()
        for stock in stocks:
            self.stdout.write(f"Processing {stock.symbol}...")
            historicals = list(
                stock.historicals.order_by("on").values_list(
                    "id", "on", "open_price", "close_price", "vol"
                )
            )
            if not historicals:
                continue

            closes = [(h[1], h[3]) for h in historicals]  # (date, close_price)
            updates = []

            for idx, (pk, on, open_price, close_price, vol) in enumerate(historicals):
                # vol_over_share_outstanding
                vos = vol / stock.shares_outstanding * 0.001 if stock.shares_outstanding else 0

                # last_lower: count trading days back to last close < this close
                last_lower = 0
                for j in range(idx - 1, -1, -1):
                    if closes[j][1] < close_price:
                        last_lower = idx - j
                        break

                # last_better: count trading days back to last close > this close
                last_better = 0
                for j in range(idx - 1, -1, -1):
                    if closes[j][1] > close_price:
                        last_better = idx - j
                        break

                # next_better: count trading days forward to next close > this open
                next_better = 0
                for j in range(idx + 1, len(historicals)):
                    if closes[j][1] > open_price:
                        next_better = j - idx
                        break

                # gain_probability: % of future days where close > this open
                future = historicals[idx + 1:]
                gain_days = sum(1 for h in future if h[3] > open_price)
                gain_prob = gain_days / len(future) * 100.0 if future else 0

                updates.append(
                    MyStockHistorical(
                        id=pk,
                        d_last_lower=last_lower,
                        d_last_better=last_better,
                        d_next_better=next_better,
                        d_gain_probability=round(gain_prob, 2),
                        d_vol_over_share_outstanding=round(vos, 4),
                    )
                )

            MyStockHistorical.objects.bulk_update(
                updates,
                ["d_last_lower", "d_last_better", "d_next_better", "d_gain_probability", "d_vol_over_share_outstanding"],
                batch_size=500,
            )
            self.stdout.write(f"  Updated {len(updates)} records.")

    def _backfill_stocks(self):
        for stock in MyStock.objects.all():
            hist = stock.historicals.order_by("-on").first()
            if hist:
                stock.d_last_lower = hist.d_last_lower
                stock.d_last_better = hist.d_last_better

            ratio = stock.ratios.filter(pe__gt=0).order_by("-on").first()
            stock.d_pe = ratio.pe if ratio else None
            ratio = stock.ratios.filter(pb__gt=0).order_by("-on").first()
            stock.d_pb = ratio.pb if ratio else None
            ratio = stock.ratios.filter(ps__gt=0).order_by("-on").first()
            stock.d_ps = ratio.ps if ratio else None

            balance = stock.balances.order_by("-on").first()
            if balance and hist:
                cash_per_share = balance.cash_and_cash_equivalent_per_share
                if hist.close_price and cash_per_share:
                    stock.d_price_to_cash_premium = hist.close_price / cash_per_share

            stock.save(update_fields=[
                "d_pe", "d_pb", "d_ps", "d_last_lower", "d_last_better", "d_price_to_cash_premium"
            ])
            self.stdout.write(f"  {stock.symbol}: pe={stock.d_pe}, pb={stock.d_pb}, last_lower={stock.d_last_lower}")
