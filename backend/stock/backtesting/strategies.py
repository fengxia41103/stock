"""Trading strategies for backtesting."""

import numpy as np

from stock.backtesting.indicators import (
    average_volume,
    highest_high,
    lowest_low,
    rsi,
    sma,
)


class DarwinRSIStrategy:
    """Buy Darwin-quality stocks when RSI < threshold, sell when overbought or profit target hit."""

    name = "Darwin + RSI Oversold"
    description = "Buy when RSI < buy_threshold, sell at RSI > sell_threshold or profit target"

    def __init__(self, rsi_buy=30, rsi_sell=70, profit_target=0.20, stop_loss=0.10, max_hold_days=60):
        self.rsi_buy = rsi_buy
        self.rsi_sell = rsi_sell
        self.profit_target = profit_target
        self.stop_loss = stop_loss
        self.max_hold_days = max_hold_days

    def should_enter(self, symbol, bars):
        """Check if we should open a position."""
        if len(bars) < 15:
            return False
        closes = [b["close_price"] for b in bars]
        current_rsi = rsi(closes)
        return current_rsi < self.rsi_buy

    def should_exit(self, symbol, bars, position):
        """Check if we should close a position."""
        closes = [b["close_price"] for b in bars]
        current_price = closes[-1]
        current_rsi = rsi(closes)
        entry_price = position["entry_price"]
        entry_date = position["entry_date"]
        current_date = bars[-1]["on"]

        # RSI overbought
        if current_rsi > self.rsi_sell:
            return True
        # Profit target
        if current_price >= entry_price * (1 + self.profit_target):
            return True
        # Stop loss
        if current_price <= entry_price * (1 - self.stop_loss):
            return True
        # Time stop
        days_held = (current_date - entry_date).days
        if days_held >= self.max_hold_days:
            return True
        return False

    def position_size(self, cash, num_positions):
        """Determine how much cash to allocate to this trade."""
        max_positions = 5
        if num_positions >= max_positions:
            return 0
        return cash / (max_positions - num_positions)

    @classmethod
    def params_schema(cls):
        return [
            {"key": "rsi_buy", "label": "RSI Buy Threshold", "default": 30, "min": 10, "max": 50, "type": "int"},
            {"key": "rsi_sell", "label": "RSI Sell Threshold", "default": 70, "min": 50, "max": 90, "type": "int"},
            {"key": "profit_target", "label": "Profit Target %", "default": 20, "min": 5, "max": 100, "type": "pct"},
            {"key": "stop_loss", "label": "Stop Loss %", "default": 10, "min": 2, "max": 30, "type": "pct"},
            {"key": "max_hold_days", "label": "Max Hold Days", "default": 60, "min": 5, "max": 252, "type": "int"},
        ]


class BoxTradingStrategy:
    """Buy at N-day low with volume confirmation, sell at N-day high or stop."""

    name = "Box Trading"
    description = "Buy at period low with volume spike, sell at period high or stop loss"

    def __init__(self, lookback=20, volume_multiplier=1.5, stop_loss=0.03, max_hold_days=10):
        self.lookback = lookback
        self.volume_multiplier = volume_multiplier
        self.stop_loss = stop_loss
        self.max_hold_days = max_hold_days

    def should_enter(self, symbol, bars):
        """Buy when price near 20-day low AND volume above average."""
        if len(bars) < self.lookback + 1:
            return False

        closes = [b["close_price"] for b in bars]
        lows = [b["low_price"] for b in bars]
        volumes = [b["vol"] for b in bars]

        current_price = closes[-1]
        period_low = lowest_low(lows[:-1], self.lookback)
        avg_vol = average_volume(volumes[:-1], self.lookback)
        current_vol = volumes[-1]

        # Price within 2% of period low AND volume confirmation
        near_low = current_price <= period_low * 1.02
        vol_confirm = current_vol > avg_vol * self.volume_multiplier

        return near_low and vol_confirm

    def should_exit(self, symbol, bars, position):
        """Sell at period high or stop loss."""
        closes = [b["close_price"] for b in bars]
        highs = [b["high_price"] for b in bars]
        current_price = closes[-1]
        entry_price = position["entry_price"]
        entry_date = position["entry_date"]
        current_date = bars[-1]["on"]

        # Hit period high (profit target)
        period_high = highest_high(highs[:-1], self.lookback)
        if current_price >= period_high * 0.98:
            return True
        # Stop loss
        if current_price <= entry_price * (1 - self.stop_loss):
            return True
        # Time stop
        days_held = (current_date - entry_date).days
        if days_held >= self.max_hold_days:
            return True
        return False

    def position_size(self, cash, num_positions):
        max_positions = 3
        if num_positions >= max_positions:
            return 0
        return cash * 0.30  # 30% per position max

    @classmethod
    def params_schema(cls):
        return [
            {"key": "lookback", "label": "Lookback Period (days)", "default": 20, "min": 5, "max": 60, "type": "int"},
            {"key": "volume_multiplier", "label": "Volume Multiplier (x avg)", "default": 1.5, "min": 1.0, "max": 5.0, "type": "float"},
            {"key": "stop_loss", "label": "Stop Loss %", "default": 3, "min": 1, "max": 10, "type": "pct"},
            {"key": "max_hold_days", "label": "Max Hold Days", "default": 10, "min": 3, "max": 30, "type": "int"},
        ]


