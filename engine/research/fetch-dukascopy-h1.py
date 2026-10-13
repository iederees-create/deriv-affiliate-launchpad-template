#!/usr/bin/env python3
"""Download Dukascopy native H1 BID candles over HTTP and write UTC CSVs.

Dukascopy HTTPS datafeed 429/503s from this host; HTTP works:
  http://datafeed.dukascopy.com/datafeed/{SYMBOL}/{YYYY}/{MM0}/BID_candles_hour_1.bi5

Each monthly .bi5 is LZMA, 24-byte big-endian records:
  uint32 seconds-from-month-start, uint32 open, close, low, high, float32 volume.

Price divisors: EURUSD/GBPUSD 1e5, USDJPY/XAUUSD 1e3.

Closed-market placeholder bars (OHLC equal and volume==0) are dropped.
Timezone: UTC.

  python3 engine/research/fetch-dukascopy-h1.py
"""
from __future__ import annotations

import csv
import datetime as dt
import json
import lzma
import struct
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

OUT = Path(__file__).resolve().parent / "data" / "dukascopy"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
BASE = "http://datafeed.dukascopy.com/datafeed"
START = dt.date(2016, 1, 1)
END = dt.date.today()
SYMBOLS = {
    "EURUSD": 1e5,
    "GBPUSD": 1e5,
    "USDJPY": 1e3,
    "XAUUSD": 1e3,
}


def months(start: dt.date, end: dt.date):
    y, m = start.year, start.month
    while (y, m) <= (end.year, end.month):
        yield y, m
        m += 1
        if m == 13:
            y += 1
            m = 1


def fetch(url: str, retries: int = 10) -> bytes | None:
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            last = e
            time.sleep(min(12.0, 0.8 * (2 ** i)))
        except Exception as e:
            last = e
            time.sleep(min(12.0, 0.8 * (2 ** i)))
    print(f"skip after retries {url}: {last}", flush=True)
    return None


def parse_month(raw: bytes, year: int, month: int, div: float):
    data = lzma.decompress(raw)
    if len(data) % 24:
        raise ValueError(f"bad bi5 length {len(data)}")
    start = int(dt.datetime(year, month, 1, tzinfo=dt.timezone.utc).timestamp())
    rows = []
    for i in range(0, len(data), 24):
        t, o, c, lo, h, v = struct.unpack(">5If", data[i : i + 24])
        epoch = start + t
        open_, high, low, close = o / div, h / div, lo / div, c / div
        if v == 0 and open_ == high == low == close:
            continue
        rows.append((epoch, open_, high, low, close))
    return rows


def iso(epoch: int) -> str:
    return dt.datetime.fromtimestamp(epoch, dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def gap_report(epochs: list[int]):
    weekend = other = 0
    sample = []
    for a, b in zip(epochs, epochs[1:]):
        if b - a == 3600:
            continue
        hours = (b - a) / 3600
        start = dt.datetime.fromtimestamp(a, dt.timezone.utc)
        if 40 <= hours <= 56 and start.weekday() == 4:
            weekend += 1
        else:
            other += 1
            if len(sample) < 40:
                sample.append({"after": iso(a), "next": iso(b), "hours": round(hours, 2)})
    return {"weekendGaps": weekend, "otherGaps": other, "sampleNonWeekendGaps": sample}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    index = {
        "fetchedAt": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": {
            "kind": "Dukascopy Bank SA public datafeed, native H1 BID candles",
            "urlPattern": BASE + "/{SYMBOL}/{YYYY}/{MM0}/BID_candles_hour_1.bi5",
            "transport": "HTTP (HTTPS 429/503 from this host)",
            "timezone": "UTC",
            "priceType": "BID",
            "closedMarketFilter": "dropped bars with volume==0 and OHLC equal",
            "start": str(START),
            "end": str(END),
        },
        "symbols": {},
    }
    workers = 4
    for symbol, div in SYMBOLS.items():
        by_epoch = {}
        months_ok = 0
        months_miss = 0
        jobs = list(months(START, END))

        def one(ym):
            y, m = ym
            url = f"{BASE}/{symbol}/{y}/{m-1:02d}/BID_candles_hour_1.bi5"
            raw = fetch(url)
            if not raw:
                return y, m, None
            return y, m, parse_month(raw, y, m, div)

        with ThreadPoolExecutor(max_workers=workers) as pool:
            futs = [pool.submit(one, ym) for ym in jobs]
            done = 0
            for fut in as_completed(futs):
                y, m, rows = fut.result()
                done += 1
                if rows is None:
                    months_miss += 1
                    print(f"{symbol} {y}-{m:02d} miss ({done}/{len(jobs)})", flush=True)
                    continue
                for epoch, o, h, l, c in rows:
                    by_epoch[epoch] = (o, h, l, c)
                months_ok += 1
                if done % 12 == 0 or done == len(jobs):
                    print(f"{symbol} {done}/{len(jobs)} months unique={len(by_epoch)}", flush=True)
        ordered = sorted(by_epoch.items())
        csv_path = OUT / f"{symbol}_h1.csv"
        with csv_path.open("w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["time", "open", "high", "low", "close"])
            for epoch, (o, h, l, c) in ordered:
                w.writerow([iso(epoch), o, h, l, c])
        epochs = [e for e, _ in ordered]
        meta = {
            "symbol": symbol,
            "csv": csv_path.name,
            "bars": len(ordered),
            "first": iso(epochs[0]) if epochs else None,
            "last": iso(epochs[-1]) if epochs else None,
            "timezone": "UTC",
            "priceType": "BID",
            "divisor": div,
            "monthsOk": months_ok,
            "monthsMiss": months_miss,
            "gaps": gap_report(epochs) if epochs else None,
        }
        (OUT / f"{symbol}_h1.meta.json").write_text(json.dumps(meta, indent=2) + "\n")
        index["symbols"][symbol] = meta
        print(f"wrote {csv_path} {meta['bars']} {meta['first']} -> {meta['last']}", flush=True)
    (OUT / "index.json").write_text(json.dumps(index, indent=2) + "\n")
    print(json.dumps({k: {"bars": v["bars"], "first": v["first"], "last": v["last"]} for k, v in index["symbols"].items()}, indent=2))


if __name__ == "__main__":
    main()
