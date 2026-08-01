# Backtesting Engine Plan

## Goal

Add a backtesting capability that lets you test trading strategies against historical data (393,712 records across 49 stocks, dating back to 1962 for some). Answer: "If I followed this strategy over the past N years, what would my returns be?"

---

## Strategies to Backtest

Based on your active frameworks:

### Strategy 1: Darwin + RSI Oversold ✅ (Implemented)

```
Rules:
  BUY when: Stock is Darwin-approved AND RSI(14) < 30
  SELL when: RSI(14) > 70 OR +20% gain (whichever first)
  Position size: Equal weight
  Hold max: 60 trading days (time stop)
```

### Strategy 2: Box Trading (Support/Resistance) ✅ (Implemented)

```
Rules:
  BUY when: Price touches 20-day low AND volume > 1.5x average
  SELL when: Price touches 20-day high OR -3% stop loss
  Hold max: 10 trading days
```

### Strategy 3: Earnings Beat + Hold ✅ (Implemented)

```
Rules:
  BUY when: Stock beats earnings estimate (surprise > 0%)
  SELL when: 30 days after buy OR next earnings date (whichever first)
  Position size: Equal weight
```

### Strategy 4: Insider Cluster Buy

```
Rules:
  BUY when: 3+ insider purchases within 14 days
  SELL when: 90 days after buy OR +15% gain
  Stop loss: -10%
```

### Strategy 5: Mean Reversion (SMA Deviation)

```
Rules:
  BUY when: Price < SMA(50) by 10% or more (oversold relative to trend)
  SELL when: Price crosses back above SMA(50) OR +15% gain
  Stop loss: -15% (wide, since already buying weakness)
  Hold max: 90 trading days
```

### Strategy 6: Momentum + Trailing Stop

```
Rules:
  BUY when: Stock hits new 52-week high
  SELL when: Trailing stop at -15% from peak OR 252 days (1 year)
  Position size: Equal weight across top 5 momentum stocks
  Rebalance: Monthly
```

### Strategy 7: Buy & Hold Darwin (Baseline Comparison)

```
Rules:
  BUY: All Darwin-approved stocks equal-weight on Day 1
  SELL: Never (hold entire period)
  Rebalance: None
  Purpose: BENCHMARK — does RSI timing beat lazy holding?
```

### Strategy 8: Golden Cross / Death Cross

```
Rules:
  BUY when: SMA(50) crosses ABOVE SMA(200) ("golden cross")
  SELL when: SMA(50) crosses BELOW SMA(200) ("death cross")
  Position size: Equal weight
  Hold: Until death cross signal
```

### Strategy 9: Sector Rotation

```
Rules:
  BUY: Each month, buy top 3 stocks with lowest 30-day return (oversold rotation)
  SELL: Each month, sell any position with highest 30-day return (overbought rotation)
  Position size: Equal weight (33% each)
  Rebalance: Monthly
```

### Strategy 10: Low PE Value (Graham-style)

```
Rules:
  BUY: Quarterly, buy 5 stocks with lowest PE (>0) in universe
  SELL: Quarterly rebalance — sell any no longer in bottom 5
  Position size: Equal weight (20% each)
  Hold: Until next quarterly rebalance
```

### Strategy 11: Post-Earnings Drift

```
Rules:
  BUY when: Stock beats earnings by >5% surprise AND gaps up >3% next day
  SELL when: 60 days after buy (captures drift)
  Stop loss: -8%
  Rationale: Earnings surprises predict continued momentum for weeks
```

### Strategy 12: Volatility Breakout

```
Rules:
  BUY when: Daily range (high-low) > 2x 20-day average range AND close in top 25% of range
  SELL when: +10% gain OR -5% stop OR 5 trading days (quick trade)
  Position size: Smaller (2% risk per trade)
```

### Strategy 13: Dividend Aristocrat Hold

```
Rules:
  BUY: All stocks with 20+ consecutive years of dividend growth
  SELL: Never (unless dividend is cut)
  Reinvest: All dividends
  Purpose: Does "boring quality" beat active strategies long-term?
```

