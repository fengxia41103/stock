#!/usr/bin/env python3
"""
Batch analysis — rank all stocks by Darwin + Graham + Box signals.

Usage:
    docker compose exec web python manage.py shell < scripts/analyze_all.py
    # or
    make analyze-all
"""

from stock.models import MyStock


def run():
    stocks = MyStock.objects.all().order_by("symbol")
    results = []

    for s in stocks:
        price = s.latest_close_price
        if not price:
            continue

        # ROCE
        cs = s.cross_statements_model
        roce_vals = [item["roce"] for item in cs if item["roce"] > 0]
        avg_roce = sum(roce_vals) / len(roce_vals) if roce_vals else 0

        # RSI
        prices = list(s.historicals.order_by("-on")[:15].values_list("close_price", flat=True))
        prices.reverse()
        rsi = None
        if len(prices) >= 14:
            gains, losses = [], []
            for i in range(1, 15):
                change = prices[-i] - prices[-(i+1)]
                (gains if change > 0 else losses).append(abs(change))
            avg_gain = sum(gains) / 14
            avg_loss = sum(losses) / 14 if losses else 0.001
            rsi = 100 - (100 / (1 + avg_gain / avg_loss))

        results.append({
            "symbol": s.symbol,
            "price": price,
            "pe": s.pe,
            "graham_score": s.graham_score,
            "roce": avg_roce,
            "rsi": rsi,
            "margin_of_safety": s.graham_margin_of_safety,
            "pe_pb": s.pe_pb_product,
            "insider": s.insider_sentiment_3m,
        })

    # --- Print ranked tables ---

    print(f"\n{'='*80}")
    print("  STOCK UNIVERSE ANALYSIS")
    print(f"{'='*80}\n")

    # Darwin ranking (by ROCE)
    print("── TOP BY ROCE (Darwin Quality) ──")
    by_roce = sorted(results, key=lambda x: x["roce"], reverse=True)
    print(f"  {'Symbol':<8} {'ROCE':>6} {'PE':>7} {'Graham':>6} {'RSI':>5}")
    print(f"  {'─'*8} {'─'*6} {'─'*7} {'─'*6} {'─'*5}")
    for r in by_roce[:15]:
        rsi_str = f"{r['rsi']:.0f}" if r['rsi'] else "—"
        pe_str = f"{r['pe']:.0f}" if r['pe'] else "—"
        print(f"  {r['symbol']:<8} {r['roce']:>5.0f}% {pe_str:>7} {r['graham_score']:>4}/7 {rsi_str:>5}")
    print()

    # Graham ranking (by score then margin of safety)
    print("── TOP BY GRAHAM SCORE (Value) ──")
    by_graham = sorted(results, key=lambda x: (x["graham_score"], x["margin_of_safety"] or -999), reverse=True)
    print(f"  {'Symbol':<8} {'Score':>5} {'MoS%':>7} {'PE×PB':>8} {'PE':>7}")
    print(f"  {'─'*8} {'─'*5} {'─'*7} {'─'*8} {'─'*7}")
    for r in by_graham[:15]:
        mos = f"{r['margin_of_safety']:.0f}%" if r['margin_of_safety'] else "—"
        pepb = f"{r['pe_pb']:.0f}" if r['pe_pb'] else "—"
        pe_str = f"{r['pe']:.0f}" if r['pe'] else "—"
        print(f"  {r['symbol']:<8} {r['graham_score']:>3}/7 {mos:>7} {pepb:>8} {pe_str:>7}")
    print()

    # Box trading signals (oversold = buy opportunities)
    print("── BOX TRADING SIGNALS (RSI Sorted) ──")
    with_rsi = [r for r in results if r["rsi"] is not None]
    by_rsi = sorted(with_rsi, key=lambda x: x["rsi"])
    print(f"  {'Symbol':<8} {'RSI':>5} {'Signal':<12} {'Price':>8} {'ROCE':>6}")
    print(f"  {'─'*8} {'─'*5} {'─'*12} {'─'*8} {'─'*6}")
    for r in by_rsi[:10]:
        signal = "🔥 OVERSOLD" if r["rsi"] < 30 else "👀 LOW" if r["rsi"] < 40 else "neutral"
        print(f"  {r['symbol']:<8} {r['rsi']:>5.0f} {signal:<12} ${r['price']:>7.1f} {r['roce']:>5.0f}%")
    print()
    print("  --- OVERBOUGHT (avoid) ---")
    for r in by_rsi[-10:]:
        signal = "⚠️ OVERBOUGHT" if r["rsi"] > 70 else "HIGH" if r["rsi"] > 60 else ""
        if signal:
            print(f"  {r['symbol']:<8} {r['rsi']:>5.0f} {signal:<12} ${r['price']:>7.1f} {r['roce']:>5.0f}%")
    print()

    # Combined: Darwin pass + RSI low = best opportunities
    print("── BEST OPPORTUNITIES (Darwin ✓ + RSI < 40) ──")
    opps = [r for r in with_rsi if r["roce"] > 15 and r["rsi"] and r["rsi"] < 40]
    opps.sort(key=lambda x: x["rsi"])
    if opps:
        print(f"  {'Symbol':<8} {'RSI':>5} {'ROCE':>6} {'Graham':>6} {'Price':>8}")
        print(f"  {'─'*8} {'─'*5} {'─'*6} {'─'*6} {'─'*8}")
        for r in opps:
            print(f"  {r['symbol']:<8} {r['rsi']:>5.0f} {r['roce']:>5.0f}% {r['graham_score']:>4}/7 ${r['price']:>7.1f}")
    else:
        print("  No stocks currently meet both criteria (Darwin + oversold).")
    print()

    # Insider buying
    print("── INSIDER BUYING (positive sentiment) ──")
    buyers = [r for r in results if r["insider"] > 0]
    buyers.sort(key=lambda x: x["insider"], reverse=True)
    if buyers:
        for r in buyers[:10]:
            print(f"  {r['symbol']:<8} sentiment={r['insider']:+.2f}  ROCE={r['roce']:.0f}%")
    else:
        print("  No significant insider buying detected.")
    print()


run()
