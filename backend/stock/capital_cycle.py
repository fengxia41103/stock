"""Capital Cycle computation logic.

Phase D of the deep-dive research framework — Step 9 (Supply Side & Capital Cycle).

For a stock's peer group:
- Aggregate capex/revenue ratios over time
- Compute aggregate ROIC
- Determine cycle phase based on capex trend and ROIC vs historical average
"""

from datetime import date, timedelta

from django.db.models import Q

from stock.models.stock import MyStock
from stock.models.cashflow import CashFlow
from stock.models.income import IncomeStatement


def compute_capital_cycle(stock, user):
    """Compute capital cycle analysis for a stock's industry.

    Args:
        stock: MyStock instance
        user: User instance (to look up peer groups)

    Returns:
        dict with industry_capex_trend, aggregate_roic, cycle_phase, signal
    """
    from stock.models.peer_group import PeerGroup

    # Get peer symbols
    peer_entries = PeerGroup.objects.filter(
        stock=stock, user=user, relationship="competitor"
    ).values_list("peer_symbol", flat=True)

    peer_symbols = list(peer_entries)
    all_symbols = [stock.symbol] + peer_symbols

    # Find which peers are tracked in our DB (always include the stock itself)
    tracked_peers = MyStock.objects.filter(symbol__in=all_symbols)
    tracked_symbols = set(tracked_peers.values_list("symbol", flat=True))

    # Ensure the stock itself is always included
    if stock.symbol not in tracked_symbols:
        tracked_peers = MyStock.objects.filter(pk=stock.pk)
        tracked_symbols = {stock.symbol}
        all_symbols = [stock.symbol]

    if not tracked_peers.exists():
        return {
            "error": "No tracked peers found. Add the stock to a sector first.",
            "all_symbols": all_symbols,
            "tracked_symbols": list(tracked_symbols),
        }

    # Compute capex/revenue ratio per period for each tracked peer
    # Use last 10 years of data (40 quarters)
    cutoff = date.today() - timedelta(days=365 * 10)

    capex_trend_data = []  # [{on, capex_to_revenue, aggregate_roic}, ...]
    period_data = {}  # {date: {total_capex, total_revenue, roics}}

    for peer_stock in tracked_peers:
        # Get income statements (for revenue)
        incomes = IncomeStatement.objects.filter(
            stock=peer_stock, on__gte=cutoff
        ).order_by("on")

        for inc in incomes:
            if not inc.total_revenue or inc.total_revenue <= 0:
                continue

            # Get matching cash flow for capex (same period or closest prior)
            cf = CashFlow.objects.filter(
                stock=peer_stock, on=inc.on
            ).first()
            if not cf:
                cf = CashFlow.objects.filter(
                    stock=peer_stock, on__lte=inc.on
                ).order_by("-on").first()

            capex = abs(cf.capex) if cf and cf.capex else 0

            # Get ROIC from cross_statements logic
            from stock.models.balance import BalanceSheet
            balance = BalanceSheet.objects.filter(
                stock=peer_stock, on__lte=inc.on
            ).order_by("-on").first()

            invested_capital = 0
            if balance:
                invested_capital = (
                    balance.invested_capital
                    if balance.invested_capital
                    else (balance.working_capital or 0) - (balance.cash_and_cash_equivalent or 0)
                )
            invested_capital = max(invested_capital, 0)

            roic = 0
            if invested_capital > 0 and inc.ebit and inc.tax_rate:
                nopat = inc.ebit * (1 - inc.tax_rate)
                roic = nopat / invested_capital * 100

            # Aggregate by period (quarter)
            period_key = inc.on.isoformat()
            if period_key not in period_data:
                period_data[period_key] = {
                    "on": inc.on,
                    "total_capex": 0,
                    "total_revenue": 0,
                    "roics": [],
                    "count": 0,
                }

            period_data[period_key]["total_capex"] += capex
            period_data[period_key]["total_revenue"] += inc.total_revenue
            if roic > 0:
                period_data[period_key]["roics"].append(roic)
            period_data[period_key]["count"] += 1

    # Convert to time series sorted by date
    sorted_periods = sorted(period_data.values(), key=lambda x: x["on"])

    capex_trend = []
    for p in sorted_periods:
        capex_ratio = (
            (p["total_capex"] / p["total_revenue"] * 100)
            if p["total_revenue"] > 0
            else 0
        )
        avg_roic = (
            sum(p["roics"]) / len(p["roics"]) if p["roics"] else 0
        )
        capex_trend.append({
            "on": p["on"].isoformat(),
            "capex_to_revenue_pct": round(capex_ratio, 2),
            "aggregate_roic_pct": round(avg_roic, 2),
            "peer_count": p["count"],
        })

    if len(capex_trend) < 4:
        return {
            "error": f"Insufficient data — need at least 4 periods with revenue data. Found {len(capex_trend)} for [{', '.join(tracked_symbols)}].",
            "all_symbols": all_symbols,
            "tracked_symbols": list(tracked_symbols),
            "periods_found": len(capex_trend),
            "hint": "Ensure this stock has Income Statements and Cash Flow data loaded. Try updating the stock first.",
        }

    # Determine trend direction (last 4 periods)
    recent = capex_trend[-4:]
    capex_values = [p["capex_to_revenue_pct"] for p in recent]
    roic_values = [p["aggregate_roic_pct"] for p in recent if p["aggregate_roic_pct"] > 0]

    # Capex trend: rising or falling?
    capex_slope = capex_values[-1] - capex_values[0]
    capex_rising = capex_slope > 0.5  # >0.5pp increase = rising
    capex_falling = capex_slope < -0.5

    # ROIC vs historical average
    all_roics = [p["aggregate_roic_pct"] for p in capex_trend if p["aggregate_roic_pct"] > 0]
    historical_avg_roic = sum(all_roics) / len(all_roics) if all_roics else 0
    current_roic = roic_values[-1] if roic_values else 0
    roic_above_avg = current_roic > historical_avg_roic

    # Determine phase
    # Peak: high ROIC + high/rising capex (everyone investing at peak returns)
    # Falling: ROIC declining + capex still high or starting to fall
    # Trough: low ROIC + low/falling capex (nobody investing)
    # Rising: ROIC improving + capex low but starting to rise
    if roic_above_avg and capex_rising:
        phase = "peak"
        signal = (
            f"Aggregate capex rising ({capex_values[-1]:.1f}% of revenue) while ROIC "
            f"({current_roic:.1f}%) is above average ({historical_avg_roic:.1f}%). "
            f"Peak cycle — high returns attract capital, future supply glut risk. "
            f"Consider reducing exposure."
        )
    elif not roic_above_avg and capex_rising:
        phase = "rising"
        signal = (
            f"Capex rising ({capex_values[-1]:.1f}% of revenue) but ROIC ({current_roic:.1f}%) "
            f"still below average ({historical_avg_roic:.1f}%). "
            f"Early recovery — demand outpacing supply. Watch for acceleration."
        )
    elif roic_above_avg and capex_falling:
        phase = "falling"
        signal = (
            f"Capex falling ({capex_values[-1]:.1f}% of revenue) while ROIC ({current_roic:.1f}%) "
            f"still above average ({historical_avg_roic:.1f}%). "
            f"Late cycle — supply catching up. Margins likely to compress."
        )
    elif not roic_above_avg and capex_falling:
        phase = "trough"
        signal = (
            f"Capex falling ({capex_values[-1]:.1f}% of revenue) and ROIC ({current_roic:.1f}%) "
            f"below average ({historical_avg_roic:.1f}%). "
            f"Trough — nobody investing, supply shrinking. Contrarian BUY signal."
        )
    else:
        # Neutral / ambiguous
        phase = "rising" if current_roic > historical_avg_roic else "falling"
        signal = (
            f"Capex at {capex_values[-1]:.1f}% of revenue, ROIC at {current_roic:.1f}% "
            f"(avg: {historical_avg_roic:.1f}%). Mixed signals."
        )

    return {
        "stock_symbol": stock.symbol,
        "all_symbols": all_symbols,
        "tracked_symbols": list(tracked_symbols),
        "untracked_symbols": [s for s in all_symbols if s not in tracked_symbols],
        "capex_trend": capex_trend,
        "current_capex_pct": capex_values[-1] if capex_values else None,
        "current_roic_pct": current_roic,
        "historical_avg_roic_pct": round(historical_avg_roic, 2),
        "capex_trend_direction": "rising" if capex_rising else "falling" if capex_falling else "flat",
        "cycle_phase": phase,
        "signal": signal,
    }
