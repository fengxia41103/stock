"""Portfolio position and cash management for backtesting."""


class Portfolio:
    """Tracks positions, cash, and daily portfolio value."""

    def __init__(self, initial_cash):
        self.initial_cash = initial_cash
        self.cash = initial_cash
        self.positions = {}  # {symbol: {shares, entry_price, entry_date}}
        self.value_history = []  # [(date, total_value)]

    def buy(self, symbol, shares, price, date):
        """Open or add to a position."""
        cost = shares * price
        if cost > self.cash:
            # Buy what we can afford
            shares = int(self.cash / price)
            cost = shares * price
        if shares <= 0:
            return False
        self.cash -= cost
        self.positions[symbol] = {
            "shares": shares,
            "entry_price": price,
            "entry_date": date,
        }
        return True

    def sell(self, symbol, price, date):
        """Close a position entirely. Returns realized P&L."""
        if symbol not in self.positions:
            return 0.0
        pos = self.positions.pop(symbol)
        proceeds = pos["shares"] * price
        self.cash += proceeds
        pnl = (price - pos["entry_price"]) * pos["shares"]
        return pnl

    def has_position(self, symbol):
        return symbol in self.positions

    def get_position(self, symbol):
        return self.positions.get(symbol)

    @property
    def total_positions(self):
        return len(self.positions)

    def total_value(self, current_prices):
        """Compute total portfolio value given current prices dict {sym: price}."""
        positions_value = sum(
            pos["shares"] * current_prices.get(sym, pos["entry_price"])
            for sym, pos in self.positions.items()
        )
        return self.cash + positions_value

    def snapshot(self, date, current_prices):
        """Record daily portfolio value."""
        value = self.total_value(current_prices)
        self.value_history.append({"date": str(date), "value": round(value, 2)})
        return value
