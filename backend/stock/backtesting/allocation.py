"""Asset-allocation backtester — weight-driven, periodic rebalancing.

Distinct from the signal-driven ``BacktestEngine`` (which trades individual
stocks on entry/exit signals). This simulates holding a fixed basket of
asset-class proxies at target weights, rebalancing on a schedule, and reports
risk/return metrics so different allocations can be compared.

See docs/specs/allocation-backtester-spec.md. Phase 1: price-return (close
prices, no dividends), no fees/taxes, fractional shares. Limitations are
surfaced in the output ``assumptions`` list.

Analysis tool, not financial advice.
"""

from __future__ import annotations

from datetime import date

import numpy as np

TRADING_DAYS = 252
_REBALANCE = {"none", "monthly", "quarterly", "annual"}


class AllocationBacktester:
    """Backtest one or more named weight allocations over common history.

    allocations: list of {"name": str, "weights": {symbol: pct}} where pct sum ~100.
    """

    def __init__(
        self,
        allocations,
        start_date=None,
        end_date=None,
        initial_cash=100_000,
        rebalance="quarterly",
        risk_free_rate=0.04,
    ):
        if rebalance not in _REBALANCE:
            raise ValueError(f"rebalance must be one of {_REBALANCE}")
        self.allocations = allocations
        self.start_date = self._as_date(start_date)
        self.end_date = self._as_date(end_date)
        self.initial_cash = initial_cash
        self.rebalance = rebalance
        self.risk_free_rate = risk_free_rate

    @staticmethod
    def _as_date(d):
        if d is None or isinstance(d, date):
            return d
        return date.fromisoformat(d)

    # ------------------------------------------------------------------ data
    def _all_symbols(self):
        syms = set()
        for a in self.allocations:
            syms.update(a["weights"].keys())
        return sorted(syms)

    def _load_prices(self, symbols):
        """Return {symbol: {date: close}} and the sorted common trading dates."""
        from stock.models import MyStockHistorical

        series = {}
        for sym in symbols:
            qs = MyStockHistorical.objects.filter(stock__symbol=sym).order_by("on")
            if self.start_date:
                qs = qs.filter(on__gte=self.start_date)
            if self.end_date:
                qs = qs.filter(on__lte=self.end_date)
            rows = list(qs.values_list("on", "close_price"))
            if rows:
                series[sym] = {d: float(p) for d, p in rows if p}
        return series

    @staticmethod
    def _common_dates(series, symbols):
        """Dates where EVERY required symbol has a price (shortest common hist)."""
        if not series:
            return []
        date_sets = [set(series[s].keys()) for s in symbols if s in series]
        if not date_sets:
            return []
        common = set.intersection(*date_sets)
        return sorted(common)

    @staticmethod
    def _is_rebalance_day(prev_d, cur_d, freq):
        if freq == "none":
            return False
        if freq == "monthly":
            return prev_d.month != cur_d.month
        if freq == "quarterly":
            return (prev_d.month - 1) // 3 != (cur_d.month - 1) // 3 or prev_d.year != cur_d.year
        if freq == "annual":
            return prev_d.year != cur_d.year
        return False

    # -------------------------------------------------------------- simulate
    def _simulate_one(self, weights, series, dates):
        """Return a daily equity curve [{date, value}] for one allocation."""
        syms = [s for s in weights if s in series]
        wsum = sum(weights[s] for s in syms)
        if wsum <= 0:
            return []
        # normalize weights across the symbols that actually have data
        w = {s: weights[s] / wsum for s in syms}

        # initial buy at first common date (fractional shares)
        d0 = dates[0]
        shares = {s: (self.initial_cash * w[s]) / series[s][d0] for s in syms}

        curve = []
        prev_d = d0
        for d in dates:
            # rebalance back to target weights on schedule (before marking)
            if d != d0 and self._is_rebalance_day(prev_d, d, self.rebalance):
                total = sum(shares[s] * series[s][d] for s in syms)
                shares = {s: (total * w[s]) / series[s][d] for s in syms}
            value = sum(shares[s] * series[s][d] for s in syms)
            curve.append({"date": str(d), "value": round(value, 2)})
            prev_d = d
        return curve

    # ----------------------------------------------------------- metrics
    def _metrics(self, curve):
        if len(curve) < 2:
            return {}
        values = np.array([c["value"] for c in curve], dtype=float)
        rets = np.diff(values) / values[:-1]
        years = len(values) / TRADING_DAYS

        total_return = values[-1] / values[0] - 1
        cagr = (values[-1] / values[0]) ** (1 / years) - 1 if years > 0 else 0.0
        vol = float(np.std(rets)) * np.sqrt(TRADING_DAYS) if len(rets) else 0.0

        rf_daily = self.risk_free_rate / TRADING_DAYS
        std = np.std(rets)
        sharpe = float((np.mean(rets) - rf_daily) / std * np.sqrt(TRADING_DAYS)) if std else 0.0
        downside = rets[rets < 0]
        dstd = np.std(downside) if len(downside) else 0.0
        sortino = float((np.mean(rets) - rf_daily) / dstd * np.sqrt(TRADING_DAYS)) if dstd else 0.0

        # max drawdown
        peak = values[0]
        max_dd = 0.0
        for v in values:
            peak = max(peak, v)
            dd = (peak - v) / peak
            max_dd = max(max_dd, dd)

        # calendar-year returns
        annual = {}
        by_year = {}
        for c in curve:
            y = int(c["date"][:4])
            by_year.setdefault(y, []).append(c["value"])
        for y, vs in by_year.items():
            annual[y] = round((vs[-1] / vs[0] - 1) * 100, 2)

        return {
            "total_return_pct": round(total_return * 100, 2),
            "cagr_pct": round(cagr * 100, 2),
            "volatility_pct": round(vol * 100, 2),
            "max_drawdown_pct": round(max_dd * 100, 2),
            "sharpe": round(sharpe, 2),
            "sortino": round(sortino, 2),
            "final_value": round(float(values[-1]), 2),
            "annual_returns": annual,
        }

    # --------------------------------------------------------------- public
    def run(self):
        symbols = self._all_symbols()
        series = self._load_prices(symbols)

        missing = [s for s in symbols if s not in series]
        if missing:
            return {
                "error": f"No price history for: {', '.join(missing)}. "
                f"Ingest them first (MyStockHistoricalYahoo).",
                "results": [],
            }

        # effective window = shortest common history across ALL symbols used
        dates = self._common_dates(series, symbols)
        if len(dates) < 2:
            return {"error": "No overlapping price history across symbols.", "results": []}

        results = []
        for a in self.allocations:
            curve = self._simulate_one(a["weights"], series, dates)
            m = self._metrics(curve)
            m["name"] = a["name"]
            m["equity_curve"] = curve
            results.append(m)

        return {
            "effective_start": str(dates[0]),
            "effective_end": str(dates[-1]),
            "trading_days": len(dates),
            "years": round(len(dates) / TRADING_DAYS, 2),
            "rebalance": self.rebalance,
            "initial_cash": self.initial_cash,
            "results": results,
            "assumptions": [
                "price return only (close prices; dividends/coupons excluded)",
                "no fees, no taxes, no transaction costs",
                "fractional shares; rebalanced to target weights on schedule",
                "window clipped to shortest common history across all symbols",
            ],
        }