### Strategy 14: Custom (User-defined)

```
Rules: User specifies entry/exit conditions via UI
  Entry: RSI < X, Price < SMA(Y), Volume > Z × avg
  Exit: RSI > X, +N% gain, -M% stop, T days max hold
```

---

## The Key Question to Answer

**Strategy 7 (Buy & Hold Darwin) vs Strategy 1 (Darwin + RSI timing)**

This is THE most important backtest. It answers: "Does my RSI timing add alpha, or am I just churning a portfolio that would do better left alone?"

```
If Buy & Hold > RSI Timing → simplify, be lazier, stop trading
If RSI Timing > Buy & Hold → the framework has genuine edge, keep using it
```

---

## Implementation Priority

| Priority | Strategy | Status | Effort |
|----------|----------|--------|--------|
| ✅ Done | 1. Darwin + RSI | Implemented | — |
| ✅ Done | 2. Box Trading | Implemented | — |
| ✅ Done | 3. Earnings Beat | Implemented | — |
| HIGH | 7. Buy & Hold Darwin (benchmark) | Needed | Small (30 lines) |
| HIGH | 5. Mean Reversion (SMA) | Needed | Medium (50 lines) |
| HIGH | 4. Insider Cluster Buy | Needed | Medium (60 lines) |
| MEDIUM | 6. Momentum + Trailing Stop | Needed | Medium (60 lines) |
| MEDIUM | 8. Golden Cross | Needed | Small (40 lines) |
| MEDIUM | 9. Sector Rotation | Needed | Medium (70 lines) |
| LOW | 10. Low PE Value | Needed | Medium (50 lines) |
| LOW | 11. Post-Earnings Drift | Needed | Small (40 lines) |
| LOW | 12. Volatility Breakout | Needed | Small (40 lines) |
| LOW | 13. Dividend Aristocrat | Needed | Small (30 lines) |
| LOW | 14. Custom | Needed | Large (100 lines + UI) |

---

## Architecture

### Backend: Backtest Engine

```
backend/stock/backtesting/
├── __init__.py
├── engine.py          ← Core backtest loop
├── strategies.py      ← Strategy definitions (entry/exit rules)
├── indicators.py      ← RSI, SMA, Bollinger, etc. computed on historical
├── portfolio.py       ← Position tracking, P&L, cash management
└── report.py          ← Generate stats (Sharpe, max drawdown, win rate)
```

#### engine.py — Core Loop

```python
class BacktestEngine:
    """Event-driven backtesting engine using DB historical data."""

    def __init__(self, strategy, symbols, start_date, end_date, initial_cash=100_000):
        self.strategy = strategy
        self.symbols = symbols
        self.start_date = start_date
        self.end_date = end_date
        self.portfolio = Portfolio(initial_cash)
        self.trades = []

    def run(self):
        """Main backtest loop — iterate day by day."""
        from stock.models import MyStockHistorical

        # Prefetch all data (one query per stock, much faster than day-by-day)
        price_data = {}
        for sym in self.symbols:
            records = list(
                MyStockHistorical.objects.filter(
                    stock__symbol=sym,
                    on__gte=self.start_date,
                    on__lte=self.end_date,
                ).order_by("on").values("on", "open_price", "high_price", "low_price", "close_price", "vol")
            )
            price_data[sym] = records

        # Get all unique dates
        all_dates = sorted(set(
            r["on"] for records in price_data.values() for r in records
        ))

        # Day-by-day simulation
        for i, date in enumerate(all_dates):
            for sym in self.symbols:
                bars = [r for r in price_data[sym] if r["on"] <= date]
                if len(bars) < 20:  # Need minimum history for indicators
                    continue

                current_bar = next((r for r in price_data[sym] if r["on"] == date), None)
                if not current_bar:
                    continue

                # Check exit signals for open positions
                if self.portfolio.has_position(sym):
                    if self.strategy.should_exit(sym, bars, self.portfolio.get_position(sym)):
                        self._close_position(sym, current_bar, date)

                # Check entry signals
                elif self.portfolio.cash > 0:
                    if self.strategy.should_enter(sym, bars):
                        self._open_position(sym, current_bar, date)

        # Close any remaining positions at end
        self._close_all(all_dates[-1], price_data)

        return self._generate_report(all_dates, price_data)

    def _open_position(self, sym, bar, date):
        size = self.strategy.position_size(self.portfolio.cash, self.portfolio.total_positions)
        shares = int(size / bar["close_price"])
        if shares > 0:
            self.portfolio.buy(sym, shares, bar["close_price"], date)
            self.trades.append({"sym": sym, "action": "BUY", "date": date,
                              "price": bar["close_price"], "shares": shares})

    def _close_position(self, sym, bar, date):
        position = self.portfolio.get_position(sym)
        self.portfolio.sell(sym, bar["close_price"], date)
        self.trades.append({"sym": sym, "action": "SELL", "date": date,
                          "price": bar["close_price"], "shares": position["shares"],
                          "pnl": (bar["close_price"] - position["entry_price"]) * position["shares"]})
```