class EarningsBeatStrategy:
    """Buy after earnings beat, hold for N days."""

    name = "Earnings Beat + Hold"
    description = "Buy when stock beats earnings, hold for specified days"

    def __init__(self, hold_days=30, min_surprise_pct=0):
        self.hold_days = hold_days
        self.min_surprise_pct = min_surprise_pct
        self._earnings_signals = {}  # {symbol: [dates of beats]}

    def load_earnings_data(self, symbols, start_date, end_date):
        """Pre-load earnings events for all symbols."""
        from stock.models import EarningsEvent, MyStock

        for sym in symbols:
            try:
                stock = MyStock.objects.get(symbol=sym)
                events = EarningsEvent.objects.filter(
                    stock=stock,
                    report_date__gte=start_date,
                    report_date__lte=end_date,
                    surprise_pct__isnull=False,
                    surprise_pct__gt=self.min_surprise_pct,
                )
                self._earnings_signals[sym] = [e.report_date for e in events]
            except Exception:
                self._earnings_signals[sym] = []

    def should_enter(self, symbol, bars):
        """Buy on the day after an earnings beat."""
        if not bars:
            return False
        current_date = bars[-1]["on"]
        from datetime import timedelta

        beat_dates = self._earnings_signals.get(symbol, [])
        # Check if yesterday or today was an earnings beat date
        for bd in beat_dates:
            diff = (current_date - bd).days
            if 0 <= diff <= 2:  # Within 2 days of beat
                return True
        return False

    def should_exit(self, symbol, bars, position):
        """Exit after hold_days."""
        current_date = bars[-1]["on"]
        entry_date = position["entry_date"]
        days_held = (current_date - entry_date).days
        return days_held >= self.hold_days

    def position_size(self, cash, num_positions):
        max_positions = 5
        if num_positions >= max_positions:
            return 0
        return cash / (max_positions - num_positions)

    @classmethod
    def params_schema(cls):
        return [
            {"key": "hold_days", "label": "Hold Days After Beat", "default": 30, "min": 5, "max": 90, "type": "int"},
            {"key": "min_surprise_pct", "label": "Min Surprise %", "default": 0, "min": -5, "max": 20, "type": "float"},
        ]


# Registry of all strategies
class BuyAndHoldStrategy:
    """Buy all stocks equal-weight on Day 1, hold forever. Benchmark strategy."""

    name = "Buy & Hold (Benchmark)"
    description = "Equal-weight buy on Day 1, never sell. Answers: does active trading add value?"

    def __init__(self):
        self._entered = set()

    def should_enter(self, symbol, bars):
        """Buy once on first available day."""
        if symbol not in self._entered and len(bars) >= 5:
            self._entered.add(symbol)
            return True
        return False

    def should_exit(self, symbol, bars, position):
        """Never sell."""
        return False

    def position_size(self, cash, num_positions):
        # Allocate equally across up to 20 positions
        max_positions = 20
        if num_positions >= max_positions:
            return 0
        return cash / max(1, (max_positions - num_positions))

    @classmethod
    def params_schema(cls):
        return []  # No parameters — pure buy and hold


