"""Core backtesting engine — event-driven day-by-day simulation."""

from datetime import date

from stock.backtesting.portfolio import Portfolio


class BacktestEngine:
    """Event-driven backtesting engine using DB historical data."""

    def __init__(self, strategy, symbols, start_date, end_date, initial_cash=100_000):
        self.strategy = strategy
        self.symbols = symbols
        self.start_date = start_date if isinstance(start_date, date) else date.fromisoformat(start_date)
        self.end_date = end_date if isinstance(end_date, date) else date.fromisoformat(end_date)
        self.initial_cash = initial_cash
        self.portfolio = Portfolio(initial_cash)
        self.trades = []

    def run(self):
        """Main backtest loop — iterate day by day through all trading dates."""
        from stock.models import MyStockHistorical

        # Prefetch all data in bulk (one query per stock — much faster than day-by-day)
        price_data = {}
        for sym in self.symbols:
            records = list(
                MyStockHistorical.objects.filter(
                    stock__symbol=sym,
                    on__gte=self.start_date,
                    on__lte=self.end_date,
                )
                .order_by("on")
                .values("on", "open_price", "high_price", "low_price", "close_price", "vol")
            )
            if records:
                price_data[sym] = records

        if not price_data:
            return self._empty_report()

        # Load earnings data if strategy needs it
        if hasattr(self.strategy, "load_earnings_data"):
            self.strategy.load_earnings_data(self.symbols, self.start_date, self.end_date)

        # Get all unique trading dates across all symbols
        all_dates = sorted(set(r["on"] for records in price_data.values() for r in records))

        # Build index for fast date lookup: {sym: {date: index}}
        date_indices = {}
        for sym, records in price_data.items():
            date_indices[sym] = {r["on"]: i for i, r in enumerate(records)}

        # Day-by-day simulation
        for current_date in all_dates:
            current_prices = {}

            for sym in price_data:
                idx = date_indices[sym].get(current_date)
                if idx is None:
                    continue

                bars = price_data[sym][: idx + 1]
                if len(bars) < 20:
                    continue

                current_bar = bars[-1]
                current_prices[sym] = current_bar["close_price"]

                # Check exit signals for open positions
                if self.portfolio.has_position(sym):
                    if self.strategy.should_exit(sym, bars, self.portfolio.get_position(sym)):
                        pnl = self.portfolio.sell(sym, current_bar["close_price"], current_date)
                        pos = {"shares": 0, "entry_price": 0, "entry_date": None}
                        # Find the trade to get shares
                        for t in reversed(self.trades):
                            if t["sym"] == sym and t["action"] == "BUY":
                                pos = t
                                break
                        self.trades.append({
                            "sym": sym,
                            "action": "SELL",
                            "date": str(current_date),
                            "price": round(current_bar["close_price"], 2),
                            "shares": pos.get("shares", 0),
                            "pnl": round(pnl, 2),
                        })

                # Check entry signals (only if we have cash and no existing position)
                elif not self.portfolio.has_position(sym) and self.portfolio.cash > 100:
                    if self.strategy.should_enter(sym, bars):
                        size = self.strategy.position_size(
                            self.portfolio.cash, self.portfolio.total_positions
                        )
                        if size > 0:
                            shares = int(size / current_bar["close_price"])
                            if shares > 0:
                                self.portfolio.buy(
                                    sym, shares, current_bar["close_price"], current_date
                                )
                                self.trades.append({
                                    "sym": sym,
                                    "action": "BUY",
                                    "date": str(current_date),
                                    "price": round(current_bar["close_price"], 2),
                                    "shares": shares,
                                })

            # Daily portfolio snapshot
            self.portfolio.snapshot(current_date, current_prices)

        # Close any remaining open positions at end
        for sym in list(self.portfolio.positions.keys()):
            if sym in price_data and price_data[sym]:
                last_bar = price_data[sym][-1]
                pnl = self.portfolio.sell(sym, last_bar["close_price"], self.end_date)
                self.trades.append({
                    "sym": sym,
                    "action": "SELL (end)",
                    "date": str(self.end_date),
                    "price": round(last_bar["close_price"], 2),
                    "pnl": round(pnl, 2),
                })

        # Generate benchmark (buy & hold SPY/VOO equivalent)
        benchmark = self._compute_benchmark(all_dates, price_data)

        # Build report
        from stock.backtesting.report import BacktestReport

        report = BacktestReport(
            trades=self.trades,
            portfolio_values=self.portfolio.value_history,
            benchmark_values=benchmark,
            initial_cash=self.initial_cash,
        )
        return report.compute()

    def _compute_benchmark(self, all_dates, price_data):
        """Compute buy-and-hold benchmark (equal weight all symbols at start)."""
        if not all_dates:
            return []

        # Use first available prices as entry
        benchmark_entries = {}
        for sym, records in price_data.items():
            if records:
                benchmark_entries[sym] = records[0]["close_price"]

        if not benchmark_entries:
            return []

        # Equal weight allocation
        per_stock = self.initial_cash / len(benchmark_entries)
        shares_held = {sym: per_stock / price for sym, price in benchmark_entries.items()}

        # Compute daily benchmark value
        benchmark = []
        date_price_map = {sym: {r["on"]: r["close_price"] for r in records} for sym, records in price_data.items()}

        for d in all_dates:
            value = sum(
                shares_held[sym] * date_price_map[sym].get(d, benchmark_entries[sym])
                for sym in shares_held
            )
            benchmark.append({"date": str(d), "value": round(value, 2)})

        return benchmark

    def _empty_report(self):
        return {
            "total_return_pct": 0,
            "annualized_return_pct": 0,
            "benchmark_return_pct": 0,
            "alpha": 0,
            "sharpe_ratio": 0,
            "max_drawdown_pct": 0,
            "win_rate_pct": 0,
            "total_trades": 0,
            "avg_hold_days": 0,
            "profit_factor": 0,
            "trades": [],
            "equity_curve": [],
            "benchmark_curve": [],
        }