#### indicators.py — Technical Indicators

```python
import numpy as np

def rsi(closes, period=14):
    """Compute RSI from list of close prices."""
    deltas = np.diff(closes)
    gain = np.where(deltas > 0, deltas, 0)
    loss = np.where(deltas < 0, -deltas, 0)
    avg_gain = np.convolve(gain, np.ones(period)/period, mode='valid')
    avg_loss = np.convolve(loss, np.ones(period)/period, mode='valid')
    rs = avg_gain / (avg_loss + 1e-10)
    return 100 - (100 / (1 + rs[-1]))

def sma(closes, period):
    """Simple moving average."""
    return np.mean(closes[-period:])

def bollinger_bands(closes, period=20, std_dev=2):
    """Bollinger Bands."""
    mid = sma(closes, period)
    std = np.std(closes[-period:])
    return mid - std_dev * std, mid, mid + std_dev * std

def average_volume(volumes, period=20):
    return np.mean(volumes[-period:])
```

#### strategies.py — Strategy Definitions

```python
from stock.backtesting.indicators import rsi, sma, average_volume

class DarwinRSIStrategy:
    """Buy Darwin stocks when RSI < 30, sell when RSI > 70 or +20%."""

    name = "Darwin + RSI Oversold"

    def __init__(self, rsi_buy=30, rsi_sell=70, profit_target=0.20, max_hold_days=60):
        self.rsi_buy = rsi_buy
        self.rsi_sell = rsi_sell
        self.profit_target = profit_target
        self.max_hold_days = max_hold_days

    def should_enter(self, sym, bars):
        closes = [b["close_price"] for b in bars]
        if len(closes) < 15:
            return False
        current_rsi = rsi(closes)
        return current_rsi < self.rsi_buy

    def should_exit(self, sym, bars, position):
        closes = [b["close_price"] for b in bars]
        current_rsi = rsi(closes)
        current_price = closes[-1]

        # RSI overbought
        if current_rsi > self.rsi_sell:
            return True
        # Profit target
        if current_price >= position["entry_price"] * (1 + self.profit_target):
            return True
        # Time stop
        days_held = (bars[-1]["on"] - position["entry_date"]).days
        if days_held >= self.max_hold_days:
            return True
        # Stop loss (-10%)
        if current_price <= position["entry_price"] * 0.90:
            return True
        return False

    def position_size(self, cash, num_positions):
        max_positions = 5
        if num_positions >= max_positions:
            return 0
        return cash / (max_positions - num_positions)


class BoxTradingStrategy:
    """Buy at 20-day low with volume confirmation, sell at 20-day high or stop."""
    name = "Box Trading"
    # ... similar pattern


class EarningsBeatStrategy:
    """Buy on earnings beat, hold 30 days."""
    name = "Earnings Beat + Hold"
    # ... uses EarningsEvent model data
```

#### portfolio.py — Position Tracking

