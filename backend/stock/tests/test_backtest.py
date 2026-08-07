"""Tests for backtest engine (Priority 4 from test-plan.md).

Validates that backtests produce correct results — bad backtest = false confidence.
"""

import pytest
from datetime import date

from stock.backtesting.portfolio import Portfolio
from stock.backtesting.indicators import rsi


class TestBacktestPortfolio:
    """Portfolio tracking in backtesting context."""

    def test_buy_deducts_cash(self):
        """Buying shares reduces cash."""
        p = Portfolio(100_000)
        p.buy("AAPL", 10, 150.0, date(2026, 1, 1))
        assert p.cash == 100_000 - (10 * 150)
        assert p.has_position("AAPL")

    def test_sell_returns_proceeds(self):
        """Selling returns shares × price to cash."""
        p = Portfolio(100_000)
        p.buy("AAPL", 10, 100.0, date(2026, 1, 1))
        pnl = p.sell("AAPL", 120.0, date(2026, 2, 1))
        assert pnl == (120 - 100) * 10  # $200 profit
        assert p.cash == 100_000 + 200  # initial - cost + proceeds
        assert not p.has_position("AAPL")

    def test_total_value_includes_positions(self):
        """Total value = cash + positions at current prices."""
        p = Portfolio(100_000)
        p.buy("AAPL", 10, 100.0, date(2026, 1, 1))
        # Cash: 100000 - 1000 = 99000
        # Position value at current price $120: 10 * 120 = 1200
        value = p.total_value({"AAPL": 120.0})
        assert value == 99_000 + 1_200

    def test_buy_more_than_cash_buys_max_affordable(self):
        """Can't buy more than cash allows — buys what it can."""
        p = Portfolio(1_000)
        result = p.buy("AAPL", 100, 150.0, date(2026, 1, 1))
        # 1000 / 150 = 6 shares max
        pos = p.get_position("AAPL")
        assert pos["shares"] == 6
        assert p.cash == 1000 - 6 * 150

    def test_sell_nonexistent_position_returns_zero(self):
        """Selling a position that doesn't exist returns 0."""
        p = Portfolio(100_000)
        pnl = p.sell("FAKE", 100.0, date(2026, 1, 1))
        assert pnl == 0.0


class TestBacktestStrategy:
    """Strategy entry/exit logic tests using DarwinRSI as reference."""

    def test_darwin_rsi_buys_on_oversold(self):
        """Strategy enters when RSI < threshold."""
        from stock.backtesting.strategies import DarwinRSIStrategy

        strategy = DarwinRSIStrategy(rsi_buy=30)
        # Create a declining price series that produces RSI < 30
        closes = [100 - i * 0.8 + (0.1 if i % 5 == 0 else 0) for i in range(30)]
        bars = [{"close_price": c, "on": date(2026, 1, 1)} for c in closes]

        computed_rsi = rsi(closes, 14)
        assert computed_rsi < 30  # Confirm our data is oversold

        result = strategy.should_enter("TEST", bars)
        assert result == True

    def test_darwin_rsi_does_not_enter_above_threshold(self):
        """Strategy does NOT enter when RSI > threshold."""
        from stock.backtesting.strategies import DarwinRSIStrategy

        strategy = DarwinRSIStrategy(rsi_buy=30)
        # Rising price series → RSI well above 30
        closes = list(range(50, 80))
        bars = [{"close_price": c, "on": date(2026, 1, 1)} for c in closes]
        result = strategy.should_enter("TEST", bars)
        assert result is False

    def test_darwin_rsi_sells_on_profit_target(self):
        """Strategy exits when profit target hit."""
        from stock.backtesting.strategies import DarwinRSIStrategy

        strategy = DarwinRSIStrategy(profit_target=0.20)
        # Current price $120, entry at $100 → 20% gain
        closes = list(range(80, 121))
        bars = [{"close_price": c, "on": date(2026, 2, 1)} for c in closes]
        position = {"entry_price": 100.0, "entry_date": date(2026, 1, 1)}

        result = strategy.should_exit("TEST", bars, position)
        assert result is True

    def test_darwin_rsi_stops_loss(self):
        """Strategy exits when stop loss hit (-10%)."""
        from stock.backtesting.strategies import DarwinRSIStrategy

        strategy = DarwinRSIStrategy(stop_loss=0.10)
        # Current price $88, entry at $100 → -12% loss
        closes = [100, 98, 95, 92, 90, 88]
        bars = [{"close_price": c, "on": date(2026, 1, i + 1)} for i, c in enumerate(closes)]
        position = {"entry_price": 100.0, "entry_date": date(2026, 1, 1)}

        result = strategy.should_exit("TEST", bars, position)
        assert result is True

    def test_darwin_rsi_time_stop(self):
        """Strategy exits after max_hold_days."""
        from stock.backtesting.strategies import DarwinRSIStrategy

        strategy = DarwinRSIStrategy(max_hold_days=60)
        # Price flat at $100, no profit/loss trigger, but 65 days held
        closes = [100.0] * 20
        bars = [{"close_price": 100.0, "on": date(2026, 3, 10)} for _ in closes]
        position = {"entry_price": 100.0, "entry_date": date(2026, 1, 1)}

        result = strategy.should_exit("TEST", bars, position)
        assert result is True

    def test_position_size_limits_max_positions(self):
        """Position size returns 0 when max positions reached."""
        from stock.backtesting.strategies import DarwinRSIStrategy

        strategy = DarwinRSIStrategy()
        # Default max_positions = 5
        size = strategy.position_size(50_000, 5)
        assert size == 0

    def test_position_size_divides_evenly(self):
        """Position size splits cash evenly across remaining slots."""
        from stock.backtesting.strategies import DarwinRSIStrategy

        strategy = DarwinRSIStrategy()
        # $100K cash, 2 of 5 slots filled → 3 remaining → $33,333 each
        size = strategy.position_size(100_000, 2)
        assert abs(size - 33_333.33) < 1