class MeanReversionStrategy:
    """Buy when price falls significantly below SMA, sell when it recovers."""

    name = "Mean Reversion (SMA)"
    description = "Buy when price < SMA(period) by deviation%, sell when crosses back above"

    def __init__(self, sma_period=50, deviation_pct=10, profit_target=0.15, stop_loss=0.15, max_hold_days=90):
        self.sma_period = sma_period
        self.deviation_pct = deviation_pct / 100.0
        self.profit_target = profit_target
        self.stop_loss = stop_loss
        self.max_hold_days = max_hold_days

    def should_enter(self, symbol, bars):
        """Buy when price is deviation% below SMA."""
        if len(bars) < self.sma_period + 1:
            return False
        closes = [b["close_price"] for b in bars]
        current_price = closes[-1]
        current_sma = sma(closes, self.sma_period)

        # Price must be significantly below SMA
        if current_sma == 0:
            return False
        deviation = (current_price - current_sma) / current_sma
        return deviation < -self.deviation_pct

    def should_exit(self, symbol, bars, position):
        """Sell when price crosses back above SMA, or hit stop/target/time."""
        closes = [b["close_price"] for b in bars]
        current_price = closes[-1]
        current_sma = sma(closes, self.sma_period)
        entry_price = position["entry_price"]
        entry_date = position["entry_date"]
        current_date = bars[-1]["on"]

        # Crossed back above SMA (mean reversion complete)
        if current_price > current_sma:
            return True
        # Profit target
        if current_price >= entry_price * (1 + self.profit_target):
            return True
        # Stop loss
        if current_price <= entry_price * (1 - self.stop_loss):
            return True
        # Time stop
        days_held = (current_date - entry_date).days
        if days_held >= self.max_hold_days:
            return True
        return False

    def position_size(self, cash, num_positions):
        max_positions = 5
        if num_positions >= max_positions:
            return 0
        return cash / (max_positions - num_positions)

    @classmethod
    def params_schema(cls):
        return [
            {"key": "sma_period", "label": "SMA Period", "default": 50, "min": 20, "max": 200, "type": "int"},
            {"key": "deviation_pct", "label": "Deviation % Below SMA", "default": 10, "min": 3, "max": 30, "type": "int"},
            {"key": "profit_target", "label": "Profit Target %", "default": 15, "min": 5, "max": 50, "type": "pct"},
            {"key": "stop_loss", "label": "Stop Loss %", "default": 15, "min": 5, "max": 30, "type": "pct"},
            {"key": "max_hold_days", "label": "Max Hold Days", "default": 90, "min": 10, "max": 252, "type": "int"},
        ]


