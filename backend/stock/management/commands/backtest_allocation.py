"""Compare asset-allocation mixes via historical backtest.

Weight-driven, periodically-rebalanced simulation over the shortest common
price history of the symbols used. Reports risk/return per allocation.

Analysis tool, not financial advice.

Usage:
    python manage.py backtest_allocation \
      --alloc "Current=SPYG:44,MSFT:16,VOO:10,RCL:4,GOOGL:2,TSM:1" \
      --alloc "DIY-Advisor=VOO:38,VO:12,VB:7,VEA:23,VWO:4,BND:11,BNDX:1,VNQ:2,TIP:2" \
      --rebalance quarterly --start 2013-01-01

Each --alloc is "Name=SYM:pct,SYM:pct,...". Weights are normalized if they
don't sum to exactly 100.
"""

import json

from django.core.management.base import BaseCommand, CommandError

from stock.backtesting.allocation import AllocationBacktester


class Command(BaseCommand):
    help = "Backtest and compare asset-allocation mixes (weight-driven, rebalanced)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--alloc", action="append", required=True, dest="allocs",
            help='"Name=SYM:pct,SYM:pct,...". Repeatable.',
        )
        parser.add_argument("--start", default=None, help="YYYY-MM-DD (default: earliest common)")
        parser.add_argument("--end", default=None, help="YYYY-MM-DD (default: latest common)")
        parser.add_argument("--initial", type=float, default=100_000)
        parser.add_argument(
            "--rebalance", default="quarterly",
            choices=["none", "monthly", "quarterly", "annual"],
        )
        parser.add_argument("--rf", type=float, default=0.04, help="Risk-free rate for Sharpe")
        parser.add_argument(
            "--json", dest="json_out", default=None,
            help="Write full result JSON to path",
        )

    def _parse_alloc(self, spec):
        if "=" not in spec:
            raise CommandError(f"Bad --alloc (missing '='): {spec}")
        name, body = spec.split("=", 1)
        weights = {}
        for part in body.split(","):
            if not part.strip():
                continue
            if ":" not in part:
                raise CommandError(f"Bad weight (missing ':'): {part}")
            sym, pct = part.split(":", 1)
            weights[sym.strip().upper()] = float(pct)
        if not weights:
            raise CommandError(f"No weights in: {spec}")
        return {"name": name.strip(), "weights": weights}

    def handle(self, *args, **opts):
        allocations = [self._parse_alloc(s) for s in opts["allocs"]]

        bt = AllocationBacktester(
            allocations=allocations,
            start_date=opts["start"],
            end_date=opts["end"],
            initial_cash=opts["initial"],
            rebalance=opts["rebalance"],
            risk_free_rate=opts["rf"],
        )
        out = bt.run()

        if out.get("error"):
            raise CommandError(out["error"])

        self.stdout.write("")
        self.stdout.write(
            f"Window: {out['effective_start']} .. {out['effective_end']} "
            f"({out['years']}y, {out['trading_days']} days) | "
            f"rebalance={out['rebalance']} | start ${opts['initial']:,.0f}"
        )
        self.stdout.write("")
        hdr = (
            f"{'Allocation':22}{'CAGR%':>8}{'Vol%':>8}{'MaxDD%':>9}"
            f"{'Sharpe':>8}{'Sortino':>9}{'Final$':>14}"
        )
        self.stdout.write(hdr)
        self.stdout.write("-" * len(hdr))
        for r in out["results"]:
            self.stdout.write(
                f"{r['name']:22}{r['cagr_pct']:>8.2f}{r['volatility_pct']:>8.2f}"
                f"{r['max_drawdown_pct']:>9.2f}{r['sharpe']:>8.2f}{r['sortino']:>9.2f}"
                f"{r['final_value']:>14,.0f}"
            )
        self.stdout.write("")
        self.stdout.write("Assumptions: " + "; ".join(out["assumptions"]))
        self.stdout.write(
            self.style.WARNING(
                "Analysis only, not advice. Past performance != future results."
            )
        )

        if opts["json_out"]:
            with open(opts["json_out"], "w") as f:
                json.dump(out, f, indent=2)
            self.stdout.write(f"Wrote JSON -> {opts['json_out']}")
