"""Import stock prices and portfolio positions from Fidelity CSV export.

Usage:
    python manage.py import_fidelity_csv /path/to/Portfolio_Positions_*.csv
"""

import csv
import re
from datetime import date, datetime
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from stock.models import MyStock
from stock.models.historical import MyStockHistorical
from stock.models.portfolio import Position

User = get_user_model()


def parse_dollar(value):
    """Parse dollar values like '$486.88' or '+$19660.36' or '-$64.29'."""
    if not value:
        return None
    cleaned = re.sub(r"[,$+]", "", value.strip())
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return None


def parse_pct(value):
    """Parse percentage values like '+0.17%' or '-0.09%'."""
    if not value:
        return None
    cleaned = value.strip().replace("%", "").replace("+", "")
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return None


class Command(BaseCommand):
    help = "Import stock prices and portfolio data from Fidelity CSV export"

    def add_arguments(self, parser):
        parser.add_argument("csv_file", type=str, help="Path to the Fidelity CSV file")
        parser.add_argument(
            "--date",
            type=str,
            default=None,
            help="Override date (YYYY-MM-DD). Defaults to today.",
        )
        parser.add_argument(
            "--user",
            type=str,
            default="fengxia",
            help="Username for portfolio position updates",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be done without making changes",
        )

    def handle(self, *args, **options):
        csv_file = options["csv_file"]
        dry_run = options["dry_run"]
        username = options["user"]

        # Determine date
        if options["date"]:
            target_date = datetime.strptime(options["date"], "%Y-%m-%d").date()
        else:
            target_date = date.today()

        self.stdout.write(f"Importing from: {csv_file}")
        self.stdout.write(f"Target date: {target_date}")
        self.stdout.write(f"Dry run: {dry_run}")
        self.stdout.write("")

        # Get user
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stderr.write(f"User '{username}' not found")
            return

        # Parse CSV
        rows = self._parse_csv(csv_file)
        self.stdout.write(f"Found {len(rows)} stock rows in CSV\n")

        # Get tracked stock symbols
        tracked_symbols = set(MyStock.objects.values_list("symbol", flat=True))

        # Process each row
        prices_updated = 0
        positions_updated = 0

        for row in rows:
            symbol = row["symbol"]
            price = row["price"]
            shares = row["shares"]
            avg_cost = row["avg_cost"]
            account = row["account_name"]

            # Skip if not tracked in our app
            if symbol not in tracked_symbols:
                self.stdout.write(f"  SKIP {symbol} (not tracked)")
                continue

            stock = MyStock.objects.get(symbol=symbol)

            # Update price (create historical record for today)
            if price is not None:
                if not dry_run:
                    obj, created = MyStockHistorical.objects.update_or_create(
                        stock=stock,
                        on=target_date,
                        defaults={
                            "open_price": price,
                            "high_price": price,
                            "low_price": price,
                            "close_price": price,
                            "adj_close": price,
                            "vol": 0,
                        },
                    )
                    action = "CREATED" if created else "UPDATED"
                else:
                    action = "WOULD CREATE/UPDATE"
                self.stdout.write(
                    f"  {action} price for {symbol}: ${price:.2f} on {target_date}"
                )
                prices_updated += 1

            # Update portfolio position (only for Rollover IRA — main trading account)
            if account == "Rollover IRA" and shares is not None and shares > 0:
                # Find or update position
                position = Position.objects.filter(
                    user=user, stock=stock, closed_at__isnull=True
                ).first()

                if position:
                    old_shares = position.shares
                    old_cost = position.avg_cost
                    needs_update = (
                        abs(position.shares - shares) > 0.001
                        or abs(position.avg_cost - avg_cost) > 0.01
                    )
                    if needs_update:
                        if not dry_run:
                            position.shares = shares
                            position.avg_cost = avg_cost
                            position.save()
                        self.stdout.write(
                            f"  UPDATED position {symbol}: "
                            f"{old_shares:.3f}→{shares:.3f} shares, "
                            f"${old_cost:.2f}→${avg_cost:.2f} avg cost"
                        )
                        positions_updated += 1
                    else:
                        self.stdout.write(f"  OK position {symbol}: no changes needed")
                else:
                    # Create new position
                    if not dry_run:
                        Position.objects.create(
                            user=user,
                            stock=stock,
                            shares=shares,
                            avg_cost=avg_cost,
                            opened_at=target_date,
                        )
                    self.stdout.write(
                        f"  CREATED position {symbol}: "
                        f"{shares:.3f} shares @ ${avg_cost:.2f}"
                    )
                    positions_updated += 1

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(
            f"Done! Prices: {prices_updated} updated. "
            f"Positions: {positions_updated} updated."
        ))

    def _parse_csv(self, csv_file):
        """Parse Fidelity CSV and return list of stock data dicts."""
        rows = []
        with open(csv_file, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                raw_symbol = row.get("Symbol")

                # Skip rows where Symbol is None (disclaimer text at end)
                if raw_symbol is None:
                    continue

                symbol = raw_symbol.strip()

                # Skip money market, empty rows, and disclaimer text
                if not symbol or "**" in symbol or symbol.startswith('"'):
                    continue

                # Skip non-stock entries (numeric codes like 857444624)
                if symbol.isdigit():
                    continue

                # Skip fund tickers not in standard format
                # (FDRXX, SPAXX, CORE are money market)
                if symbol in ("FDRXX", "SPAXX", "CORE"):
                    continue

                price = parse_dollar(row.get("Last price", ""))
                quantity = None
                try:
                    quantity = float(row.get("Quantity", "0").replace(",", ""))
                except (ValueError, TypeError):
                    pass

                avg_cost_val = parse_dollar(row.get("Average cost basis", ""))

                if price is None and quantity is None:
                    continue

                rows.append({
                    "symbol": symbol,
                    "account_name": row.get("Account name", "").strip(),
                    "price": price,
                    "shares": quantity,
                    "avg_cost": avg_cost_val or 0,
                    "current_value": parse_dollar(row.get("Current value", "")),
                    "total_gain_pct": parse_pct(row.get("Total gain/loss percent", "")),
                })

        return rows
