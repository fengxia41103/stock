#!/usr/bin/env python3
"""
Deep stock analysis script — Darwin + Graham + Box Trading.

Usage (inside Docker):
    docker compose exec web python manage.py shell < scripts/analyze_stock.py

Or with symbol argument:
    docker compose exec web python manage.py shell -c "
    import sys; sys.argv = ['', 'KLAC']
    exec(open('scripts/analyze_stock.py').read())
    "

Or interactively:
    docker compose exec web python manage.py shell
    >>> exec(open('scripts/analyze_stock.py').read())
    (will prompt for symbol)
"""

import sys
import math
from datetime import date, timedelta

from stock.models import MyStock


def analyze(symbol):
    try:
        s = MyStock.objects.get(symbol=symbol.upper())
    except MyStock.DoesNotExist:
        print(f"ERROR: {symbol} not found in database.")
        return

    print(f"\n{'='*70}")
    print(f"  {s.symbol} — {s.name}")
    print(f"{'='*70}\n")

    # --- Basic ---
    print("── BASIC METRICS ──")
    print(f"  Price:            ${s.latest_close_price:.2f}" if s.latest_close_price else "  Price: N/A")
    print(f"  PE:               {s.pe:.1f}" if s.pe else "  PE: N/A")
    print(f"  PB:               {s.pb:.1f}" if s.pb else "  PB: N/A")
    print(f"  PS:               {s.ps:.1f}" if s.ps else "  PS: N/A")
    print(f"  ROE:              {s.roe:.1f}%" if s.roe else "  ROE: N/A")
    print(f"  ROA:              {s.roa:.1f}%" if s.roa else "  ROA: N/A")
    print(f"  Profit Margin:    {s.profit_margin:.1f}%" if s.profit_margin else "  Profit Margin: N/A")
    print(f"  Beta:             {s.beta:.2f}" if s.beta else "  Beta: N/A")
    print(f"  Shares Out:       {s.shares_outstanding:.2f}B" if s.shares_outstanding else "  Shares: N/A")
    print(f"  Last Lower:       {s.last_lower} days")
    print(f"  Last Better:      {s.last_better} days")
    print()

    # --- Graham ---
    print("── GRAHAM VALUATION ──")
    print(f"  Graham Score:     {s.graham_score}/7")
    gn = s.graham_number
    print(f"  Graham Number:    ${gn:.2f}" if gn else "  Graham Number: N/A")
    giv = s.graham_intrinsic_value
    print(f"  Intrinsic Value:  ${giv:.2f}" if giv else "  Intrinsic Value: N/A")
    gmos = s.graham_margin_of_safety
    if gmos is not None:
        label = "UNDERVALUED" if gmos > 0 else "OVERVALUED"
        print(f"  Margin of Safety: {gmos:.1f}% ({label})")
    pepb = s.pe_pb_product
    if pepb:
        status = "✓ PASS" if pepb < 22.5 else "✗ FAIL"
        print(f"  PE × PB:          {pepb:.1f} (threshold: 22.5) {status}")
    nnr = s.net_net_ratio
    if nnr:
        print(f"  Net-Net Ratio:    {nnr:.2f} (< 0.67 = buy)")
    print()

    # --- Darwin ---
    print("── DARWIN / QUALITY ──")
    print(f"  Insider Sentiment (3m): {s.insider_sentiment_3m:.2f}")
    ebr = s.earnings_beat_rate
    print(f"  Earnings Beat Rate:     {ebr:.0f}%" if ebr else "  Earnings Beat Rate: N/A")
    print(f"  Institution Count:      {s.institution_count}")

    # ROCE from cross_statements
    cs = s.cross_statements_model
    roce_vals = [item["roce"] for item in cs if item["roce"] > 0]
    if roce_vals:
        print(f"  ROCE (latest):          {roce_vals[-1]:.1f}%")
        print(f"  ROCE (avg):             {sum(roce_vals)/len(roce_vals):.1f}%")
        print(f"  ROCE > 15% all periods: {'✓ YES' if all(r > 15 for r in roce_vals) else '✗ NO'}")
    print()

    # --- DuPont ---
    print("── DUPONT DECOMPOSITION (latest) ──")
    dm = s.dupont_model
    if dm:
        latest = [d for d in dm if d["roe"] != 0]
        if latest:
            d = latest[-1]
            print(f"  Date:             {d['on']}")
            print(f"  ROE:              {d['roe']:.1f}%")
            print(f"  Net Margin:       {d['net_profit_margin']:.1f}%")
            print(f"  Asset Turnover:   {d['asset_turnover']:.1f}%")
            print(f"  Equity Mult:      {d['equity_multiplier']:.2f}x")
    print()

    # --- Income Trend ---
    print("── INCOME TREND ──")
    incomes = s.incomes.filter(total_revenue__gt=0).order_by("on")
    for i in incomes:
        margin = i.net_income_to_revenue
        print(f"  {i.on}: Rev=${i.total_revenue:.2f}B  NI=${i.net_income:.2f}B  EPS={i.basic_eps}  Margin={margin:.1f}%")
    print()

    # --- Balance Sheet ---
    print("── BALANCE SHEET (latest) ──")
    b = s.balances.order_by("-on").first()
    if b:
        print(f"  Date:             {b.on}")
        print(f"  Total Assets:     ${b.total_assets:.2f}B")
        print(f"  Current Assets:   ${b.current_assets:.2f}B")
        print(f"  Total Debt:       ${b.total_debt:.2f}B")
        print(f"  Equity:           ${b.stockholders_equity:.2f}B")
        print(f"  Working Capital:  ${b.working_capital:.2f}B")
        print(f"  Cash:             ${b.cash_and_cash_equivalent:.2f}B")
        print(f"  Current Ratio:    {b.current_ratio:.2f}")
        print(f"  Debt/Equity:      {b.debt_to_equity_ratio:.2f}")
    print()

    # --- Cash Flow ---
    print("── CASH FLOW (last 4Q) ──")
    for c in s.cashes.order_by("-on")[:4]:
        print(f"  {c.on}: FCF=${c.free_cash_flow:.2f}B  OCF=${c.operating_cash_flow:.2f}B  Capex=${c.capex:.2f}B")
    print()

    # --- Earnings ---
    print("── EARNINGS HISTORY ──")
    for e in s.earnings_events.order_by("-report_date")[:6]:
        surprise = f"{e.surprise_pct:+.1f}%" if e.surprise_pct else "pending"
        actual = f"${e.reported_eps:.2f}" if e.reported_eps else "—"
        est = f"${e.estimated_eps:.2f}" if e.estimated_eps else "—"
        print(f"  {e.report_date}: Est={est}  Act={actual}  Surprise={surprise}")
    print()

    # --- Insider Trades ---
    print("── INSIDER TRADES (recent) ──")
    for t in s.insider_trades.order_by("-trade_date")[:8]:
        tx = {"S": "SELL", "P": "BUY", "A": "Award", "G": "Gift"}.get(t.transaction_type, t.transaction_type)
        val = f"${(t.total_value or 0)/1e6:.1f}M" if t.total_value else ""
        print(f"  {t.trade_date}: {t.insider_name[:30]:<30} {tx:<5} {t.shares:.0f} shares  {val}")
    print()

    # --- Technical / Box ---
    print("── TECHNICAL / BOX ANALYSIS ──")
    historicals = list(s.historicals.order_by("-on")[:60].values_list("on", "close_price", "vol"))
    historicals.reverse()
    prices = [h[1] for h in historicals]

    if len(prices) >= 14:
        hi, lo = max(prices), min(prices)
        cur = prices[-1]
        pct_pos = (cur - lo) / (hi - lo) * 100 if hi != lo else 50

        print(f"  60-Day High:      ${hi:.2f}")
        print(f"  60-Day Low:       ${lo:.2f}")
        print(f"  Current:          ${cur:.2f}")
        print(f"  Range:            {((hi-lo)/lo*100):.1f}%")
        print(f"  Position:         {pct_pos:.0f}% (0%=bottom, 100%=top)")

        # RSI(14)
        gains, losses = [], []
        for i in range(1, min(15, len(prices))):
            change = prices[-i] - prices[-(i+1)]
            if change > 0:
                gains.append(change)
            else:
                losses.append(abs(change))
        avg_gain = sum(gains) / 14
        avg_loss = sum(losses) / 14 if losses else 0.001
        rsi = 100 - (100 / (1 + avg_gain / avg_loss))
        rsi_label = "🔥 OVERSOLD" if rsi < 30 else "⚠️ OVERBOUGHT" if rsi > 70 else "neutral"
        print(f"  RSI(14):          {rsi:.1f} ({rsi_label})")

        # Returns
        if len(prices) >= 6:
            print(f"  5-day return:     {(prices[-1]/prices[-6]-1)*100:+.1f}%")
        if len(prices) >= 21:
            print(f"  20-day return:    {(prices[-1]/prices[-21]-1)*100:+.1f}%")

        # Box verdict
        print()
        if rsi > 70 or pct_pos > 90:
            print("  📊 BOX VERDICT: 🚫 AT TOP — Do NOT buy. Wait for pullback.")
        elif rsi < 30 or pct_pos < 10:
            print("  📊 BOX VERDICT: ✅ AT BOTTOM — Potential buy zone.")
        else:
            print("  📊 BOX VERDICT: ⏳ MID-RANGE — Wait for clearer signal.")
    print()

    # --- Valuation History ---
    print("── VALUATION HISTORY ──")
    for r in s.ratios.order_by("-on")[:6]:
        print(f"  {r.on}: PE={r.pe:.1f}  PB={r.pb:.1f}  PS={r.ps:.1f}")
    print()

    # --- Summary ---
    print("── SUMMARY ──")
    darwin_pass = "✅" if roce_vals and all(r > 15 for r in roce_vals) else "⚠️"
    graham_pass = "✅" if s.graham_score >= 5 else "❌" if s.graham_score <= 2 else "⚠️"
    box_pass = "✅" if len(prices) >= 14 and rsi < 35 else "❌" if len(prices) >= 14 and rsi > 65 else "⏳"

    print(f"  Darwin (quality):     {darwin_pass} ROCE={'avg ' + f'{sum(roce_vals)/len(roce_vals):.0f}%' if roce_vals else 'N/A'}")
    print(f"  Graham (value):       {graham_pass} Score {s.graham_score}/7")
    print(f"  Box (timing):         {box_pass} RSI={rsi:.0f}" if len(prices) >= 14 else "  Box: insufficient data")
    print()


# --- Entry point ---
if __name__ == "__main__" or True:
    if len(sys.argv) > 1 and sys.argv[1].isalpha():
        symbol = sys.argv[1]
    else:
        symbol = input("Enter stock symbol: ").strip() if sys.stdin.isatty() else "KLAC"
    analyze(symbol)
