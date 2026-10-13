// Research backtest harness (see PROTOCOL.md). Calls the unmodified engine; never edits engine defaults on disk.
//
//   node engine/research/backtest/run.mjs            in-sample, validation, older period, sensitivity
//   node engine/research/backtest/run.mjs --oos      everything above plus out-of-sample, Monte Carlo, verdicts
//
// Writes out/results.json or out/results-oos.json and prints Markdown tables.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { backtest, parseCsv } from "../../backtest.mjs";
import { computeStats } from "../../simulator.mjs";
import { SPREADS, STRATEGIES } from "../../strategies.mjs";
import { makeVariant, SENSITIVITY, swapNights } from "./variants.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(HERE, "..", "data");
const OUT_DIR = path.join(HERE, "out");
const INCLUDE_OOS = process.argv.includes("--oos");

const FILE_NAME = { frxXAUUSD: "XAUUSD", frxEURUSD: "EURUSD", frxGBPUSD: "GBPUSD", frxUSDJPY: "USDJPY" };
const MEASURED_SPREAD = { frxXAUUSD: 0.17, frxEURUSD: 0.00004, frxGBPUSD: 0.00005, frxUSDJPY: 0.005 };
const DEFAULT_SPREAD = { ...SPREADS };
// Price units per night, Deriv MT5 on 2026-10-13 (COSTS.md). Negative is a charge.
const SWAP_PER_NIGHT = {
  frxXAUUSD: { buy: -0.45, sell: 0.2 },
  frxEURUSD: { buy: -0.0001142, sell: 0.0000266 },
  frxGBPUSD: { buy: -0.0000543, sell: -0.0000413 },
  frxUSDJPY: { buy: 0.00995, sell: -0.02198 }
};
const SCENARIOS = [
  { key: "1x", spread: (sym) => MEASURED_SPREAD[sym] },
  { key: "1.5x", spread: (sym) => 1.5 * MEASURED_SPREAD[sym] },
  { key: "2x", spread: (sym) => 2 * MEASURED_SPREAD[sym] },
  { key: "default", spread: (sym) => DEFAULT_SPREAD[sym] }
];
const HEADLINE = "1x";
const epochOf = (date) => Date.parse(`${date}T00:00:00Z`) / 1000;
const SEGMENTS = [
  { key: "IS", label: "in-sample", from: epochOf("2017-01-01"), to: epochOf("2022-11-14") },
  { key: "VAL", label: "validation", from: epochOf("2022-11-14"), to: epochOf("2024-10-29") },
  { key: "OOS", label: "out-of-sample", from: epochOf("2024-10-29"), to: Infinity }
].filter((s) => INCLUDE_OOS || s.key !== "OOS");
const VISIBLE_UNTIL = INCLUDE_OOS ? Infinity : epochOf("2024-10-29");
const OLDER_PERIOD = { frxXAUUSD: ["2009-03-16", "2017-01-01"], default: ["2006-01-01", "2017-01-01"] };
const MIN_TRADES = 100;
const RESAMPLES = 10000;
const RISK_PER_TRADE = 0.01;
const DRAWDOWN_ALARM = 0.2;
const MIN_POSITIVE_VARIANTS = 0.7;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const candleCache = new Map();
function loadCandles(source, symbol) {
  const key = `${source}/${symbol}`;
  if (!candleCache.has(key)) {
    const file = path.join(DATA_DIR, source, `${FILE_NAME[symbol]}_h1.csv`);
    candleCache.set(key, parseCsv(fs.readFileSync(file, "utf8")));
  }
  return candleCache.get(key);
}

// Runs the unmodified simulator with one spread, then adds swap to each trade.
function runTrades(strategy, symbol, candles, spread) {
  const saved = SPREADS[symbol];
  SPREADS[symbol] = spread;
  let record;
  try {
    record = backtest(strategy, symbol, candles);
  } finally {
    SPREADS[symbol] = saved;
  }
  const trades = record.trades.map((t) => {
    const risk = Math.abs(t.entry - t.sl);
    const nights = swapNights(t.entryTime, t.exitTime);
    const swapR = (nights * SWAP_PER_NIGHT[symbol][t.side]) / risk;
    return { symbol, side: t.side, entryTime: t.entryTime, exitTime: t.exitTime, exitReason: t.exitReason, nights, rNoSwap: t.r, r: t.r + swapR };
  });
  return { trades, skipped: record.skipped };
}

function bootstrapInterval(values, seed) {
  if (values.length < 2) return [null, null];
  const random = mulberry32(seed);
  const means = new Float64Array(RESAMPLES);
  for (let b = 0; b < RESAMPLES; b++) {
    let sum = 0;
    for (let i = 0; i < values.length; i++) sum += values[Math.floor(random() * values.length)];
    means[b] = sum / values.length;
  }
  means.sort();
  return [means[Math.floor(RESAMPLES * 0.025)], means[Math.floor(RESAMPLES * 0.975)]];
}

