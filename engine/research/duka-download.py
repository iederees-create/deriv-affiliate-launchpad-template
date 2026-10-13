#!/usr/bin/env python3
"""Resumable download of Dukascopy monthly H1 candle files (BID and ASK) into a raw cache.

  https://datafeed.dukascopy.com/datafeed/{SYMBOL}/{YYYY}/{MM0}/{SIDE}_candles_hour_1.bi5   (MM0 = month - 1)

One request at a time, a pause between requests, exponential backoff on 429/5xx. Every month ends in exactly
one state, recorded in raw/status.json:
  ok      - file saved and LZMA-decodes to whole 24-byte records
  absent  - server answered 404 or an empty body (no data published for that month)
  failed  - still erroring after all retries (re-run to retry; the script exits 1 while any remain)
Months already "ok" or "absent" are skipped on re-run. The current month is always re-fetched because it is
still growing. Nothing is ever filled in or interpolated.

  python3 engine/research/duka-download.py [--start 2008-01] [--sides BID,ASK] [--symbols EURUSD,...]
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import lzma
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

RAW_DIR = Path(__file__).resolve().parent / "data" / "dukascopy" / "raw"
STATUS_PATH = RAW_DIR / "status.json"
BASE_URL = "https://datafeed.dukascopy.com/datafeed"
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
DEFAULT_SYMBOLS = ["XAUUSD", "EURUSD", "GBPUSD", "USDJPY"]
RECORD_BYTES = 24
PAUSE_SECONDS = 1.2
MAX_RETRIES = 4
BACKOFF_BASE_SECONDS = 3.0
BACKOFF_CAP_SECONDS = 30.0
TIMEOUT_SECONDS = 20


def month_range(start: tuple[int, int], end: tuple[int, int]):
    year, month = start
    while (year, month) <= end:
        yield year, month
        year, month = (year + 1, 1) if month == 12 else (year, month + 1)


def fetch_once(url: str) -> tuple[str, bytes]:
    """Returns ("ok", body) | ("absent", b"") | raises on anything retryable."""
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            body = response.read()
            declared = response.headers.get("Content-Length")
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return "absent", b""
        raise
    if declared is not None and int(declared) != len(body):
        raise IOError(f"truncated body: got {len(body)} of {declared} bytes")
    if not body:
        return "absent", b""
    decoded = lzma.decompress(body)
    if len(decoded) % RECORD_BYTES:
        raise IOError(f"decoded length {len(decoded)} is not a multiple of {RECORD_BYTES}")
    return "ok", body


def fetch_with_retries(url: str) -> tuple[str, bytes, str]:
    last_error = ""
    for attempt in range(MAX_RETRIES):
        try:
            state, body = fetch_once(url)
            return state, body, ""
        except Exception as error:  # noqa: BLE001 - every failure is retried, then reported
            last_error = f"{type(error).__name__}: {error}"
            time.sleep(min(BACKOFF_CAP_SECONDS, BACKOFF_BASE_SECONDS * (2**attempt)))
    return "failed", b"", last_error


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", default="2008-01")
    parser.add_argument("--sides", default="BID,ASK")
    parser.add_argument("--symbols", default=",".join(DEFAULT_SYMBOLS))
    args = parser.parse_args()

    start = tuple(int(part) for part in args.start.split("-"))
    today = dt.datetime.now(dt.timezone.utc).date()
    current = (today.year, today.month)
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    status = json.loads(STATUS_PATH.read_text()) if STATUS_PATH.exists() else {}

    for side in args.sides.split(","):
        for symbol in args.symbols.split(","):
            counts = {"ok": 0, "absent": 0, "failed": 0, "cached": 0}
            for year, month in month_range(start, current):
                key = f"{symbol}/{side}/{year}-{month:02d}"
                previous = status.get(key, {}).get("state")
                if previous in ("ok", "absent") and (year, month) != current:
                    counts["cached"] += 1
                    continue
                url = f"{BASE_URL}/{symbol}/{year}/{month - 1:02d}/{side}_candles_hour_1.bi5"
                state, body, error = fetch_with_retries(url)
                if state == "ok":
                    path = RAW_DIR / symbol / f"{side}_{year}_{month:02d}.bi5"
                    path.parent.mkdir(parents=True, exist_ok=True)
                    path.write_bytes(body)
                entry = {"state": state, "bytes": len(body), "fetchedAt": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")}
                if error:
                    entry["error"] = error
                status = {**status, key: entry}
                STATUS_PATH.write_text(json.dumps(status, indent=1, sort_keys=True) + "\n")
                counts[state] += 1
                if state == "failed":
                    print(f"FAILED {key}: {error}", flush=True)
                time.sleep(PAUSE_SECONDS)
            print(f"{symbol} {side}: {counts}", flush=True)

    failed = sorted(key for key, entry in status.items() if entry["state"] == "failed")
    if failed:
        print(f"{len(failed)} months FAILED, re-run to retry:\n  " + "\n  ".join(failed), flush=True)
        return 1
    print("all requested months are ok or absent", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
