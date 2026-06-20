#!/usr/bin/env python3
"""Download annual reports (年度报告) from cninfo.com.cn for stocks in this directory."""

import os
import re
import time
import requests
from fake_useragent import UserAgent

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QUERY_URL = "http://www.cninfo.com.cn/new/hisAnnouncement/query"
STATIC_BASE = "http://static.cninfo.com.cn/"

EXCLUDED_KEYWORDS = ["修改", "取消", "摘要", "意见", "提示性", "概要", "公告", "英文"]


def get_headers():
    return {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "http://www.cninfo.com.cn",
        "User-Agent": UserAgent().random,
        "X-Requested-With": "XMLHttpRequest",
    }


def get_org_id(stock_code):
    """Get orgId for a stock code from cninfo."""
    url = "http://www.cninfo.com.cn/new/information/topSearch/query"
    data = {"keyWord": stock_code, "maxNum": "5"}
    resp = requests.post(url, headers=get_headers(), data=data, timeout=10)
    results = resp.json()
    for item in results:
        if item.get("code") == stock_code:
            return item["orgId"], item.get("type", "")
    if results:
        return results[0]["orgId"], results[0].get("type", "")
    return None, None


def fetch_report_urls(stock_code, org_id, exchange_type, start_year, end_year):
    """Fetch annual report download URLs from cninfo."""
    # Map exchange type to column parameter
    column = "sse" if exchange_type == "shj" else "szse"

    page = 1
    reports = []
    seen_years = set()

    while True:
        data = {
            "stock": f"{stock_code},{org_id}",
            "tabName": "fulltext",
            "pageSize": "30",
            "pageNum": str(page),
            "column": column,
            "category": "category_ndbg_szsh",
            "seDate": f"{start_year}-01-01~{end_year}-12-31",
            "searchkey": "",
            "secid": "",
            "sortName": "",
            "sortType": "",
            "isHLtitle": "true",
        }

        resp = requests.post(QUERY_URL, headers=get_headers(), data=data, timeout=15)
        result = resp.json()

        if result.get("totalAnnouncement", 0) == 0:
            break

        for ann in result.get("announcements", []):
            title = ann["announcementTitle"]
            if any(kw in title for kw in EXCLUDED_KEYWORDS):
                continue

            year_match = re.search(r"\d{4}(?=年)", title)
            if not year_match:
                continue
            year = year_match.group(0)
            if int(year) < start_year or int(year) > end_year:
                continue
            if year in seen_years:
                continue

            adjunct_url = ann.get("adjunctUrl", "")
            if not adjunct_url:
                continue

            url = STATIC_BASE + adjunct_url
            reports.append((url, year, title))
            seen_years.add(year)

        if not result.get("hasMore", False):
            break
        page += 1

    return reports


def download_file(url, filepath):
    """Download a file from url to filepath."""
    headers = {"User-Agent": UserAgent().random}
    resp = requests.get(url, headers=headers, timeout=120, stream=True)
    if resp.status_code == 200:
        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        size_mb = os.path.getsize(filepath) / (1024 * 1024)
        print(f"  Saved: {filepath} ({size_mb:.1f} MB)")
        return True
    print(f"  Failed to download: HTTP {resp.status_code}")
    return False


def main():
    stock_codes = [
        d for d in os.listdir(BASE_DIR)
        if os.path.isdir(os.path.join(BASE_DIR, d)) and d.isdigit()
    ]

    if not stock_codes:
        print("No stock code directories found.")
        return

    start_year = 2020
    end_year = 2025

    for code in sorted(stock_codes):
        print(f"\n{'='*60}")
        print(f"Processing {code}...")
        print(f"{'='*60}")

        org_id, exchange_type = get_org_id(code)
        if not org_id:
            print(f"  Could not find orgId for {code}, skipping.")
            continue

        print(f"  orgId: {org_id}, exchange: {exchange_type}")
        reports = fetch_report_urls(code, org_id, exchange_type, start_year, end_year)
        if not reports:
            print(f"  No annual reports found for {code} ({start_year}-{end_year}).")
            continue

        print(f"  Found {len(reports)} reports.")
        save_dir = os.path.join(BASE_DIR, code, "annual_reports")
        os.makedirs(save_dir, exist_ok=True)

        for url, year, title in sorted(reports, key=lambda x: x[1]):
            filename = f"{code}_{year}_annual_report.pdf"
            filepath = os.path.join(save_dir, filename)
            if os.path.exists(filepath):
                print(f"  {filename} already exists, skipping.")
                continue
            print(f"  Downloading: {title}")
            if download_file(url, filepath):
                time.sleep(2)  # be polite to the server

    print("\nDone!")


if __name__ == "__main__":
    main()