```python
class Portfolio:
    def __init__(self, initial_cash):
        self.initial_cash = initial_cash
        self.cash = initial_cash
        self.positions = {}  # {sym: {shares, entry_price, entry_date}}
        self.history = []    # Daily portfolio value snapshots

    def buy(self, sym, shares, price, date):
        cost = shares * price
        self.cash -= cost
        self.positions[sym] = {"shares": shares, "entry_price": price, "entry_date": date}

    def sell(self, sym, price, date):
        pos = self.positions.pop(sym)
        proceeds = pos["shares"] * price
        self.cash += proceeds
        return proceeds - (pos["shares"] * pos["entry_price"])

    @property
    def total_value(self):
        # Need current prices — computed during backtest loop
        return self.cash + sum(p["shares"] * p["current_price"] for p in self.positions.values())

    @property
    def total_positions(self):
        return len(self.positions)
```

#### report.py — Performance Stats

```python
class BacktestReport:
    def __init__(self, trades, portfolio_values, benchmark_values):
        self.trades = trades
        self.portfolio_values = portfolio_values
        self.benchmark_values = benchmark_values

    def compute(self):
        return {
            "total_return_pct": self._total_return(),
            "annualized_return_pct": self._annualized_return(),
            "benchmark_return_pct": self._benchmark_return(),
            "alpha": self._annualized_return() - self._benchmark_return(),
            "sharpe_ratio": self._sharpe(),
            "max_drawdown_pct": self._max_drawdown(),
            "win_rate_pct": self._win_rate(),
            "total_trades": len(self.trades),
            "avg_hold_days": self._avg_hold_days(),
            "profit_factor": self._profit_factor(),
            "best_trade": self._best_trade(),
            "worst_trade": self._worst_trade(),
            "trades": self.trades,
            "equity_curve": self.portfolio_values,
        }
```

---

### API Endpoint

```python
# GET /api/v1/backtest/
# POST /api/v1/backtest/run/

class BacktestViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"])
    def run(self, request):
        """Run a backtest with specified parameters."""
        params = request.data
        strategy_name = params.get("strategy", "darwin_rsi")
        symbols = params.get("symbols", [])  # or "all" for all user stocks
        start_date = params.get("start_date", "2020-01-01")
        end_date = params.get("end_date", "2026-07-30")
        initial_cash = params.get("initial_cash", 100000)

        # Map strategy name to class
        strategies = {
            "darwin_rsi": DarwinRSIStrategy,
            "box_trading": BoxTradingStrategy,
            "earnings_beat": EarningsBeatStrategy,
        }

        strategy_class = strategies[strategy_name]
        strategy = strategy_class(**params.get("strategy_params", {}))

        if symbols == "all" or not symbols:
            symbols = list(MyStock.objects.filter(
                sectors__user=request.user
            ).distinct().values_list("symbol", flat=True))

        engine = BacktestEngine(strategy, symbols, start_date, end_date, initial_cash)
        result = engine.run()

        return Response(result)

    @action(detail=False, methods=["get"])
    def strategies(self, request):
        """List available strategies with their parameters."""
        return Response([
            {
                "id": "darwin_rsi",
                "name": "Darwin + RSI Oversold",
                "description": "Buy Darwin-quality stocks when RSI < 30, sell at RSI > 70 or +20%",
                "params": [
                    {"key": "rsi_buy", "label": "RSI Buy Threshold", "default": 30, "min": 10, "max": 50},
                    {"key": "rsi_sell", "label": "RSI Sell Threshold", "default": 70, "min": 50, "max": 90},
                    {"key": "profit_target", "label": "Profit Target %", "default": 20, "min": 5, "max": 50},
                    {"key": "max_hold_days", "label": "Max Hold Days", "default": 60, "min": 5, "max": 252},
                ]
            },
            {
                "id": "box_trading",
                "name": "Box Trading (20-day range)",
                "description": "Buy at 20-day low with volume, sell at 20-day high or -3% stop",
                "params": [
                    {"key": "lookback", "label": "Lookback Period", "default": 20},
                    {"key": "volume_multiplier", "label": "Volume Confirm (x avg)", "default": 1.5},
                    {"key": "stop_loss", "label": "Stop Loss %", "default": 3},
                ]
            },
            {
                "id": "earnings_beat",
                "name": "Earnings Beat + Hold",
                "description": "Buy after earnings beat, hold 30 days",
                "params": [
                    {"key": "hold_days", "label": "Hold Days After Beat", "default": 30},
                    {"key": "min_surprise_pct", "label": "Min Surprise %", "default": 0},
                ]
            },
        ])
```

