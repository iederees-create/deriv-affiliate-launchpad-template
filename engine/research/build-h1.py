#!/usr/bin/env python3
"""Build UTC H1 CSVs (time,open,high,low,close) and a QA report from the raw download caches.

  histdata  : 1-minute BID bars. The site documents the stamps as "EST without daylight saving". Measured
              against UTC references (Dukascopy March 2012 and March 2018, Deriv 2025-26, see DATA.md) that
              is wrong in two different ways:
                file dates before 2019 : New York local time, clock changes on US dates
                file dates from 2019   : UTC-5, moving to UTC-4 on EUROPEAN summer-time dates
              Rows are converted by that measured rule, then grouped by UTC hour (open = first minute,
              high = max, low = min, close = last minute).
  dukascopy : native monthly H1 BID and ASK candles, already UTC. Flat zero-volume placeholders that
              Dukascopy writes for closed-market hours are dropped. ASK - BID opens give an hourly spread sample.

Bars are built only from rows that exist. Hours with no data are left out, never filled. Every gap that is
not a normal weekend is listed in the QA file so it can be checked against holidays.

  python3 engine/research/build-h1.py [--sources histdata,dukascopy]
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import io
import json
import lzma
import struct
import zipfile
from collections import Counter
from pathlib import Path
from zoneinfo import ZoneInfo

DATA_DIR = Path(__file__).resolve().parent / "data"
SYMBOLS = ["XAUUSD", "EURUSD", "GBPUSD", "USDJPY"]
HOUR_SECONDS = 3600
HISTDATA_US_CLOCK_ZONE = ZoneInfo("America/New_York")
HISTDATA_EU_CLOCK_ZONE = ZoneInfo("Europe/London")  # only its summer-time dates are used
HISTDATA_EU_CLOCK_FROM = "20190101"  # the switch happened between Nov 2018 and Mar 2019; both rules agree in winter
HISTDATA_WINTER_OFFSET_HOURS = 5
DUKASCOPY_DIVISORS = {"XAUUSD": 1e3, "EURUSD": 1e5, "GBPUSD": 1e5, "USDJPY": 1e3}
DUKASCOPY_RECORD = struct.Struct(">5If")
PRICE_DECIMALS = {"XAUUSD": 3, "EURUSD": 5, "GBPUSD": 5, "USDJPY": 3}
MAX_LISTED_GAPS = 400
UTC = dt.timezone.utc


def iso(epoch: int) -> str:
    return dt.datetime.fromtimestamp(epoch, UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def histdata_day_start(day: str) -> int:
    """Epoch (UTC) of 00:00 file time on a file date such as 20190102.

    Every clock change (US or European) happens while the market is shut for the weekend, before the Sunday
    reopen, so the offset in force at noon holds for all of that day's bars.
    """
    noon = dt.datetime.strptime(day, "%Y%m%d").replace(hour=12)
    zone = HISTDATA_EU_CLOCK_ZONE if day >= HISTDATA_EU_CLOCK_FROM else HISTDATA_US_CLOCK_ZONE
    is_summer = bool(noon.replace(tzinfo=zone).dst())
    offset_hours = HISTDATA_WINTER_OFFSET_HOURS - (1 if is_summer else 0)
    midnight = noon.replace(hour=0, tzinfo=UTC)
    return int(midnight.timestamp()) + offset_hours * HOUR_SECONDS


def histdata_minutes(symbol: str):
    """Yields (epoch_utc, open, high, low, close) for every 1-minute row, in file order."""
    folder = DATA_DIR / "histdata" / "raw" / symbol
    day_start: dict[str, int] = {}
    for path in sorted(folder.glob("*.zip")):
        with zipfile.ZipFile(path) as archive:
            name = next(n for n in archive.namelist() if n.lower().endswith(".csv"))
            for line in io.TextIOWrapper(archive.open(name), "ascii"):
                stamp, o, h, l, c, _volume = line.strip().split(";")
                day, clock = stamp.split(" ")
                if day not in day_start:
                    day_start[day] = histdata_day_start(day)
                seconds = int(clock[:2]) * HOUR_SECONDS + int(clock[2:4]) * 60 + int(clock[4:])
                yield day_start[day] + seconds, float(o), float(h), float(l), float(c)


def histdata_h1(symbol: str):
    bars: dict[int, list] = {}
    seen_minutes: set[int] = set()
    duplicates = 0
    for epoch, o, h, l, c in histdata_minutes(symbol):
        if epoch in seen_minutes:
            duplicates += 1
            continue
        seen_minutes.add(epoch)
        hour = epoch - epoch % HOUR_SECONDS
        bar = bars.get(hour)
        if bar is None:
            bars[hour] = [epoch, o, h, l, epoch, c, 1]  # first minute, O, H, L, last minute, C, minute count
            continue
        if epoch < bar[0]:
            bar[0], bar[1] = epoch, o
        if epoch > bar[4]:
            bar[4], bar[5] = epoch, c
        bar[2], bar[3], bar[6] = max(bar[2], h), min(bar[3], l), bar[6] + 1
    rows = [(hour, b[1], b[2], b[3], b[5]) for hour, b in sorted(bars.items())]
    thin = sum(1 for b in bars.values() if b[6] < 30)
    return rows, {"duplicateInputRows": duplicates, "inputRows": len(seen_minutes), "barsWithUnder30Minutes": thin}


def dukascopy_h1(symbol: str, side: str):
    folder = DATA_DIR / "dukascopy" / "raw" / symbol
    divisor = DUKASCOPY_DIVISORS[symbol]
    by_epoch: dict[int, tuple] = {}
    duplicates = placeholders = 0
    for path in sorted(folder.glob(f"{side}_*.bi5")):
        _side, year, month = path.stem.split("_")
        month_start = int(dt.datetime(int(year), int(month), 1, tzinfo=UTC).timestamp())
        decoded = lzma.decompress(path.read_bytes())
        for seconds, o, c, l, h, volume in DUKASCOPY_RECORD.iter_unpack(decoded):
            if volume == 0 and o == h == l == c:
                placeholders += 1
                continue
            epoch = month_start + seconds
            if epoch in by_epoch:
                duplicates += 1
                continue
            by_epoch[epoch] = (epoch, o / divisor, h / divisor, l / divisor, c / divisor)
    rows = [by_epoch[e] for e in sorted(by_epoch)]
    return rows, {"duplicateInputRows": duplicates, "inputRows": len(rows) + placeholders, "closedMarketPlaceholdersDropped": placeholders}


def quality(rows) -> dict:
    epochs = [r[0] for r in rows]
    bad = sum(1 for _, o, h, l, c in rows if not (l > 0 and h >= max(o, c) and l <= min(o, c)))
    flat = sum(1 for _, o, h, l, c in rows if h == l)
    off_hour = sum(1 for e in epochs if e % HOUR_SECONDS)
    weekdays = Counter(dt.datetime.fromtimestamp(e, UTC).weekday() for e in epochs)
    weekend_gaps = 0
    weekday_gaps = []
    for before, after in zip(epochs, epochs[1:]):
        if after - before == HOUR_SECONDS:
            continue
        start = dt.datetime.fromtimestamp(before, UTC)
        hours = (after - before) / HOUR_SECONDS
        if start.weekday() == 4 and 40 <= hours <= 56:
            weekend_gaps += 1
        else:
            weekday_gaps.append({"after": iso(before), "next": iso(after), "hours": hours, "weekday": start.strftime("%a")})
    gap_sizes = Counter(g["hours"] for g in weekday_gaps)
    return {
        "bars": len(rows),
        "first": iso(epochs[0]),
        "last": iso(epochs[-1]),
        "barsPerYear": dict(sorted(Counter(dt.datetime.fromtimestamp(e, UTC).year for e in epochs).items())),
        "badCandles": bad,
        "flatCandles": flat,
        "offHourStamps": off_hour,
        "saturdayBars": weekdays[5],
        "sundayBars": weekdays[6],
        "weekendGaps": weekend_gaps,
        "weekdayGapCount": len(weekday_gaps),
        "weekdayGapHoursHistogram": {str(k): v for k, v in sorted(gap_sizes.items())},
        "weekdayGapsOver4h": [g for g in weekday_gaps if g["hours"] > 4][:MAX_LISTED_GAPS],
    }


def write_outputs(source: str, name: str, symbol: str, rows, extra: dict) -> dict:
    folder = DATA_DIR / source
    decimals = PRICE_DECIMALS[symbol]
    with (folder / f"{name}_h1.csv").open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["time", "open", "high", "low", "close"])
        for epoch, o, h, l, c in rows:
            writer.writerow([iso(epoch), *(f"{value:.{decimals}f}" for value in (o, h, l, c))])
    report = {**extra, **quality(rows)}
    (folder / f"{name}_h1.qa.json").write_text(json.dumps(report, indent=1) + "\n")
    return report


def summarise(label: str, report: dict) -> None:
    print(
        f"{label}: {report['bars']} bars {report['first']} .. {report['last']} | dupRows={report['duplicateInputRows']}"
        f" bad={report['badCandles']} flat={report['flatCandles']} sat={report['saturdayBars']} sun={report['sundayBars']}"
        f" weekendGaps={report['weekendGaps']} weekdayGaps={report['weekdayGapCount']} (>4h: {len(report['weekdayGapsOver4h'])})",
        flush=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sources", default="histdata,dukascopy")
    args = parser.parse_args()
    sources = args.sources.split(",")

    for symbol in SYMBOLS:
        if "histdata" in sources and (DATA_DIR / "histdata" / "raw" / symbol).is_dir():
            rows, extra = histdata_h1(symbol)
            extra = {"source": "histdata.com 1-minute BID bars", "timezone": "converted to UTC by a measured rule: New York local time before 2019, UTC-5/UTC-4 on European summer-time dates from 2019", **extra}
            summarise(f"histdata {symbol}", write_outputs("histdata", symbol, symbol, rows, extra))
        if "dukascopy" not in sources:
            continue
        for side in ("BID", "ASK"):
            if not list((DATA_DIR / "dukascopy" / "raw" / symbol).glob(f"{side}_*.bi5")):
                continue
            rows, extra = dukascopy_h1(symbol, side)
            extra = {"source": f"Dukascopy native H1 {side} candles", "timezone": "UTC (native)", **extra}
            summarise(f"dukascopy {symbol} {side}", write_outputs("dukascopy", f"{symbol}_{side.lower()}", symbol, rows, extra))


if __name__ == "__main__":
    main()
