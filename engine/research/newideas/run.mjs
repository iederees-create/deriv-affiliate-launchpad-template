// Staged test of the new ideas (PROTOCOL.md).   node engine/research/newideas/run.mjs --stage IS|VAL|OOS
// Each stage shows trades with entry time up to the end of that stage and nothing later.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { backtest, parseCsv } from "../../backtest.mjs";
import { computeStats } from "../../simulator.mjs";
import { SPREADS } from "../../strategies.mjs";
import { GOLD_REST_OF_DAY, IDEAS, sessionTrade, shiftLeg } from "./ideas.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(HERE, "..", "data");
const stageArg = process.argv[process.argv.indexOf("--stage") + 1];
const STAGE_ORDER = ["IS", "VAL", "OOS"];
if (!STAGE_ORDER.includes(stageArg)) {
  console.error("Usage: --stage IS|VAL|OOS");
  process.exit(1);
}
const epochOf = (date) => Date.parse(`${date}T00:00:00Z`) / 1000;
const SEGMENTS = [
  { key: "IS", label: "in-sample", from: epochOf("2017-01-01"), to: epochOf("2022-11-14") },
  { key: "VAL", label: "validation", from: epochOf("2022-11-14"), to: epochOf("2024-10-29") },
  { key: "OOS", label: "out-of-sample", from: epochOf("2024-10-29"), to: epochOf("2100-01-01") }
].slice(0, STAGE_ORDER.indexOf(stageArg) + 1);
const VISIBLE_UNTIL = SEGMENTS.at(-1).to;
const FILE_NAME = { frxXAUUSD: "XAUUSD", frxEURUSD: "EURUSD", frxGBPUSD: "GBPUSD", frxUSDJPY: "USDJPY" };
const MEASURED_SPREAD = { frxXAUUSD: 0.17, frxEURUSD: 0.00004, frxGBPUSD: 0.00005, frxUSDJPY: 0.005 };
const OLDER_PERIOD = { frxXAUUSD: ["2009-03-16", "2017-01-01"], default: ["2006-01-01", "2017-01-01"] };
const RESAMPLES = 10000;
const INTERVAL = 0.975; // two hypotheses
const RISK_PER_TRADE = 0.01;
const MIN_TRADES = 100;

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
  if (!candleCache.has(key)) candleCache.set(key, parseCsv(fs.readFileSync(path.join(DATA_DIR, source, `${FILE_NAME[symbol]}_h1.csv`), "utf8")));
  return candleCache.get(key);
}

function runLegs(legs, source, spreadMultiple, window) {
  const trades = [];
  for (const l of legs) {
    let candles = loadCandles(source, l.symbol);
    if (window) candles = candles.filter((c) => c.epoch >= window[0] && c.epoch < window[1]);
    const saved = SPREADS[l.symbol];
    SPREADS[l.symbol] = spreadMultiple * MEASURED_SPREAD[l.symbol];
    try {
      const record = backtest(sessionTrade(l), l.symbol, candles);
      for (const t of record.trades) trades.push({ leg: l.slug, entryTime: t.entryTime, exitTime: t.exitTime, exitReason: t.exitReason, r: t.r });
    } finally {
      SPREADS[l.symbol] = saved;
    }
  }
  return trades.sort((a, b) => a.exitTime - b.exitTime);
}

function interval(values, seed) {
  if (values.length < 2) return [null, null];
  const random = mulberry32(seed);
  const means = new Float64Array(RESAMPLES);
  for (let b = 0; b < RESAMPLES; b++) {
    let sum = 0;
    for (let i = 0; i < values.length; i++) sum += values[Math.floor(random() * values.length)];
    means[b] = sum / values.length;
  }
  means.sort();
  const tail = (1 - INTERVAL) / 2;
  return [means[Math.floor(RESAMPLES * tail)], means[Math.floor(RESAMPLES * (1 - tail))]];
}

function summarise(trades) {
  const stats = computeStats(trades);
  const [low, high] = interval(trades.map((t) => t.r), 777);
  const stops = trades.filter((t) => t.exitReason === "sl").length;
  return { ...stats, ciLow: low, ciHigh: high, stopShare: trades.length ? stops / trades.length : null };
}