---

### Frontend: Backtest View

```
Route: /backtest
Nav: Add "Backtest" icon to sidebar

┌─────────────────────────────────────────────────────────────────┐
│ 📊 Strategy Backtester                                          │
├─────────────────────┬───────────────────────────────────────────┤
│ SETUP               │  RESULTS                                  │
│                     │                                           │
│ Strategy: [▼]       │  Equity Curve (ECharts line chart)        │
│  ○ Darwin + RSI     │  ┌──────────────────────────────┐        │
│  ○ Box Trading      │  │  Portfolio ── Benchmark      │        │
│  ○ Earnings Beat    │  │    /\    /\                   │        │
│  ○ Custom           │  │   /  \  /  \  ___            │        │
│                     │  │  /    \/    \/                │        │
│ Stocks: [All ▼]     │  └──────────────────────────────┘        │
│ Start: [2020-01-01] │                                           │
│ End:   [2026-07-30] │  Stats:                                   │
│ Cash:  [$100,000]   │  Return: +142% vs SPY +87% (α +55%)     │
│                     │  Sharpe: 1.8 | MaxDD: -18%               │
│ Parameters:         │  Win Rate: 72% | Trades: 84              │
│ RSI Buy: [30]       │  Avg Hold: 23 days                       │
│ RSI Sell: [70]      │  Best: FICO +34% | Worst: CME -8%       │
│ Profit %: [20]      │                                           │
│ Max Days: [60]      │  Trade Log:                               │
│                     │  ┌──────────────────────────────┐        │
│ [▶ Run Backtest]    │  │ Date  Sym  Action Price P&L  │        │
│                     │  │ 03/15 MSFT BUY   $349        │        │
│                     │  │ 04/02 MSFT SELL  $401  +14%  │        │
│                     │  │ ...                          │        │
│                     │  └──────────────────────────────┘        │
└─────────────────────┴───────────────────────────────────────────┘
```

---

## Implementation Steps

| Step | Scope | Effort |
|------|-------|--------|
| 1 | `backend/stock/backtesting/indicators.py` — RSI, SMA, Bollinger, volume | Small (50 lines) |
| 2 | `backend/stock/backtesting/portfolio.py` — Position/cash tracking | Small (60 lines) |
| 3 | `backend/stock/backtesting/strategies.py` — 3 built-in strategies | Medium (150 lines) |
| 4 | `backend/stock/backtesting/engine.py` — Main loop | Medium (120 lines) |
| 5 | `backend/stock/backtesting/report.py` — Stats computation | Medium (100 lines) |
| 6 | `backend/stock/api/views.py` — BacktestViewSet | Small (40 lines) |
| 7 | `frontend/src/views/backtest/BacktestView/` — UI with params + results | Large (200 lines) |
| 8 | ECharts equity curve chart component | Medium (80 lines) |
| 9 | Trade log table | Small (50 lines) |

**Total: ~850 lines | Estimated: 2-3 sessions**

---

## Data Advantage

You already have **393,712 daily records** going back to 1962 for some stocks. This is more than enough for statistically significant backtests. No external data needed.

Key backtests to run first:
1. **"Did our Jun 22 framework actually work historically?"** — RSI <30 on Darwin stocks, 2020-2026
2. **"What's the optimal RSI threshold?"** — Test RSI 20/25/30/35 entries
3. **"Earnings beat hold period"** — Is 30 days optimal or is 5/10/60 better?

---

## Dependencies

- `numpy` — already in requirements.txt
- No new packages needed
- All data already in DB

---

## Priority

**MEDIUM-HIGH** — This directly validates (or invalidates) the trading framework you're actively using with real money. The Jun 22 → Jul 30 period showed 88%+ accuracy, but backtesting over 5+ years would either confirm it's a real edge or reveal survivorship bias.

---

*Plan created July 30, 2026.*