function summarise(trades, { useSwap = true, interval = false } = {}) {
  const ordered = [...trades].sort((a, b) => a.exitTime - b.exitTime);
  const rs = ordered.map((t) => (useSwap ? t.r : t.rNoSwap));
  const stats = computeStats(rs.map((r) => ({ r })));
  const [low, high] = interval ? bootstrapInterval(rs, 12345) : [null, null];
  return { ...stats, ciLow: low, ciHigh: high };
}

function monteCarlo(trades, seed) {
  const rs = trades.map((t) => t.r);
  if (rs.length < 2) return null;
  const random = mulberry32(seed);
  const drawdowns = new Float64Array(RESAMPLES);
  let alarms = 0;
  const order = rs.slice();
  for (let run = 0; run < RESAMPLES; run++) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let equity = 1;
    let peak = 1;
    let worst = 0;
    for (const r of order) {
      equity *= 1 + RISK_PER_TRADE * r;
      if (equity > peak) peak = equity;
      worst = Math.max(worst, 1 - equity / peak);
    }
    drawdowns[run] = worst;
    if (worst >= DRAWDOWN_ALARM) alarms++;
  }
  drawdowns.sort();
  const at = (q) => drawdowns[Math.floor(RESAMPLES * q)];
  let equity = 1;
  for (const r of rs) equity *= 1 + RISK_PER_TRADE * r;
  return { trades: rs.length, ddP5: at(0.05), ddMedian: at(0.5), ddP95: at(0.95), chanceOf20: alarms / RESAMPLES, endEquity: equity };
}

const inSegment = (segment) => (t) => t.entryTime >= segment.from && t.entryTime < segment.to;
const num = (x, dp = 2) => (x == null || !Number.isFinite(x) ? "n/a" : x.toFixed(dp));
const pct = (x) => (x == null ? "n/a" : `${(100 * x).toFixed(1)}%`);
const row = (cells) => `| ${cells.join(" | ")} |`;
const lines = [];
const print = (text = "") => {
  lines.push(text);
  console.log(text);
};

function statsCells(s) {
  return [s.trades, s.winRate == null ? "n/a" : `${s.winRate}%`, num(s.avgWinR), num(s.avgLossR), num(s.expectancyR, 3),
    s.ciLow == null ? "n/a" : `${num(s.ciLow, 3)} to ${num(s.ciHigh, 3)}`, num(s.profitFactor), num(s.maxDrawdownR, 1), s.longestLosingStreak];
}
const STATS_HEADER = ["Trades", "Win rate", "Avg win R", "Avg loss R", "Expectancy R", "95% interval", "Profit factor", "Max drawdown R", "Longest losing streak"];

// ---- main runs on the MT5 data -------------------------------------------------------------------------
const results = { generatedFor: INCLUDE_OOS ? "IS+VAL+OOS" : "IS+VAL only", units: [] };
const units = []; // { slug, symbol | "pooled", byScenario: { key: trades[] } }

for (const strategy of STRATEGIES) {
  const pooled = { slug: strategy.slug, symbol: "pooled", byScenario: {} };
  for (const symbol of strategy.symbols) {
    const candles = loadCandles("mt5", symbol);
    const unit = { slug: strategy.slug, symbol, byScenario: {}, skipped: {} };
    for (const scenario of SCENARIOS) {
      const { trades, skipped } = runTrades(strategy, symbol, candles, scenario.spread(symbol));
      unit.byScenario[scenario.key] = trades.filter((t) => t.entryTime < VISIBLE_UNTIL);
      unit.skipped[scenario.key] = skipped;
      pooled.byScenario[scenario.key] = [...(pooled.byScenario[scenario.key] ?? []), ...unit.byScenario[scenario.key]];
    }
    units.push(unit);
  }
  if (strategy.symbols.length > 1) units.push(pooled);
}

print(`# Backtest results (${results.generatedFor})`);
print();
print("Deriv MT5 H1 data. Costs: measured spread plus swap unless a column says otherwise. R = multiples of the risk on each trade.");
print(INCLUDE_OOS ? "Out-of-sample rows are the only evidence. In-sample and validation rows are context." : "This run does not compute or show out-of-sample trades.");
print();
print("## A. Results by segment (measured spread + swap)");
print();
print(row(["Strategy", "Symbol", "Segment", ...STATS_HEADER]));
print(row(new Array(3 + STATS_HEADER.length).fill("---")));
for (const unit of units) {
  const record = { slug: unit.slug, symbol: unit.symbol, segments: {}, scenarios: {}, years: {} };
  for (const segment of SEGMENTS) {
    const stats = summarise(unit.byScenario[HEADLINE].filter(inSegment(segment)), { interval: true });
    record.segments[segment.key] = stats;
    print(row([unit.slug, unit.symbol, segment.label, ...statsCells(stats)]));
  }
  results.units.push(record);
}

