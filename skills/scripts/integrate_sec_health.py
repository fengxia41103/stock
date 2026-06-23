#!/usr/bin/env python3
"""Integrate SEC health analysis into the stock app.

Run inside the Django environment to analyze all portfolio stocks
and store results as diary entries with health assessments.

Usage (from project root):
    docker compose exec web python manage.py shell < skills/scripts/integrate_sec_health.py

Or import the function:
    from skills.scripts.analyze_sec_health import compute_health
"""

import os
import sys

# Add the scripts directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from analyze_sec_health import compute_health


def run():
    """Analyze all stocks and print summary."""
    # This runs inside Django shell
    from stock.models import MyStock

    results = []
    for stock in MyStock.objects.order_by("symbol"):
        print(f"Analyzing {stock.symbol}...", end=" ", flush=True)
        result = compute_health(stock.symbol)
        results.append(result)

        if "error" in result:
            print(f"❌ {result['error']}")
        else:
            flags = result["health"].get("flags", [])
            z = result["health"].get("altman_z", "N/A")
            roce = result["ratios"].get("roce", "N/A")
            print(f"Z={z} ROCE={roce}% {'⚠️ ' + ','.join(flags) if flags else '✅'}")

    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")

    healthy = [r for r in results if r.get("health", {}).get("healthy")]
    flagged = [r for r in results if r.get("health", {}).get("flags")]

    print(f"\n✅ Healthy ({len(healthy)}):")
    for r in healthy:
        print(f"   {r['ticker']}")

    print(f"\n⚠️  Flagged ({len(flagged)}):")
    for r in flagged:
        flags = r["health"]["flags"]
        print(f"   {r['ticker']:6s} — {', '.join(flags)}")


if __name__ == "__main__":
    run()
