// Hourly paper-trading run. Usage: node engine/run-paper.mjs --data paper-data
// Reads/writes <data>/paper/<slug>.json for each strategy plus <data>/paper/index.json (a summary).
// The record starts at the first run: nothing is backfilled, so results are forward results.

import fs from "node:fs";
import path from "node:path";
import { fetchCandlesMany } from "./deriv.mjs";
import { advance, newRecord } from "./simulator.mjs";
import { STRATEGIES } from "./strategies.mjs";

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function summarise(rec) {
  const open = Object.entries(rec.symbols)
    .filter(([, s]) => s.open)
    .map(([symbol, s]) => ({ symbol, side: s.open.side, entryTime: s.open.entryTime }));
  return {
    slug: rec.slug,
    name: rec.name,
    startedAt: rec.startedAt,
    lastRunAt: rec.lastRunAt,
    symbols: Object.keys(rec.symbols),
    open,
    stats: rec.stats
  };
}

export async function runPaper({ dataDir, now = new Date(), fetchMany = fetchCandlesMany, log = console.log }) {
  const nowEpoch = Math.floor(now.getTime() / 1000);
  const nowIso = now.toISOString();
  const wanted = new Map();
  for (const s of STRATEGIES) for (const sym of s.symbols) wanted.set(`${sym}:${s.granularity}`, { symbol: sym, granularity: s.granularity, count: 500 });

  let candles;
  try {
    candles = await fetchMany([...wanted.values()]);
  } catch (err) {
    log(`Could not fetch candles: ${err.message}`);
    throw err;
  }

  for (const failure of candles.failures ?? []) log(`::warning::${failure}`);
  const summaries = [];
  let updated = 0;
  let symbolsUpdated = 0;
  for (const strategy of STRATEGIES) {
    const file = path.join(dataDir, "paper", `${strategy.slug}.json`);
    let rec = readJson(file);
    if (!rec) rec = newRecord(strategy, nowIso);
    if (rec.rulesVersion !== strategy.rulesVersion) {
      throw new Error(`${strategy.slug}: rules changed (v${rec.rulesVersion} -> v${strategy.rulesVersion}). Archive the old record before starting a new one.`);
    }
    for (const sym of strategy.symbols) if (!rec.symbols[sym]) rec.symbols[sym] = { lastProcessed: null, pending: null, open: null, ctx: {} };

    let fetchedAll = true;
    for (const sym of strategy.symbols) {
      const data = candles.get(`${sym}:${strategy.granularity}`);
      if (!data) {
        fetchedAll = false;
        log(`${strategy.slug} ${sym}: no data this run`);
        continue;
      }
      symbolsUpdated++;
      const n = advance(rec, strategy, sym, data, nowEpoch);
      log(`${strategy.slug} ${sym}: processed ${n} new candle(s), ${rec.trades.length} trade(s) total`);
    }
    if (fetchedAll) rec.lastRunAt = nowIso;
    writeJson(file, rec);
    summaries.push(summarise(rec));
    updated++;
  }
  writeJson(path.join(dataDir, "paper", "index.json"), { updatedAt: nowIso, strategies: summaries });
  if (symbolsUpdated === 0) throw new Error("No symbol could be updated this run");
  return updated;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (invokedDirectly) {
  const idx = process.argv.indexOf("--data");
  const dataDir = idx > -1 ? process.argv[idx + 1] : "paper-data";
  runPaper({ dataDir }).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
