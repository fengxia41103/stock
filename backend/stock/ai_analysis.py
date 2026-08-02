"""AI-assisted stock analysis using LLM (Claude API or local Ollama)."""

import json
import os

import requests

from stock.report_service import generate_report


def generate_ai_analysis(stock, user=None):
    """Generate a Darwin Kill List analysis using LLM.
    
    Gathers all data from existing report_service, sends structured prompt,
    returns markdown analysis suitable for saving as diary note.
    """
    report = generate_report(stock)

    # Build structured prompt
    prompt = _build_prompt(stock.symbol, report)

    # Try Claude API first, fall back to Ollama
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if api_key:
        return _call_claude(prompt, api_key)

    ollama_url = os.environ.get("OLLAMA_URL", "http://localhost:11434")
    try:
        return _call_ollama(prompt, ollama_url)
    except Exception:
        pass

    # If no LLM available, return the raw data formatted
    return _fallback_format(stock.symbol, report)


def _build_prompt(symbol, report):
    """Build a structured prompt for LLM analysis."""
    basic = report.get("basic", {})
    darwin = report.get("darwin", {})
    technicals = report.get("technicals", {})
    earnings = report.get("earnings", {})
    insiders = report.get("insiders", {})

    return f"""You are a stock analyst using the Darwin Investment Framework (Pulak Prasad).
Analyze {symbol} and provide a Kill List assessment.

DATA:
- Price: ${basic.get('price', 'N/A')}, PE: {basic.get('pe', 'N/A')}, PB: {basic.get('pb', 'N/A')}
- ROE: {basic.get('roe', 'N/A')}%, ROA: {basic.get('roa', 'N/A')}%, Profit Margin: {basic.get('profit_margin', 'N/A')}%
- Beta: {basic.get('beta', 'N/A')}
- ROCE: {darwin.get('roce', 'N/A')}%, Debt/Equity: {darwin.get('debt_to_equity', 'N/A')}
- FCF Yield: {darwin.get('fcf_yield', 'N/A')}%, OCF/Net Income: {darwin.get('ocf_to_net_income', 'N/A')}
- RSI(14): {technicals.get('rsi', 'N/A')}, SMA Signal: {technicals.get('sma_signal', 'N/A')}
- Last Lower: {technicals.get('last_lower', 'N/A')} days
- Earnings Beat Rate: {earnings.get('beat_rate_pct', 'N/A')}%, Consecutive Beats: {earnings.get('consecutive_beats', 'N/A')}
- Insider Sentiment: {insiders.get('sentiment_label', 'N/A')} ({insiders.get('purchases_90d', 0)} buys, {insiders.get('sales_90d', 0)} sells)

INSTRUCTIONS:
1. Evaluate against Darwin's 10 Kill List criteria (based on available data)
2. Assess ROCE sustainability (>15% for 5+ years?)
3. Identify moat type and durability
4. Give a clear verdict: PASS (buy candidate), WATCH (wait for better price), or FAIL (avoid)
5. Keep it concise (200-300 words max)

Format as markdown with ## headers."""


def _call_claude(prompt, api_key):
    """Call Anthropic Claude API."""
    resp = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["content"][0]["text"]


def _call_ollama(prompt, base_url):
    """Call local Ollama instance."""
    resp = requests.post(
        f"{base_url}/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False,
        },
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["response"]


def _fallback_format(symbol, report):
    """If no LLM available, return formatted data as markdown."""
    basic = report.get("basic", {})
    darwin = report.get("darwin", {})
    verdict = report.get("verdict", {})

    return f"""## {symbol} — Auto-Generated Analysis

### Key Metrics
- Price: ${basic.get('price', 'N/A')} | PE: {basic.get('pe', 'N/A')} | ROE: {basic.get('roe', 'N/A')}%
- ROCE: {darwin.get('roce', 'N/A')}% | D/E: {darwin.get('debt_to_equity', 'N/A')}
- FCF Yield: {darwin.get('fcf_yield', 'N/A')}%

### Darwin Assessment
- Kill List Flags: {darwin.get('kill_list_flags', 'N/A')}
- ROCE > 15%: {'✅' if darwin.get('roce_above_15') else '❌'}

### Verdict
**{verdict.get('action', 'REVIEW')}** — {verdict.get('summary', 'Manual review needed.')}

---
*Auto-generated from DB data. No LLM available — set ANTHROPIC_API_KEY or OLLAMA_URL.*
"""