class InsiderClusterBuyStrategy:
    """Buy when multiple insiders purchase within a short window."""

    name = "Insider Cluster Buy"
    description = "Buy when 3+ insiders purchase within 14 days, hold 90 days or +15%"

    def __init__(self, min_insiders=3, cluster_days=14, hold_days=90, profit_target=0.15, stop_loss=0.10):
        self.min_insiders = min_insiders
        self.cluster_days = cluster_days
        self.hold_days = hold_days
        self.profit_target = profit_target
        self.stop_loss = stop_loss
        self._cluster_signals = {}  # {symbol: [dates]}

    def load_earnings_data(self, symbols, start_date, end_date):
        """Pre-load insider trade cluster signals."""
        from datetime import timedelta
        from stock.models import InsiderTrade, MyStock

        for sym in symbols:
            try:
                stock = MyStock.objects.get(symbol=sym)
                trades = list(
                    InsiderTrade.objects.filter(
                        stock=stock,
                        transaction_type="P",
                        trade_date__gte=start_date,
                        trade_date__lte=end_date,
                    ).order_by("trade_date").values_list("trade_date", "insider_cik")
                )

                # Find cluster dates (3+ unique insiders within 14 days)
                cluster_dates = []
                for i, (trade_date, _) in enumerate(trades):
                    window_start = trade_date
                    window_end = trade_date + timedelta(days=self.cluster_days)
                    unique_insiders = set()
                    for td, cik in trades:
                        if window_start <= td <= window_end:
                            unique_insiders.add(cik)
                    if len(unique_insiders) >= self.min_insiders:
                        cluster_dates.append(trade_date)

                self._cluster_signals[sym] = cluster_dates
            except Exception:
                self._cluster_signals[sym] = []

    def should_enter(self, symbol, bars):
        """Buy when current date is within 3 days of a cluster signal."""
        if not bars:
            return False
        current_date = bars[-1]["on"]
        cluster_dates = self._cluster_signals.get(symbol, [])

        for cd in cluster_dates:
            diff = (current_date - cd).days
            if 0 <= diff <= 3:
                return True
        return False

    def should_exit(self, symbol, bars, position):
        """Exit after hold_days or profit target or stop loss."""
        current_price = bars[-1]["close_price"]
        entry_price = position["entry_price"]
        entry_date = position["entry_date"]
        current_date = bars[-1]["on"]

        # Profit target
        if current_price >= entry_price * (1 + self.profit_target):
            return True
        # Stop loss
        if current_price <= entry_price * (1 - self.stop_loss):
            return True
        # Time stop
        days_held = (current_date - entry_date).days
        if days_held >= self.hold_days:
            return True
        return False

    def position_size(self, cash, num_positions):
        max_positions = 5
        if num_positions >= max_positions:
            return 0
        return cash / (max_positions - num_positions)

    @classmethod
    def params_schema(cls):
        return [
            {"key": "min_insiders", "label": "Min Unique Insiders", "default": 3, "min": 2, "max": 5, "type": "int"},
            {"key": "cluster_days", "label": "Cluster Window (days)", "default": 14, "min": 7, "max": 30, "type": "int"},
            {"key": "hold_days", "label": "Hold Days", "default": 90, "min": 30, "max": 180, "type": "int"},
            {"key": "profit_target", "label": "Profit Target %", "default": 15, "min": 5, "max": 50, "type": "pct"},
            {"key": "stop_loss", "label": "Stop Loss %", "default": 10, "min": 3, "max": 20, "type": "pct"},
        ]


class MomentumTrailingStopStrategy:
    """Buy when stock hits new 52-week high, ride with trailing stop."""

    name = "Momentum + Trailing Stop"
    description = "Buy at 52-week high, sell when trailing stop hit or 1 year max hold"

    def __init__(self, lookback=252, trailing_stop_pct=15, max_hold_days=252):
        self.lookback = lookback
        self.trailing_stop_pct = trailing_stop_pct / 100.0
        self.max_hold_days = max_hold_days

    def should_enter(self, symbol, bars):
        """Buy when price hits new 52-week high."""
        if len(bars) < self.lookback:
            return False
        closes = [b["close_price"] for b in bars]
        current = closes[-1]
        period_high = max(closes[-self.lookback:])
        # Current price is at or within 1% of 52-week high
        return current >= period_high * 0.99

    def should_exit(self, symbol, bars, position):
        """Exit on trailing stop or time limit."""
        closes = [b["close_price"] for b in bars]
        current_price = closes[-1]
        entry_date = position["entry_date"]
        current_date = bars[-1]["on"]

        # Track highest price since entry
        entry_idx = None
        for i, b in enumerate(bars):
            if b["on"] >= entry_date:
                entry_idx = i
                break
        if entry_idx is None:
            entry_idx = 0

        peak_since_entry = max(b["close_price"] for b in bars[entry_idx:])
        # Trailing stop: drop from peak
        if current_price <= peak_since_entry * (1 - self.trailing_stop_pct):
            return True
        # Time stop
        days_held = (current_date - entry_date).days
        if days_held >= self.max_hold_days:
            return True
        return False

    def position_size(self, cash, num_positions):
        max_positions = 5
        if num_positions >= max_positions:
            return 0
        return cash / (max_positions - num_positions)

    @classmethod
    def params_schema(cls):
        return [
            {"key": "lookback", "label": "Lookback (days)", "default": 252, "min": 50, "max": 504, "type": "int"},
            {"key": "trailing_stop_pct", "label": "Trailing Stop %", "default": 15, "min": 5, "max": 30, "type": "int"},
            {"key": "max_hold_days", "label": "Max Hold Days", "default": 252, "min": 60, "max": 504, "type": "int"},
        ]