print();
print("## B. Expectancy (R) under each cost scenario");
print();
print(row(["Strategy", "Symbol", "Segment", "1x, no swap", "1x + swap", "1.5x + swap", "2x + swap", "Engine default spread + swap", "Avg nights held"]));
print(row(new Array(9).fill("---")));
for (const unit of units) {
  const record = results.units.find((u) => u.slug === unit.slug && u.symbol === unit.symbol);
  for (const segment of SEGMENTS) {
    const pick = (key, useSwap) => summarise(unit.byScenario[key].filter(inSegment(segment)), { useSwap }).expectancyR;
    const base = unit.byScenario[HEADLINE].filter(inSegment(segment));
    const nights = base.length ? base.reduce((a, t) => a + t.nights, 0) / base.length : null;
    const cells = { "1x-noswap": pick("1x", false), "1x": pick("1x", true), "1.5x": pick("1.5x", true), "2x": pick("2x", true), default: pick("default", true) };
    record.scenarios[segment.key] = { ...cells, avgNights: nights };
    print(row([unit.slug, unit.symbol, segment.label, num(cells["1x-noswap"], 3), num(cells["1x"], 3), num(cells["1.5x"], 3), num(cells["2x"], 3), num(cells.default, 3), num(nights, 2)]));
  }
}

print();
print("## C. Results per calendar year (measured spread + swap): trades / expectancy R / total R");
print();
const lastYear = INCLUDE_OOS ? 2026 : 2024;
const years = [];
for (let y = 2017; y <= lastYear; y++) years.push(y);
const segmentOfYear = (y) => (y < 2022 ? "IS" : y === 2022 ? "IS*" : y === 2023 ? "VAL" : y === 2024 ? "VAL*" : "OOS");
print(row(["Strategy", "Symbol", ...years.map((y) => `${y} (${segmentOfYear(y)})`)]));
print(row(new Array(2 + years.length).fill("---")));
for (const unit of units) {
  const record = results.units.find((u) => u.slug === unit.slug && u.symbol === unit.symbol);
  const cells = years.map((y) => {
    const s = summarise(unit.byScenario[HEADLINE].filter((t) => new Date(t.entryTime * 1000).getUTCFullYear() === y));
    record.years[y] = { trades: s.trades, expectancyR: s.expectancyR, totalR: s.totalR };
    return s.trades ? `${s.trades} / ${num(s.expectancyR, 2)} / ${num(s.totalR, 1)}` : "0";
  });
  print(row([unit.slug, unit.symbol, ...cells]));
}
print();
print("`*` 2022 is in-sample until 13 November and validation after; 2024 is validation until 28 October" + (INCLUDE_OOS ? " and out-of-sample after." : ". Trades after that date are not shown in this run."));

// ---- older period on histdata --------------------------------------------------------------------------
print();
print("## D. Older period on a different feed (histdata, to end of 2016; measured spread + swap). Context only.");
print();
print(row(["Strategy", "Symbol", "Period", ...STATS_HEADER]));
print(row(new Array(3 + STATS_HEADER.length).fill("---")));
results.older = [];
for (const strategy of STRATEGIES) {
  const pooledTrades = [];
  for (const symbol of strategy.symbols) {
    const [from, to] = OLDER_PERIOD[symbol] ?? OLDER_PERIOD.default;
    const candles = loadCandles("histdata", symbol).filter((c) => c.epoch >= epochOf(from) && c.epoch < epochOf(to));
    const { trades } = runTrades(strategy, symbol, candles, MEASURED_SPREAD[symbol]);
    pooledTrades.push(...trades);
    const stats = summarise(trades, { interval: true });
    results.older.push({ slug: strategy.slug, symbol, from, to, stats });
    print(row([strategy.slug, symbol, `${from.slice(0, 7)} to 2016-12`, ...statsCells(stats)]));
  }
  if (strategy.symbols.length > 1) {
    const stats = summarise(pooledTrades, { interval: true });
    results.older.push({ slug: strategy.slug, symbol: "pooled", stats });
    print(row([strategy.slug, "pooled", "2006-01 to 2016-12", ...statsCells(stats)]));
  }
}

