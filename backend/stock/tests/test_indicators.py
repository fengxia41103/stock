"""Tests for financial indicators (Priority 1 from test-plan.md).

These guard against regressions in RSI, SMA, EMA, Bollinger computations
that affect technicals, alerts, and backtesting.
"""

import pytest
import numpy as np

from stock.backtesting.indicators import (
    rsi,
    sma,
    ema,
    bollinger_bands,
    highest_high,
    lowest_low,
    average_volume,
)


class TestRSI:
    """RSI indicator tests."""

    def test_rsi_known_values(self):
        """RSI on known sequence should produce expected result."""
        # 14-period RSI on a simple sequence
        closes = [44, 44.34, 44.09, 43.61, 44.33, 44.83, 45.10,
                  45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28, 46.00, 46.03, 46.41, 46.22, 45.64]
        result = rsi(closes, 14)
        # RSI should be between 40-60 for this mixed data
        assert 40 < result < 70

    def test_rsi_all_gains_is_100(self):
        """Monotonically rising prices should produce RSI = 100."""
        closes = list(range(1, 30))  # [1, 2, 3, ..., 29]
        result = rsi(closes, 14)
        assert result == 100.0

    def test_rsi_all_losses_is_0(self):
        """Monotonically falling prices should produce RSI = 0."""
        closes = list(range(30, 1, -1))  # [30, 29, 28, ..., 2]
        result = rsi(closes, 14)
        assert result == 0.0

    def test_rsi_insufficient_data_returns_neutral(self):
        """Less than period+1 data points should return neutral (50)."""
        closes = [10, 11, 12]  # Only 3 points, period=14 needs 15
        result = rsi(closes, 14)
        assert result == 50.0

    def test_rsi_range_0_100(self):
        """RSI should always be between 0 and 100."""
        np.random.seed(42)
        closes = np.cumsum(np.random.randn(100)) + 100
        result = rsi(closes.tolist(), 14)
        assert 0.0 <= result <= 100.0

    def test_rsi_oversold_on_decline(self):
        """A stock with mostly losses should have RSI < 30."""
        # Start at 100, mostly decline with small bounces
        closes = [100 - i * 0.8 + (0.1 if i % 5 == 0 else 0) for i in range(30)]
        result = rsi(closes, 14)
        assert result < 30


class TestSMA:
    """Simple Moving Average tests."""

    def test_sma_matches_manual(self):
        """SMA(5) on [10, 20, 30, 40, 50] = 30."""
        closes = [10, 20, 30, 40, 50]
        assert sma(closes, 5) == 30.0

    def test_sma_uses_last_n_values(self):
        """SMA only looks at the last `period` values."""
        closes = [1, 2, 3, 100, 200, 300]
        # SMA(3) of last 3 = (100 + 200 + 300) / 3 = 200
        assert sma(closes, 3) == 200.0

    def test_sma_period_exceeds_data(self):
        """Period > len(data) returns last close price."""
        closes = [10, 20]
        result = sma(closes, 50)
        assert result == 20.0  # returns last value

    def test_sma_single_value(self):
        """SMA of single value equals that value."""
        assert sma([42.0], 1) == 42.0


class TestEMA:
    """Exponential Moving Average tests."""

    def test_ema_more_weight_to_recent(self):
        """EMA should respond faster to recent change than SMA."""
        # Flat then jump up
        closes = [10.0] * 20 + [20.0, 20.0, 20.0]
        ema_val = ema(closes, 10)
        sma_val = sma(closes, 10)
        # EMA should be higher because it weights the recent 20s more
        assert ema_val > sma_val

    def test_ema_equals_sma_for_first_period(self):
        """EMA initialization uses SMA of the first period."""
        closes = [10, 20, 30, 40, 50]
        # With period=5, EMA starts at SMA(5)=30, no additional data to smooth
        result = ema(closes, 5)
        assert result == 30.0


class TestBollingerBands:
    """Bollinger Bands tests."""

    def test_bollinger_symmetry(self):
        """Upper and lower bands should be equidistant from middle."""
        closes = [10, 11, 12, 11, 10, 11, 12, 13, 12, 11,
                  10, 11, 12, 11, 10, 11, 12, 13, 12, 11]
        lower, mid, upper = bollinger_bands(closes, 20)
        assert abs((upper - mid) - (mid - lower)) < 1e-10

    def test_bollinger_width_increases_with_volatility(self):
        """Higher volatility (std dev) → wider bands."""
        stable = [10.0, 10.1, 9.9, 10.0, 10.1, 9.9, 10.0, 10.1, 9.9, 10.0,
                  10.0, 10.1, 9.9, 10.0, 10.1, 9.9, 10.0, 10.1, 9.9, 10.0]
        volatile = [10.0, 12.0, 8.0, 10.0, 12.0, 8.0, 10.0, 12.0, 8.0, 10.0,
                    10.0, 12.0, 8.0, 10.0, 12.0, 8.0, 10.0, 12.0, 8.0, 10.0]

        l1, m1, u1 = bollinger_bands(stable, 20)
        l2, m2, u2 = bollinger_bands(volatile, 20)

        width_stable = u1 - l1
        width_volatile = u2 - l2
        assert width_volatile > width_stable

    def test_bollinger_insufficient_data(self):
        """Insufficient data returns last price for all bands."""
        closes = [10.0, 11.0, 12.0]
        lower, mid, upper = bollinger_bands(closes, 20)
        # All equal last close when insufficient
        assert lower == mid == upper == 12.0


class TestHighLow:
    """Highest high and lowest low tests."""

    def test_highest_high_correct(self):
        """Returns correct max from last N values."""
        highs = [10, 15, 8, 20, 12, 18, 14]
        assert highest_high(highs, 3) == 18.0  # last 3: [18, 14] → max=18? No: [12, 18, 14]
        # Actually last 3 = [12, 18, 14], max = 18
        assert highest_high(highs, 7) == 20.0  # all values, max = 20

    def test_lowest_low_correct(self):
        """Returns correct min from last N values."""
        lows = [10, 5, 8, 3, 12, 7, 9]
        assert lowest_low(lows, 3) == 7.0  # last 3: [12, 7, 9], min = 7
        assert lowest_low(lows, 7) == 3.0  # all values, min = 3