class GoldenCrossStrategy:
    """Buy on golden cross (SMA50 > SMA200), sell on death cross."""

    name = "Golden Cross / Death Cross"
    description = "Buy when SMA(fast) crosses above SMA(slow), sell on reverse"

    def __init__(self, fast_period=50, slow_period=200):
        self.fast_period = fast_period
        self.slow_period = slow_period

    def should_enter(self, symbol, bars):
        """Buy when fast SMA crosses above slow SMA."""
        if len(bars) < self.slow_period + 2:
            return False
        closes = [b["close_price"] for b in bars]
        fast_now = sma(closes, self.fast_period)
        slow_now = sma(closes, self.slow_period)
        # Previous day
        fast_prev = sma(closes[:-1], self.fast_period)
        slow_prev = sma(closes[:-1], self.slow_period)
        # Crossover: was below, now above
        return fast_prev <= slow_prev and fast_now > slow_now

    def should_exit(self, symbol, bars, position):
        """Sell when fast SMA crosses below slow SMA (death cross)."""
        if len(bars) < self.slow_period + 2:
            return False
        closes = [b["close_price"] for b in bars]
        fast_now = sma(closes, self.fast_period)
        slow_now = sma(closes, self.slow_period)
        fast_prev = sma(closes[:-1], self.fast_period)
        slow_prev = sma(closes[:-1], self.slow_period)
        # Death cross: was above, now below
        return fast_prev >= slow_prev and fast_now < slow_now

    def position_size(self, cash, num_positions):
        max_positions = 5
        if num_positions >= max_positions:
            return 0
        return cash / (max_positions - num_positions)

    @classmethod
    def params_schema(cls):
        return [
            {"key": "fast_period", "label": "Fast SMA Period", "default": 50, "min": 10, "max": 100, "type": "int"},
            {"key": "slow_period", "label": "Slow SMA Period", "default": 200, "min": 100, "max": 400, "type": "int"},
        ]


class PostEarningsDriftStrategy:
    """Buy after large earnings beat with gap up, ride the drift."""

    name = "Post-Earnings Drift"
    description = "Buy when earnings beat >5% AND gaps up >3%, hold 60 days for drift"

    def __init__(self, min_surprise_pct=5, min_gap_pct=3, hold_days=60, stop_loss=0.08):
        self.min_surprise_pct = min_surprise_pct
        self.min_gap_pct = min_gap_pct
        self.hold_days = hold_days
        self.stop_loss = stop_loss
        self._drift_signals = {}

    def load_earnings_data(self, symbols, start_date, end_date):
        """Pre-load strong earnings beats with gap-up confirmation."""
        from stock.models.earnings import EarningsPriceImpact, EarningsEvent
        from stock.models import MyStock

        for sym in symbols:
            try:
                stock = MyStock.objects.get(symbol=sym)
                impacts = EarningsPriceImpact.objects.filter(
                    earnings_event__stock=stock,
                    earnings_event__report_date__gte=start_date,
                    earnings_event__report_date__lte=end_date,
                    earnings_event__surprise_pct__gte=self.min_surprise_pct,
                    gap_pct__gte=self.min_gap_pct,
                )
                self._drift_signals[sym] = [
                    imp.earnings_event.report_date for imp in impacts
                ]
            except Exception:
                self._drift_signals[sym] = []

    def should_enter(self, symbol, bars):
        """Buy 1-2 days after a strong beat + gap."""
        if not bars:
            return False
        current_date = bars[-1]["on"]
        signals = self._drift_signals.get(symbol, [])
        for sd in signals:
            diff = (current_date - sd).days
            if 1 <= diff <= 3:
                return True
        return False

    def should_exit(self, symbol, bars, position):
        """Exit after drift period or stop loss."""
        current_price = bars[-1]["close_price"]
        entry_price = position["entry_price"]
        entry_date = position["entry_date"]
        current_date = bars[-1]["on"]

        if current_price <= entry_price * (1 - self.stop_loss):
            return True
        days_held = (current_date - entry_date).days
        if days_held >= self.hold_days:
            return True
        return False

    def position_size(self, cash, num_positions):
        max_positions = 5
        if num_positions >= max_positions:
            return 0
        return cash / (max_positions - num_positions)

    @classmethod
    def params_schema(cls):
        return [
            {"key": "min_surprise_pct", "label": "Min Earnings Surprise %", "default": 5, "min": 1, "max": 20, "type": "float"},
            {"key": "min_gap_pct", "label": "Min Gap Up %", "default": 3, "min": 1, "max": 10, "type": "float"},
            {"key": "hold_days", "label": "Hold Days (Drift Period)", "default": 60, "min": 20, "max": 120, "type": "int"},
            {"key": "stop_loss", "label": "Stop Loss %", "default": 8, "min": 3, "max": 15, "type": "pct"},
        ]


