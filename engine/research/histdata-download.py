#!/usr/bin/env python3
"""Resumable download of histdata.com free 1-minute BID bars (ASCII) into a raw zip cache.

Past years come as one zip per year; the current year as one zip per month. The site needs the form token
from the pair/year page and a matching Referer. One request at a time with a pause. Every period ends as
  ok      - a zip that opens and holds one CSV
  absent  - the page has no download form (no data published for that pair/period)
  failed  - still erroring after retries (re-run to retry; exit code 1 while any remain)
Finished past periods are skipped on re-run; the current month is always re-fetched. Nothing is filled in.

  python3 engine/research/histdata-download.py [--start-year 2005] [--pairs EURUSD,GBPUSD,USDJPY,XAUUSD]
"""
from __future__ import annotations

import argparse
import datetime as dt
import http.cookiejar
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

RAW_DIR = Path(__file__).resolve().parent / "data" / "histdata" / "raw"
STATUS_PATH = RAW_DIR / "status.json"
SITE = "https://www.histdata.com"
PAGE_URL = SITE + "/download-free-forex-historical-data/?/ascii/1-minute-bar-quotes/{pair}/{period}"
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
DEFAULT_PAIRS = ["XAUUSD", "EURUSD", "GBPUSD", "USDJPY"]
TOKEN_PATTERN = re.compile(r'id="tk" value="([0-9a-f]+)"')
PAUSE_SECONDS = 2.0
MAX_RETRIES = 4
BACKOFF_BASE_SECONDS = 5.0
TIMEOUT_SECONDS = 180


def periods(start_year: int, today: dt.date):
    """(label, page period path, date field, datemonth field) for each downloadable period."""
    for year in range(start_year, today.year):
        yield f"{year}", f"{year}", f"{year}", f"{year}"
    for month in range(1, today.month + 1):
        yield f"{today.year}-{month:02d}", f"{today.year}/{month}", f"{today.year}", f"{today.year}{month:02d}"


def fetch_once(opener, pair: str, page_period: str, date_field: str, datemonth_field: str) -> tuple[str, bytes]:
    page_url = PAGE_URL.format(pair=pair.lower(), period=page_period)
    with opener.open(urllib.request.Request(page_url, headers={"User-Agent": USER_AGENT}), timeout=TIMEOUT_SECONDS) as response:
        page = response.read().decode("utf-8", "replace")
    token = TOKEN_PATTERN.search(page)
    if not token:
        return "absent", b""
    form = urllib.parse.urlencode({
        "tk": token.group(1), "date": date_field, "datemonth": datemonth_field,
        "platform": "ASCII", "timeframe": "M1", "fxpair": pair,
    }).encode()
    headers = {
        "User-Agent": USER_AGENT, "Referer": page_url, "Origin": SITE,
        "Content-Type": "application/x-www-form-urlencoded",
    }
    with opener.open(urllib.request.Request(SITE + "/get.php", data=form, headers=headers), timeout=TIMEOUT_SECONDS) as response:
        body = response.read()
    with zipfile.ZipFile(io.BytesIO(body)) as archive:
        csv_names = [name for name in archive.namelist() if name.lower().endswith(".csv")]
        if len(csv_names) != 1 or archive.testzip() is not None:
            raise IOError(f"unexpected zip contents: {archive.namelist()}")
    return "ok", body


def fetch_with_retries(opener, *args) -> tuple[str, bytes, str]:
    last_error = ""
    for attempt in range(MAX_RETRIES):
        try:
            state, body = fetch_once(opener, *args)
            return state, body, ""
        except Exception as error:  # noqa: BLE001 - every failure is retried, then reported
            last_error = f"{type(error).__name__}: {error}"
            time.sleep(BACKOFF_BASE_SECONDS * (2**attempt))
    return "failed", b"", last_error


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start-year", type=int, default=2005)
    parser.add_argument("--pairs", default=",".join(DEFAULT_PAIRS))
    args = parser.parse_args()

    today = dt.datetime.now(dt.timezone.utc).date()
    current_label = f"{today.year}-{today.month:02d}"
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    status = json.loads(STATUS_PATH.read_text()) if STATUS_PATH.exists() else {}
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    for pair in args.pairs.split(","):
        counts = {"ok": 0, "absent": 0, "failed": 0, "cached": 0}
        for label, page_period, date_field, datemonth_field in periods(args.start_year, today):
            key = f"{pair}/{label}"
            if status.get(key, {}).get("state") in ("ok", "absent") and label != current_label:
                counts["cached"] += 1
                continue
            state, body, error = fetch_with_retries(opener, pair, page_period, date_field, datemonth_field)
            if state == "ok":
                path = RAW_DIR / pair / f"{label}.zip"
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(body)
            entry = {"state": state, "bytes": len(body), "fetchedAt": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")}
            if error:
                entry["error"] = error
            status = {**status, key: entry}
            STATUS_PATH.write_text(json.dumps(status, indent=1, sort_keys=True) + "\n")
            counts[state] += 1
            print(f"{key}: {state} {len(body)} bytes {error}", flush=True)
            time.sleep(PAUSE_SECONDS)
        print(f"{pair}: {counts}", flush=True)

    failed = sorted(key for key, entry in status.items() if entry["state"] == "failed")
    if failed:
        print(f"{len(failed)} periods FAILED, re-run to retry:\n  " + "\n  ".join(failed), flush=True)
        return 1
    print("all requested periods are ok or absent", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
