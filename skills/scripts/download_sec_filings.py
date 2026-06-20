#!/usr/bin/env python3
"""Download 10-K, 10-Q, 8-K and other SEC filings for US-listed companies via EDGAR."""

import os
import time
import requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# SEC requires a User-Agent with company/name and email per fair access policy
HEADERS = {
    "User-Agent": "StockAnalysis/1.0 (fengxia41103@gmail.com)",
    "Accept-Encoding": "gzip, deflate",
}

FILING_TYPES = ["10-K", "10-Q", "8-K"]


def get_cik(ticker):
    """Look up CIK number for a ticker from SEC's company tickers JSON."""
    url = "https://www.sec.gov/files/company_tickers.json"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    for entry in data.values():
        if entry["ticker"].upper() == ticker.upper():
            return str(entry["cik_str"]).zfill(10)
    return None


def fetch_filings(cik, filing_type, count=5):
    """Fetch recent filing URLs from EDGAR for a given CIK and type."""
    url = f"https://efts.sec.gov/LATEST/search-index?q=%22{filing_type}%22&dateRange=custom&startdt=2020-01-01&enddt=2025-12-31&forms={filing_type}&hits.hits.total=true"
    # Use the submissions API instead
    submissions_url = f"https://data.sec.gov/submissions/CIK{cik}.json"
    resp = requests.get(submissions_url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    filings = []
    recent = data.get("filings", {}).get("recent", {})
    if not recent:
        return filings

    forms = recent.get("form", [])
    accessions = recent.get("accessionNumber", [])
    dates = recent.get("filingDate", [])
    primary_docs = recent.get("primaryDocument", [])

    for i, form in enumerate(forms):
        if form == filing_type and len(filings) < count:
            acc_no = accessions[i].replace("-", "")
            doc = primary_docs[i]
            doc_url = f"https://www.sec.gov/Archives/edgar/data/{cik.lstrip('0')}/{acc_no}/{doc}"
            filings.append({
                "url": doc_url,
                "date": dates[i],
                "form": form,
            })

    return filings


def download_file(url, filepath):
    """Download a file from url to filepath."""
    resp = requests.get(url, headers=HEADERS, timeout=120, stream=True)
    if resp.status_code == 200:
        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        size_kb = os.path.getsize(filepath) / 1024
        print(f"  Saved: {filepath} ({size_kb:.1f} KB)")
        return True
    print(f"  Failed: HTTP {resp.status_code} for {url}")
    return False


def main():
    # Look for ticker directories (alphabetical names) in BASE_DIR
    tickers = [
        d for d in os.listdir(BASE_DIR)
        if os.path.isdir(os.path.join(BASE_DIR, d)) and d.isalpha()
    ]

    if not tickers:
        print("No ticker directories found. Create directories named by ticker (e.g., AAPL, MSFT).")
        return

    for ticker in sorted(tickers):
        print(f"\n{'='*60}")
        print(f"Processing {ticker}...")
        print(f"{'='*60}")

        cik = get_cik(ticker)
        if not cik:
            print(f"  Could not find CIK for {ticker}, skipping.")
            continue

        print(f"  CIK: {cik}")
        save_dir = os.path.join(BASE_DIR, ticker, "sec_filings")
        os.makedirs(save_dir, exist_ok=True)

        for filing_type in FILING_TYPES:
            print(f"\n  Fetching {filing_type} filings...")
            filings = fetch_filings(cik, filing_type, count=5)
            if not filings:
                print(f"    No {filing_type} filings found.")
                continue

            print(f"    Found {len(filings)} {filing_type} filings.")
            for f in filings:
                ext = os.path.splitext(f["url"])[1] or ".htm"
                filename = f"{ticker}_{f['form']}_{f['date']}{ext}"
                filepath = os.path.join(save_dir, filename)
                if os.path.exists(filepath):
                    print(f"    {filename} already exists, skipping.")
                    continue
                print(f"    Downloading {f['form']} ({f['date']})...")
                download_file(f["url"], filepath)
                time.sleep(0.5)  # SEC rate limit: 10 req/sec

    print("\nDone!")


if __name__ == "__main__":
    main()