class VolatilityBreakoutStrategy:
    """Buy on volatility expansion (range breakout), quick exit."""

    name = "Volatility Breakout"
    description = "Buy when daily range >2x average AND close in top 25% of range, hold 5 days"

    def __init__(self, range_multiplier=2.0, max_hold_days=5, profit_target=0.10, stop_loss=0.05):
        self.range_multiplier = range_multiplier
        self.max_hold_days = max_hold_days
        self.profit_target = profit_target
        self.stop_loss = stop_loss

    def should_enter(self, symbol, bars):
        """Buy when range expands significantly and close is strong."""
        if len(bars) < 21:
            return False

        current = bars[-1]
        current_range = current["high_price"] - current["low_price"]
        if current_range <= 0 or current["low_price"] <= 0:
            return False

        # Average range over prior 20 days
        avg_range = np.mean([
            b["high_price"] - b["low_price"]
            for b in bars[-21:-1]
            if b["high_price"] - b["low_price"] > 0
        ])

        if avg_range <= 0:
            return False

        # Range expansion check
        range_ratio = current_range / avg_range
        if range_ratio < self.range_multiplier:
            return False

        # Close in top 25% of range (bullish)
        close_position = (current["close_price"] - current["low_price"]) / current_range
        return close_position >= 0.75

    def should_exit(self, symbol, bars, position):
        """Quick exit: profit target, stop, or time."""
        current_price = bars[-1]["close_price"]
        entry_price = position["entry_price"]
        entry_date = position["entry_date"]
        current_date = bars[-1]["on"]

        if current_price >= entry_price * (1 + self.profit_target):
            return True
        if current_price <= entry_price * (1 - self.stop_loss):
            return True
        days_held = (current_date - entry_date).days
        if days_held >= self.max_hold_days:
            return True
        return False

    def position_size(self, cash, num_positions):
        max_positions = 3
        if num_positions >= max_positions:
            return 0
        return cash * 0.20  # Smaller position for volatile trades

    @classmethod
    def params_schema(cls):
        return [
            {"key": "range_multiplier", "label": "Range Multiplier (x avg)", "default": 2.0, "min": 1.5, "max": 4.0, "type": "float"},
            {"key": "max_hold_days", "label": "Max Hold Days", "default": 5, "min": 1, "max": 15, "type": "int"},
            {"key": "profit_target", "label": "Profit Target %", "default": 10, "min": 3, "max": 20, "type": "pct"},
            {"key": "stop_loss", "label": "Stop Loss %", "default": 5, "min": 2, "max": 10, "type": "pct"},
        ]


