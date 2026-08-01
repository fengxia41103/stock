"""Technical indicators for backtesting."""

import numpy as np


def rsi(closes, period=14):
    """Compute RSI from a list/array of close prices.

    Returns the RSI value for the most recent bar.
    Requires at least period+1 data points.
    """
    closes = np.array(closes, dtype=float)
    if len(closes) < period + 1:
        return 50.0  # Neutral if insufficient data

    deltas = np.diff(closes)
    gains = np.where(deltas > 0, deltas, 0.0)
    losses = np.where(deltas < 0, -deltas, 0.0)

    # Use exponential moving average (Wilder's smoothing)
    avg_gain = np.mean(gains[:period])
    avg_loss = np.mean(losses[:period])

    for i in range(period, len(gains)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100.0 - (100.0 / (1.0 + rs))


def sma(closes, period):
    """Simple moving average of the last `period` values."""
    closes = np.array(closes, dtype=float)
    if len(closes) < period:
        return closes[-1] if len(closes) > 0 else 0.0
    return float(np.mean(closes[-period:]))


def ema(closes, period):
    """Exponential moving average."""
    closes = np.array(closes, dtype=float)
    if len(closes) < period:
        return closes[-1] if len(closes) > 0 else 0.0
    multiplier = 2.0 / (period + 1)
    ema_val = np.mean(closes[:period])
    for price in closes[period:]:
        ema_val = (price - ema_val) * multiplier + ema_val
    return float(ema_val)


def bollinger_bands(closes, period=20, std_dev=2):
    """Bollinger Bands. Returns (lower, middle, upper)."""
    closes = np.array(closes, dtype=float)
    if len(closes) < period:
        mid = closes[-1] if len(closes) > 0 else 0.0
        return mid, mid, mid
    mid = float(np.mean(closes[-period:]))
    std = float(np.std(closes[-period:]))
    return mid - std_dev * std, mid, mid + std_dev * std


def average_volume(volumes, period=20):
    """Average volume over the last `period` bars."""
    volumes = np.array(volumes, dtype=float)
    if len(volumes) < period:
        return float(np.mean(volumes)) if len(volumes) > 0 else 0.0
    return float(np.mean(volumes[-period:]))


def highest_high(highs, period=20):
    """Highest high over last `period` bars."""
    highs = np.array(highs, dtype=float)
    if len(highs) < period:
        return float(np.max(highs)) if len(highs) > 0 else 0.0
    return float(np.max(highs[-period:]))


def lowest_low(lows, period=20):
    """Lowest low over last `period` bars."""
    lows = np.array(lows, dtype=float)
    if len(lows) < period:
        return float(np.min(lows)) if len(lows) > 0 else 0.0
    return float(np.min(lows[-period:]))