function monteCarlo(trades, seed) {
  const order = trades.map((t) => t.r);
  const random = mulberry32(seed);
  const worstRuns = new Float64Array(RESAMPLES);
  let alarms = 0;
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
    worstRuns[run] = worst;
    if (worst >= 0.2) alarms++;
  }
  worstRuns.sort();
  return { median: worstRuns[Math.floor(RESAMPLES / 2)], p95: worstRuns[Math.floor(RESAMPLES * 0.95)], chanceOf20: alarms / RESAMPLES };
}

const inSegment = (s) => (t) => t.entryTime >= s.from && t.entryTime < s.to;
const num = (x, dp = 3) => (x == null || !Number.isFinite(x) ? "n/a" : x.toFixed(dp));
const pct = (x) => (x == null ? "n/a" : `${(100 * x).toFixed(1)}%`);
const row = (cells) => `| ${cells.join(" | ")} |`;
const lines = [];
const print = (text = "") => {
  lines.push(text);
  console.log(text);
};
const HEADER = ["Trades", "Win rate", "Avg win R", "Avg loss R", "Expectancy R", "97.5% interval", "Profit factor", "Max drawdown R", "Longest losing streak", "Stopped out"];
const cells = (s) => [s.trades, s.winRate == null ? "n/a" : `${s.winRate}%`, num(s.avgWinR, 2), num(s.avgLossR, 2), num(s.expectancyR), s.ciLow == null ? "n/a" : `${num(s.ciLow)} to ${num(s.ciHigh)}`,
  num(s.profitFactor, 2), num(s.maxDrawdownR, 1), s.longestLosingStreak, pct(s.stopShare)];

const results = { stage: stageArg, ideas: [] };
print(`# New ideas, stage ${stageArg} (trades entered before ${new Date(VISIBLE_UNTIL * 1000).toISOString().slice(0, 10)})`);
print();
print("Measured spread. R = multiples of the 3 x ATR stop distance. See PROTOCOL.md.");
print();
print("## A. Results by segment");
print();
print(row(["Idea", "Unit", "Segment", ...HEADER]));
print(row(new Array(3 + HEADER.length).fill("---")));
const groups = [...IDEAS, GOLD_REST_OF_DAY];
const cache = new Map();
for (const idea of groups) {
  const all = runLegs(idea.legs, "mt5", 1).filter((t) => t.entryTime < VISIBLE_UNTIL);
  const twice = runLegs(idea.legs, "mt5", 2).filter((t) => t.entryTime < VISIBLE_UNTIL);
  cache.set(idea.key, { all, twice });
  const record = { key: idea.key, segments: {}, twice: {}, legs: {}, years: {} };
  const units = idea.legs.length > 1 ? [["pooled", () => true], ...idea.legs.map((l) => [l.slug, (t) => t.leg === l.slug])] : [["single", () => true]];
  for (const [unit, pick] of units) {
    for (const segment of SEGMENTS) {
      const stats = summarise(all.filter(pick).filter(inSegment(segment)));
      if (unit === "pooled" || unit === "single") {
        record.segments[segment.key] = stats;
        record.twice[segment.key] = summarise(twice.filter(inSegment(segment))).expectancyR;
      } else (record.legs[unit] ??= {})[segment.key] = stats;
      print(row([idea.key, unit, segment.label, ...cells(stats)]));
    }
  }
  results.ideas.push(record);
}

print();
print("## B. Expectancy R at 2x measured spread");
print();
print(row(["Idea", ...SEGMENTS.map((s) => s.label)]));
print(row(new Array(1 + SEGMENTS.length).fill("---")));
for (const record of results.ideas) print(row([record.key, ...SEGMENTS.map((s) => num(record.twice[s.key]))]));

print();
print("## C. Per calendar year: trades / expectancy R / total R");
print();
const lastYear = new Date((Math.min(VISIBLE_UNTIL, epochOf("2026-10-14")) - 1) * 1000).getUTCFullYear();
const years = [];
for (let y = 2017; y <= lastYear; y++) years.push(y);
print(row(["Idea", ...years]));
print(row(new Array(1 + years.length).fill("---")));
for (const record of results.ideas) {
  const { all } = cache.get(record.key);
  print(row([record.key, ...years.map((y) => {
    const s = computeStats(all.filter((t) => new Date(t.entryTime * 1000).getUTCFullYear() === y));
    record.years[y] = { trades: s.trades, expectancyR: s.expectancyR, totalR: s.totalR };
    return s.trades ? `${s.trades} / ${num(s.expectancyR, 2)} / ${num(s.totalR, 1)}` : "0";
  })]));
}