class LowPEValueStrategy:
    """Buy lowest PE stocks quarterly, rebalance. Graham-style value."""

    name = "Low PE Value (Graham)"
    description = "Quarterly buy 5 stocks with lowest PE (>0), sell when no longer in bottom 5"

    def __init__(self, rebalance_days=63, max_positions=5):
        self.rebalance_days = rebalance_days
        self.max_positions = max_positions
        self._pe_data = {}  # loaded from ValuationRatio

    def load_earnings_data(self, symbols, start_date, end_date):
        """Pre-load PE data for all symbols at quarterly intervals."""
        from stock.models import MyStock
        from stock.models.valuation import ValuationRatio

        for sym in symbols:
            try:
                stock = MyStock.objects.get(symbol=sym)
                ratios = list(
                    ValuationRatio.objects.filter(
                        stock=stock,
                        on__gte=start_date,
                        on__lte=end_date,
                        pe__gt=0,
                    ).order_by("on").values_list("on", "pe")
                )
                self._pe_data[sym] = dict(ratios)
            except Exception:
                self._pe_data[sym] = {}

    def should_enter(self, symbol, bars):
        """Buy if this stock has one of the lowest PEs on a rebalance day."""
        if not bars or len(bars) < 5:
            return False
        current_date = bars[-1]["on"]

        # Only trade on approximate quarterly boundaries
        day_of_year = current_date.timetuple().tm_yday
        is_rebalance = day_of_year % self.rebalance_days < 3

        if not is_rebalance:
            return False

        # Get PE for this stock on this date (use closest available)
        pe_data = self._pe_data.get(symbol, {})
        current_pe = None
        for d in sorted(pe_data.keys(), reverse=True):
            if d <= current_date:
                current_pe = pe_data[d]
                break

        if current_pe is None or current_pe <= 0:
            return False

        # Check if this is in the bottom 5 PEs across all symbols
        all_pes = []
        for sym, pd in self._pe_data.items():
            for d in sorted(pd.keys(), reverse=True):
                if d <= current_date:
                    all_pes.append((sym, pd[d]))
                    break

        all_pes.sort(key=lambda x: x[1])
        lowest_symbols = [s for s, _ in all_pes[:self.max_positions]]
        return symbol in lowest_symbols

    def should_exit(self, symbol, bars, position):
        """Sell at next quarterly rebalance if no longer in bottom 5."""
        current_date = bars[-1]["on"]
        entry_date = position["entry_date"]
        days_held = (current_date - entry_date).days

        # Hold until next rebalance
        if days_held < self.rebalance_days - 5:
            return False

        # At rebalance: check if still in bottom 5
        pe_data = self._pe_data.get(symbol, {})
        current_pe = None
        for d in sorted(pe_data.keys(), reverse=True):
            if d <= current_date:
                current_pe = pe_data[d]
                break

        if current_pe is None:
            return True  # No PE data → exit

        all_pes = []
        for sym, pd in self._pe_data.items():
            for d in sorted(pd.keys(), reverse=True):
                if d <= current_date:
                    all_pes.append((sym, pd[d]))
                    break

        all_pes.sort(key=lambda x: x[1])
        lowest_symbols = [s for s, _ in all_pes[:self.max_positions]]
        return symbol not in lowest_symbols

    def position_size(self, cash, num_positions):
        if num_positions >= self.max_positions:
            return 0
        return cash / (self.max_positions - num_positions)

    @classmethod
    def params_schema(cls):
        return [
            {"key": "rebalance_days", "label": "Rebalance Every N Days", "default": 63, "min": 21, "max": 126, "type": "int"},
            {"key": "max_positions", "label": "Max Positions (Lowest PE)", "default": 5, "min": 3, "max": 10, "type": "int"},
        ]


# Registry of all strategies
STRATEGY_REGISTRY = {
    "darwin_rsi": DarwinRSIStrategy,
    "box_trading": BoxTradingStrategy,
    "earnings_beat": EarningsBeatStrategy,
    "buy_and_hold": BuyAndHoldStrategy,
    "mean_reversion": MeanReversionStrategy,
    "insider_cluster": InsiderClusterBuyStrategy,
    "momentum_trailing": MomentumTrailingStopStrategy,
    "golden_cross": GoldenCrossStrategy,
    "post_earnings_drift": PostEarningsDriftStrategy,
    "volatility_breakout": VolatilityBreakoutStrategy,
    "low_pe_value": LowPEValueStrategy,
}
