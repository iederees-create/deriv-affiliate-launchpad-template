#!/usr/bin/env python3
"""N3 time-series momentum test (see PROTOCOL.md).   python3 engine/research/newideas/tsmom/tsmom.py"""
from __future__ import annotations

import csv
import datetime as dt
import math
import random
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
OUT_PATH = Path(__file__).resolve().parent / "RESULT.md"
UTC = dt.timezone.utc
SYMBOLS = ["XAUUSD", "EURUSD", "GBPUSD", "USDJPY"]
MT5_FROM = dt.date(2017, 1, 1)
MEASURED_SPREAD = {"XAUUSD": 0.17, "EURUSD": 0.00004, "GBPUSD": 0.00005, "USDJPY": 0.005}
# Price units per night, Deriv MT5 on 2026-10-13 (COSTS.md). Negative is a charge.
SWAP_PER_NIGHT = {
    "XAUUSD": {1: -0.45, -1: 0.20},
    "EURUSD": {1: -0.0001142, -1: 0.0000266},
    "GBPUSD": {1: -0.0000543, -1: -0.0000413},
    "USDJPY": {1: 0.00995, -1: -0.02198},
}
LOOKBACK_MONTHS = 12
SENSITIVITY_LOOKBACKS = [6, 9]
VOL_WINDOW_DAYS = 60
TARGET_ANNUAL_VOL = 0.10
MAX_LEVERAGE = 3.0
TRADING_DAYS = 260
EVIDENCE_FROM = (2013, 1)
SECOND_HALF_FROM = (2019, 12)
INTERVAL = 0.983
RESAMPLES = 10000


def daily_closes(symbol: str) -> list[tuple[dt.date, float]]:
    closes: dict[dt.date, float] = {}
    for source, keep in (("histdata", lambda d: d < MT5_FROM), ("mt5", lambda d: d >= MT5_FROM)):
        with (DATA_DIR / source / f"{symbol}_h1.csv").open() as handle:
            for row in csv.DictReader(handle):
                day = dt.date.fromisoformat(row["time"][:10])
                if day.weekday() < 5 and keep(day):
                    closes[day] = float(row["close"])  # rows are in time order, so the last close of the day wins
    return sorted(closes.items())


def month_of(day: dt.date) -> tuple[int, int]:
    return (day.year, day.month)


def instrument_months(symbol: str, lookback: int) -> dict[tuple[int, int], dict]:
    """Per calendar month: position held, leverage, and return before costs, after spread, after spread and swap."""
    days = daily_closes(symbol)
    month_end_index: dict[tuple[int, int], int] = {}
    for index, (day, _close) in enumerate(days):
        month_end_index[month_of(day)] = index
    months = sorted(month_end_index)
    results: dict[tuple[int, int], dict] = {}
    previous_exposure = 0.0
    for position_in_list in range(lookback, len(months) - 1):
        signal_month = months[position_in_list]
        held_month = months[position_in_list + 1]
        end_index = month_end_index[signal_month]
        start_index = month_end_index[months[position_in_list - lookback]]
        if end_index < VOL_WINDOW_DAYS:
            continue
        price_now = days[end_index][1]
        direction = 1 if price_now > days[start_index][1] else -1
        window = [math.log(days[i][1] / days[i - 1][1]) for i in range(end_index - VOL_WINDOW_DAYS + 1, end_index + 1)]
        mean = sum(window) / len(window)
        annual_vol = math.sqrt(sum((x - mean) ** 2 for x in window) / (len(window) - 1)) * math.sqrt(TRADING_DAYS)
        leverage = min(MAX_LEVERAGE, TARGET_ANNUAL_VOL / annual_vol) if annual_vol > 0 else 0.0
        exposure = direction * leverage
        exit_index = month_end_index[held_month]
        price_exit = days[exit_index][1]
        gross = exposure * (price_exit / price_now - 1)
        spread_cost = abs(exposure - previous_exposure) * MEASURED_SPREAD[symbol] / price_now
        nights = (days[exit_index][0] - days[end_index][0]).days
        swap = leverage * nights * SWAP_PER_NIGHT[symbol][direction] / price_now
        results[held_month] = {"direction": direction, "leverage": leverage, "gross": gross, "afterSpread": gross - spread_cost, "net": gross - spread_cost + swap}
        previous_exposure = exposure
    return results


def portfolio(lookback: int) -> dict[tuple[int, int], dict]:
    per_symbol = {symbol: instrument_months(symbol, lookback) for symbol in SYMBOLS}
    months = sorted({m for table in per_symbol.values() for m in table})
    out = {}
    for month in months:
        present = [per_symbol[s][month] for s in SYMBOLS if month in per_symbol[s]]
        out[month] = {key: sum(p[key] for p in present) / len(present) for key in ("gross", "afterSpread", "net")}
        out[month]["instruments"] = len(present)
    return out, per_symbol


def interval(values: list[float], seed: int) -> tuple[float, float]:
    rng = random.Random(seed)
    means = sorted(sum(rng.choice(values) for _ in values) / len(values) for _ in range(RESAMPLES))
    tail = (1 - INTERVAL) / 2
    return means[int(RESAMPLES * tail)], means[int(RESAMPLES * (1 - tail))]


