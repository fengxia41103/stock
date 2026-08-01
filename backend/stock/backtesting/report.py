"""Backtest report generation — stats, metrics, formatting."""

import numpy as np


class BacktestReport:
    """Computes performance statistics from backtest results."""

    def __init__(self, trades, portfolio_values, benchmark_values, initial_cash):
        self.trades = trades
        self.portfolio_values = portfolio_values
        self.benchmark_values = benchmark_values
        self.initial_cash = initial_cash

    def compute(self):
        """Generate full report dict."""
        return {
            "total_return_pct": self._total_return(),
            "annualized_return_pct": self._annualized_return(),
            "benchmark_return_pct": self._benchmark_return(),
            "alpha": round(self._annualized_return() - self._benchmark_return(), 2),
            "sharpe_ratio": self._sharpe_ratio(),
            "max_drawdown_pct": self._max_drawdown(),
            "win_rate_pct": self._win_rate(),
            "total_trades": self._total_closed_trades(),
            "avg_hold_days": self._avg_hold_days(),
            "profit_factor": self._profit_factor(),
            "best_trade": self._best_trade(),
            "worst_trade": self._worst_trade(),
            "total_pnl": self._total_pnl(),
            "trades": self.trades,
            "equity_curve": self.portfolio_values,
            "benchmark_curve": self.benchmark_values,
        }

    def _total_return(self):
        if not self.portfolio_values:
            return 0.0
        final = self.portfolio_values[-1]["value"]
        return round((final - self.initial_cash) / self.initial_cash * 100, 2)

    def _annualized_return(self):
        if not self.portfolio_values or len(self.portfolio_values) < 2:
            return 0.0
        final = self.portfolio_values[-1]["value"]
        total_return = final / self.initial_cash
        # Approximate years from number of trading days
        years = len(self.portfolio_values) / 252
        if years <= 0:
            return 0.0
        annualized = (total_return ** (1 / years) - 1) * 100
        return round(annualized, 2)

    def _benchmark_return(self):
        if not self.benchmark_values:
            return 0.0
        final = self.benchmark_values[-1]["value"]
        return round((final - self.initial_cash) / self.initial_cash * 100, 2)

    def _sharpe_ratio(self):
        """Sharpe ratio assuming 4% risk-free rate."""
        if len(self.portfolio_values) < 10:
            return 0.0
        values = [v["value"] for v in self.portfolio_values]
        returns = np.diff(values) / values[:-1]
        if len(returns) == 0 or np.std(returns) == 0:
            return 0.0
        # Annualize
        mean_daily = np.mean(returns)
        std_daily = np.std(returns)
        risk_free_daily = 0.04 / 252
        sharpe = (mean_daily - risk_free_daily) / std_daily * np.sqrt(252)
        return round(float(sharpe), 2)

    def _max_drawdown(self):
        """Maximum peak-to-trough drawdown in %."""
        if not self.portfolio_values:
            return 0.0
        values = [v["value"] for v in self.portfolio_values]
        peak = values[0]
        max_dd = 0.0
        for v in values:
            if v > peak:
                peak = v
            dd = (peak - v) / peak * 100
            if dd > max_dd:
                max_dd = dd
        return round(max_dd, 2)

    def _win_rate(self):
        """Percentage of profitable trades."""
        sells = [t for t in self.trades if "pnl" in t]
        if not sells:
            return 0.0
        wins = sum(1 for t in sells if t["pnl"] > 0)
        return round(wins / len(sells) * 100, 1)

    def _total_closed_trades(self):
        return len([t for t in self.trades if "pnl" in t])

    def _avg_hold_days(self):
        """Average holding period in days."""
        buy_dates = {}
        hold_days = []
        for t in self.trades:
            if t["action"] == "BUY":
                buy_dates[t["sym"]] = t["date"]
            elif "SELL" in t["action"] and t["sym"] in buy_dates:
                from datetime import date as date_cls

                buy_d = date_cls.fromisoformat(buy_dates[t["sym"]])
                sell_d = date_cls.fromisoformat(t["date"])
                hold_days.append((sell_d - buy_d).days)
                del buy_dates[t["sym"]]
        return round(np.mean(hold_days), 1) if hold_days else 0

    def _profit_factor(self):
        """Gross profits / gross losses."""
        sells = [t for t in self.trades if "pnl" in t]
        gross_profit = sum(t["pnl"] for t in sells if t["pnl"] > 0)
        gross_loss = abs(sum(t["pnl"] for t in sells if t["pnl"] < 0))
        if gross_loss == 0:
            return 99.99 if gross_profit > 0 else 0.0
        return round(gross_profit / gross_loss, 2)

    def _total_pnl(self):
        return round(sum(t.get("pnl", 0) for t in self.trades), 2)

    def _best_trade(self):
        sells = [t for t in self.trades if "pnl" in t]
        if not sells:
            return None
        best = max(sells, key=lambda t: t["pnl"])
        return {"sym": best["sym"], "pnl": best["pnl"], "date": best["date"]}

    def _worst_trade(self):
        sells = [t for t in self.trades if "pnl" in t]
        if not sells:
            return None
        worst = min(sells, key=lambda t: t["pnl"])
        return {"sym": worst["sym"], "pnl": worst["pnl"], "date": worst["date"]}
