# H1 candle data log (branch research/honest-edge)

Last updated 2026-10-13. Public market data only. No Deriv login or trade token was used. Nothing is filled in
or interpolated: hours with no source data are absent from the CSVs.

Grok's original version of this file is preserved in `~/launchpad-research-grok-backup/engine/research/DATA.md`.
It described a Dukascopy dataset that was never saved.

## Sources tried

| Source | Result |
| --- | --- |
| Deriv `wss://ws.derivws.com/websockets/v3?app_id=1089` | socket error from this host (re-tested 2026-10-13) |
| Deriv `wss://api.derivws.com/trading/v1/options/ws/public` | works; H1 history stops about 1 year back. A request for a 2018 or 2023 window returns the latest bars instead |
| histdata.com 1-minute BID bars | works; all years downloaded, 0 failures |
| Dukascopy `datafeed.dukascopy.com` H1 BID/ASK | mostly 503 "No server is available" or timeouts on 2026-10-13; a few months per 10 minutes get through |
| Stooq, Yahoo Finance | blocked (Grok's attempt; not re-tested) |
| MT5 terminal history on this computer | present under `~/.mt5` (Deriv gold 2016-2026, FX 2023-2026) but not exported: that needs the terminal to be started, which logs in to the account |

## Dataset A: Deriv public API (the feed the paper engine uses)

- Files: `data/frx{XAUUSD,EURUSD,GBPUSD,USDJPY}_h1_hour.csv` (downloaded by Grok with `fetch-h1.mjs`, re-checked independently).
- UTC. 2025-10-13T12:00Z to 2026-10-13T11:00Z. 5,793 gold bars, 6,058 bars per FX pair.
- No duplicates, no out-of-order rows, no impossible candles, no Saturday or Sunday bars (FX reopens Monday 00:00 UTC).
- Do not use `data/frx*_h1.csv` (without `_hour`): each has 9 off-the-hour page-boundary bars.
- The last bar (11:00Z on the fetch day) was still forming when fetched. Drop it before backtesting.
- Too short on its own for a 60/20/20 split.

## Dataset B: histdata.com 1-minute BID bars, built into H1

- Download: `histdata-download.py` -> `data/histdata/raw/{PAIR}/{YYYY}.zip` (and `{YYYY}-{MM}.zip` for 2026). 120 files, 265 MB, all `ok`; XAUUSD 2005-2008 are `absent` (not published).
- Build: `build-h1.py` -> `data/histdata/{PAIR}_h1.csv` plus `{PAIR}_h1.qa.json`.

| Symbol | H1 bars | First (UTC) | Last (UTC) |
| --- | --- | --- | --- |
| XAUUSD | 104,507 | 2009-03-15T21:00Z | 2026-10-09T20:00Z |
| EURUSD | 134,666 | 2005-01-03T06:00Z | 2026-10-09T20:00Z |
| GBPUSD | 134,643 | 2005-01-03T06:00Z | 2026-10-09T20:00Z |
| USDJPY | 134,650 | 2005-01-03T06:00Z | 2026-10-09T20:00Z |

### Time zone (the site's documentation is wrong)

histdata documents its stamps as "EST without daylight saving". Measured against UTC references it is not:

- March 2012 (gold) and March 2018 (EURUSD) against Dukascopy UTC candles: best match is +5h until the US clock
  change (Sunday 11 March in both years) and +4h from that day. So before 2019 the files are New York local time.
- 2025-10 to 2026-10 (gold) against Deriv UTC candles: the offset changes on 2025-10-26 and 2026-03-29, the
  European clock-change dates, not the US ones.
- The file-time of the Friday close in the weeks between the US and European changes is 16:59 up to November
  2018 and 15:59 from March 2019, in every year checked. So the switch of convention happened in winter 2018-19.

Rule applied by `build-h1.py`: file dates before 2019-01-01 are read as America/New_York local time; later dates
as UTC-5 in European winter time and UTC-4 in European summer time. A fixed +5h, as documented, would shift
every summer bar by one hour, which would move the London-breakout session by an hour for half of each year.

After conversion, H1 closes against Deriv over the overlapping year (about 5,700-6,000 common bars per symbol):
median difference 0.80 bp for gold, 0.17 bp EURUSD, 0.30 bp GBPUSD, 0.19 bp USDJPY; 99th percentile under 6 bp.

Still unverified: the clock rule for years with no UTC reference month (2005-2011, 2013-2017, 2019-2024) rests
on the Friday-close pattern, which holds in 92-100% of weeks in every year except 2010 and 2023 (see below).

### Known defects (not repaired)

- **February to July 2023 is badly incomplete for all four symbols.** About half the weekdays have no bars from
  10:00 to 23:00 UTC (London and New York sessions). 2023 has about 5,400 FX bars against about 6,200 in other
  years. Results for 2023 from this dataset are not trustworthy until those months are replaced.
- January to March 2005 (FX) has Saturday and Sunday bars and broken sessions. Use FX from 2006-01 at the earliest.
- Whole trading days missing: 2023-04-07 and 2026-09-25 (all symbols), 2005-07-01 (FX). Large part-day holes:
  2014-06-02, 2020-11-30, 2021-05-31, and for USDJPY 2024-10-22 and 2024-10-31.
- In 2010 and early 2011 about a quarter of weeks end one hour later than the usual Friday close. Cause not
  established (extra hour of quotes, or a clock difference in those weeks).
- Duplicate 1-minute rows dropped (first kept): 1,208 gold, 366 EURUSD, 436 GBPUSD, 527 USDJPY.
- No impossible candles. The few very large bars are on known event dates (for example 2016-06-24 for GBPUSD).
- Gold has no bars on Good Fridays; that is the market being closed.
- This is a BID-only feed from a different liquidity source than Deriv MT5. It carries no spread information.

## Dataset C: Dukascopy native H1 BID/ASK (incomplete)

- Download: `duka-download.py` -> `data/dukascopy/raw/{SYMBOL}/{SIDE}_{YYYY}_{MM}.bi5`, state per month in `raw/status.json`.
- Only a handful of months have been saved so far (see `status.json`). The two used for the time-zone check
  (XAUUSD 2012-03, EURUSD 2018-03) decode cleanly and match histdata to within 0.1 bp on EURUSD.
- Not built into a usable series yet. ASK candles (for a historical spread sample) not downloaded yet.
- Grok's `fetch-dukascopy-h1.py` is superseded: it kept everything in memory, saved nothing on a crash and
  skipped failed months silently.

## Reproduce

```
node    engine/research/fetch-h1.mjs            # Dataset A
python3 engine/research/histdata-download.py    # Dataset B raw (resumable)
python3 engine/research/duka-download.py        # Dataset C raw (resumable; exits 1 while months are failing)
python3 engine/research/build-h1.py             # raw caches -> H1 CSV + QA JSON
```
