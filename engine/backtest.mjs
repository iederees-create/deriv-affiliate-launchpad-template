// Backtest one strategy on historical candles with the exact same simulator used for the public record.
//
//   node engine/backtest.mjs --slug gold-h1-trend --symbol frxXAUUSD --csv xauusd_h1.csv
//   node engine/backtest.mjs --slug forex-breakout-retest --symbol frxEURUSD --deriv 5000   (needs internet)
//
// CSV columns (header row optional): time,open,high,low,close
// time may be epoch seconds, an ISO date, or an MT5 export like 2024.01.02 03:00 (read as UTC).

import fs from "node:fs";
import { fetchCandlesMany } from "./deriv.mjs";
import { advance, newRecord } from "./simulator.mjs";
import { getStrategyDef } from "./strategies.mjs";

export function parseTime(text) {
  const t = text.trim().replace(/^"|"$/g, "");
  if (/^\d{9,11}$/.test(t)) return Number(t);
  const mt5 = t.match(/^(\d{4})\.(\d{2})\.(\d{2})[ T](\d{2}):(\d{2})/);
  if (mt5) return Date.UTC(+mt5[1], +mt5[2] - 1, +mt5[3], +mt5[4], +mt5[5]) / 1000;
  const ms = Date.parse(t.includes("T") || t.includes("Z") ? t : `${t.replace(" ", "T")}Z`);
  if (Number.isNaN(ms)) throw new Error(`Cannot read time: ${text}`);
  return ms / 1000;
}

export function parseCsv(text) {
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const parts = line.split(/[,;\t]/);
    if (parts.length < 5 || /[a-z]/i.test(parts[1] ?? "")) continue; // header or junk
    const [time, o, h, l, c] = parts;
    out.push({ epoch: parseTime(time), open: Number(o), high: Number(h), low: Number(l), close: Number(c) });
  }
  return out.sort((a, b) => a.epoch - b.epoch);
}

export function backtest(strategy, symbol, candles) {
  const rec = newRecord(strategy, new Date(0).toISOString());
  const last = candles[candles.length - 1];
  advance(rec, strategy, symbol, candles, last.epoch + strategy.granularity, { backfill: true });
  return rec;
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith("backtest.mjs");
if (invokedDirectly) {
  const arg = (name) => {
    const i = process.argv.indexOf(`--${name}`);
    return i > -1 ? process.argv[i + 1] : undefined;
  };
  const strategy = getStrategyDef(arg("slug") ?? "");
  const symbol = arg("symbol");
  if (!strategy || !symbol) {
    console.error("Usage: --slug <strategy> --symbol <frxXAUUSD|frxEURUSD|...> (--csv file | --deriv count)");
    process.exit(1);
  }
  let candles;
  if (arg("csv")) candles = parseCsv(fs.readFileSync(arg("csv"), "utf8"));
  else if (arg("deriv")) {
    const map = await fetchCandlesMany([{ symbol, granularity: strategy.granularity, count: Math.min(5000, Number(arg("deriv"))) }]);
    candles = map.get(`${symbol}:${strategy.granularity}`);
  } else {
    console.error("Give --csv <file> or --deriv <count>");
    process.exit(1);
  }
  const rec = backtest(strategy, symbol, candles);
  console.log(`${strategy.name} on ${symbol}: ${candles.length} candles`);
  console.log(JSON.stringify(rec.stats, null, 2));
  console.log(`Skipped: ${JSON.stringify(rec.skipped)}`);
  console.log("Assumed spread:", rec.assumptions.spread);
  console.log("Note: in-sample backtest results are not evidence. Test on data you did not tune on, then forward-test.");
  if (arg("trades")) {
    fs.writeFileSync(arg("trades"), `${["id", "symbol", "side", "entryTime", "entry", "sl", "tp", "exitTime", "exit", "exitReason", "r"].join(",")}\n${rec.trades.map((t) => [t.id, t.symbol, t.side, t.entryTime, t.entry, t.sl, t.tp, t.exitTime, t.exit, t.exitReason, t.r].join(",")).join("\n")}\n`);
    console.log(`Trades written to ${arg("trades")}`);
  }
}