def describe(values: list[float]) -> dict:
    n = len(values)
    mean = sum(values) / n
    sd = math.sqrt(sum((v - mean) ** 2 for v in values) / (n - 1))
    equity = peak = 1.0
    worst = 0.0
    for v in values:
        equity *= 1 + v
        peak = max(peak, equity)
        worst = max(worst, 1 - equity / peak)
    low, high = interval(values, 4242)
    return {"months": n, "mean": mean, "annual": mean * 12, "sharpe": mean / sd * math.sqrt(12) if sd else float("nan"),
            "positive": sum(1 for v in values if v > 0) / n, "maxDrawdown": worst, "low": low, "high": high}


def pct(x: float, dp: int = 2) -> str:
    return f"{100 * x:+.{dp}f}%"


def main() -> None:
    lines: list[str] = []
    table, per_symbol = portfolio(LOOKBACK_MONTHS)
    windows = [
        ("Context: before 2013", lambda m: m < EVIDENCE_FROM),
        ("Evidence: 2013-01 onward", lambda m: m >= EVIDENCE_FROM),
        ("First half: 2013-01 to 2019-11", lambda m: EVIDENCE_FROM <= m < SECOND_HALF_FROM),
        ("Second half: 2019-12 onward", lambda m: m >= SECOND_HALF_FROM),
    ]
    lines += ["# N3 time-series momentum: result", "", "12-month look-back, monthly rebalance, four instruments, 10% risk target each. See PROTOCOL.md.",
              "Monthly returns of the equal-weight portfolio, as a share of account equity.", "",
              "## Portfolio", "", "| Window | Months | Mean per month, before costs | After spread | After spread and swap | Per year (after all costs) | 98.3% interval for the monthly mean | Sharpe ratio | Months positive | Max drawdown |",
              "|---|---|---|---|---|---|---|---|---|---|"]
    summary = {}
    for label, keep in windows:
        months = [m for m in sorted(table) if keep(m)]
        net = describe([table[m]["net"] for m in months])
        gross = sum(table[m]["gross"] for m in months) / len(months)
        after_spread = sum(table[m]["afterSpread"] for m in months) / len(months)
        summary[label] = net
        lines.append(f"| {label} | {net['months']} | {pct(gross)} | {pct(after_spread)} | {pct(net['mean'])} | {pct(net['annual'], 1)} | {pct(net['low'])} to {pct(net['high'])} | {net['sharpe']:.2f} | {100 * net['positive']:.0f}% | {100 * net['maxDrawdown']:.1f}% |")

    lines += ["", "## Per instrument, evidence window (2013-01 onward)", "", "| Instrument | Months | Before costs, per year | After spread and swap, per year | Months long | Average leverage |", "|---|---|---|---|---|---|"]
    for symbol in SYMBOLS:
        rows = [v for m, v in sorted(per_symbol[symbol].items()) if m >= EVIDENCE_FROM]
        lines.append(f"| {symbol} | {len(rows)} | {pct(12 * sum(r['gross'] for r in rows) / len(rows), 1)} | {pct(12 * sum(r['net'] for r in rows) / len(rows), 1)} | {100 * sum(1 for r in rows if r['direction'] > 0) / len(rows):.0f}% | {sum(r['leverage'] for r in rows) / len(rows):.2f} |")

    lines += ["", "## Per calendar year, portfolio after spread and swap", "", "| Year | Months | Return |", "|---|---|---|"]
    for year in sorted({m[0] for m in table}):
        values = [table[m]["net"] for m in sorted(table) if m[0] == year]
        total = 1.0
        for v in values:
            total *= 1 + v
        lines.append(f"| {year} | {len(values)} | {pct(total - 1, 1)} |")

    lines += ["", "## Sensitivity (not used for the verdict): evidence window, after spread and swap", "", "| Look-back | Mean per month | Per year | Sharpe ratio |", "|---|---|---|---|"]
    for lookback in [*SENSITIVITY_LOOKBACKS, LOOKBACK_MONTHS]:
        alt, _ = portfolio(lookback)
        d = describe([alt[m]["net"] for m in sorted(alt) if m >= EVIDENCE_FROM])
        lines.append(f"| {lookback} months | {pct(d['mean'])} | {pct(d['annual'], 1)} | {d['sharpe']:.2f} |")

    evidence = summary["Evidence: 2013-01 onward"]
    checks = {
        "mean monthly return after all costs above zero in the evidence window": evidence["mean"] > 0,
        "lower end of the 98.3% interval above zero": evidence["low"] > 0,
        "above zero in the first half (2013-01 to 2019-11)": summary["First half: 2013-01 to 2019-11"]["mean"] > 0,
        "above zero in the second half (2019-12 onward)": summary["Second half: 2019-12 onward"]["mean"] > 0,
    }
    verdict = "worth a forward paper record" if all(checks.values()) else "no evidence of edge"
    lines += ["", "## Verdict (rule fixed in PROTOCOL.md)", "", f"**{verdict}**", ""]
    lines += [f"- {'pass' if ok else 'FAIL'}: {name}" for name, ok in checks.items()]
    OUT_PATH.write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