print();
print("## D. One-hour shift check on in-sample + validation only");
print();
print(row(["Idea", "One hour earlier (two hours later for 00:00 legs)", "As specified", "One hour later"]));
print(row(["---", "---", "---", "---"]));
const SHIFT_UNTIL = Math.min(VISIBLE_UNTIL, epochOf("2024-10-29"));
results.shift = {};
for (const idea of IDEAS) {
  const out = [-1, 0, 1].map((h) => computeStats(runLegs(idea.legs.map((l) => shiftLeg(l, h)), "mt5", 1).filter((t) => t.entryTime < SHIFT_UNTIL)).expectancyR);
  results.shift[idea.key] = out;
  print(row([idea.key, ...out.map((x) => num(x))]));
}

print();
print("## E. Older period on a different feed (histdata to end of 2016). Context only: its clock is less certain.");
print();
print(row(["Idea", "Unit", "Period", ...HEADER]));
print(row(new Array(3 + HEADER.length).fill("---")));
results.older = {};
for (const idea of groups) {
  const trades = [];
  for (const l of idea.legs) {
    const [from, to] = OLDER_PERIOD[l.symbol] ?? OLDER_PERIOD.default;
    trades.push(...runLegs([l], "histdata", 1, [epochOf(from), epochOf(to)]));
  }
  const stats = summarise(trades.sort((a, b) => a.exitTime - b.exitTime));
  results.older[idea.key] = stats;
  print(row([idea.key, idea.legs.length > 1 ? "pooled" : "single", "to 2016-12", ...cells(stats)]));
}

if (stageArg === "OOS") {
  const oos = SEGMENTS.at(-1);
  print();
  print("## F. Monte Carlo on out-of-sample trades: order shuffled 10,000 times, 1% risked per trade");
  print();
  print(row(["Idea", "Trades", "Median max drawdown", "95th percentile", "Chance of a 20% drawdown"]));
  print(row(["---", "---", "---", "---", "---"]));
  for (const idea of IDEAS) {
    const trades = cache.get(idea.key).all.filter(inSegment(oos));
    const mc = monteCarlo(trades, 2026);
    print(row([idea.key, trades.length, pct(mc.median), pct(mc.p95), pct(mc.chanceOf20)]));
  }
  print();
  print("## G. Verdicts (rule fixed in PROTOCOL.md)");
  print();
  const rest = results.ideas.find((r) => r.key === GOLD_REST_OF_DAY.key);
  results.verdicts = {};
  for (const idea of IDEAS) {
    const r = results.ideas.find((x) => x.key === idea.key);
    const o = r.segments.OOS;
    const shifts = results.shift[idea.key];
    const checks = {
      "at least 100 out-of-sample trades": o.trades >= MIN_TRADES,
      "out-of-sample expectancy above zero": o.expectancyR > 0,
      "still above zero at 2x spread": r.twice.OOS > 0,
      "lower end of the 97.5% interval above zero": o.ciLow > 0,
      "in-sample and validation above zero": r.segments.IS.expectancyR > 0 && r.segments.VAL.expectancyR > 0,
      "positive at both one-hour shifts": shifts[0] > 0 && shifts[2] > 0
    };
    if (idea.key.startsWith("N1")) checks["beats rest-of-day gold in all three segments"] = SEGMENTS.every((s) => r.segments[s.key].expectancyR > rest.segments[s.key].expectancyR);
    const passed = Object.values(checks).every(Boolean);
    const verdict = passed ? "worth a forward paper record and a small demo trial" : o.trades < MIN_TRADES ? "inconclusive" : "no evidence of edge";
    results.verdicts[idea.key] = { checks, verdict };
    print(`**${idea.key}: ${verdict}**`);
    print();
    for (const [name, okay] of Object.entries(checks)) print(`- ${okay ? "pass" : "FAIL"}: ${name}`);
    print();
  }
}

const outDir = path.join(HERE, "out");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `stage-${stageArg}.md`), `${lines.join("\n")}\n`);
fs.writeFileSync(path.join(outDir, `stage-${stageArg}.json`), `${JSON.stringify(results, null, 1)}\n`);