// ---- sensitivity on IS + VAL ---------------------------------------------------------------------------
print();
print("## E. Parameter sensitivity on in-sample + validation (measured spread + swap). Never uses out-of-sample trades.");
print();
const SENSITIVITY_UNTIL = epochOf("2024-10-29");
results.sensitivity = {};
for (const strategy of STRATEGIES) {
  const variants = [{}, ...SENSITIVITY[strategy.slug]];
  const rowsOut = [];
  for (const overrides of variants) {
    const variant = makeVariant(strategy.slug, overrides);
    const trades = [];
    for (const symbol of strategy.symbols) {
      const run = runTrades(variant, symbol, loadCandles("mt5", symbol), MEASURED_SPREAD[symbol]);
      trades.push(...run.trades.filter((t) => t.entryTime < SENSITIVITY_UNTIL));
    }
    const stats = summarise(trades);
    const label = Object.keys(overrides).length ? Object.entries(overrides).map(([k, v]) => `${k}=${v}`).join(", ") : "frozen rules";
    rowsOut.push({ label, trades: stats.trades, expectancyR: stats.expectancyR, profitFactor: stats.profitFactor, totalR: stats.totalR });
  }
  const neighbours = rowsOut.slice(1);
  const positive = neighbours.filter((r) => r.expectancyR > 0).length;
  results.sensitivity[strategy.slug] = { rows: rowsOut, positiveShare: positive / neighbours.length };
  print(`### ${strategy.slug}${strategy.symbols.length > 1 ? " (three pairs pooled)" : ""}: ${positive} of ${neighbours.length} neighbouring settings positive`);
  print();
  print(row(["Setting", "Trades", "Expectancy R", "Profit factor", "Total R"]));
  print(row(["---", "---", "---", "---", "---"]));
  for (const r of rowsOut) print(row([r.label, r.trades, num(r.expectancyR, 3), num(r.profitFactor), num(r.totalR, 1)]));
  print();
}

// ---- out-of-sample only: Monte Carlo and verdicts ------------------------------------------------------
if (INCLUDE_OOS) {
  const oos = SEGMENTS.find((s) => s.key === "OOS");
  print("## F. Monte Carlo: trade order shuffled 10,000 times, 1% of equity risked per trade (measured spread + swap)");
  print();
  print(row(["Strategy", "Symbol", "Trades used", "Trades", "Max drawdown 5th pct", "Median", "95th pct", "Chance of a 20% drawdown", "End equity (start = 1)"]));
  print(row(new Array(9).fill("---")));
  results.monteCarlo = [];
  for (const unit of units) {
    const sets = [["out-of-sample", unit.byScenario[HEADLINE].filter(inSegment(oos))], ["all 2017-2026", unit.byScenario[HEADLINE]]];
    for (const [label, trades] of sets) {
      const mc = monteCarlo(trades, 2026);
      results.monteCarlo.push({ slug: unit.slug, symbol: unit.symbol, set: label, ...mc });
      if (!mc) continue;
      print(row([unit.slug, unit.symbol, label, mc.trades, pct(mc.ddP5), pct(mc.ddMedian), pct(mc.ddP95), pct(mc.chanceOf20), num(mc.endEquity)]));
    }
  }
  print();
  print("## G. Verdicts (rule fixed in PROTOCOL.md)");
  print();
  print(row(["Strategy", "Symbol", "OOS trades", "OOS expectancy R (measured spread + swap)", "OOS 95% interval", "OOS at 2x spread + swap", "OOS profit factor", "OOS max drawdown R", "IS / VAL expectancy R", "Positive neighbours", "Verdict"]));
  print(row(new Array(11).fill("---")));
  results.verdicts = [];
  for (const unit of units) {
    const record = results.units.find((u) => u.slug === unit.slug && u.symbol === unit.symbol);
    const o = record.segments.OOS;
    const at2x = record.scenarios.OOS["2x"];
    const share = results.sensitivity[unit.slug].positiveShare;
    const robust = o.expectancyR > 0 && at2x > 0 && o.ciLow > 0 && record.segments.IS.expectancyR > 0 && record.segments.VAL.expectancyR > 0 && share >= MIN_POSITIVE_VARIANTS;
    let verdict = "no evidence of edge";
    if (o.trades < MIN_TRADES) verdict = "inconclusive";
    else if (robust) verdict = "worth a small live trial";
    else if (o.expectancyR > 0 && !(o.ciLow > 0)) verdict = "inconclusive";
    results.verdicts.push({ slug: unit.slug, symbol: unit.symbol, verdict });
    print(row([unit.slug, unit.symbol, o.trades, num(o.expectancyR, 3), `${num(o.ciLow, 3)} to ${num(o.ciHigh, 3)}`, num(at2x, 3), num(o.profitFactor), num(o.maxDrawdownR, 1),
      `${num(record.segments.IS.expectancyR, 3)} / ${num(record.segments.VAL.expectancyR, 3)}`, pct(share), verdict]));
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const stem = INCLUDE_OOS ? "results-oos" : "results";
fs.writeFileSync(path.join(OUT_DIR, `${stem}.json`), `${JSON.stringify(results, null, 1)}\n`);
fs.writeFileSync(path.join(OUT_DIR, `${stem}.md`), `${lines.join("\n")}\n`);
