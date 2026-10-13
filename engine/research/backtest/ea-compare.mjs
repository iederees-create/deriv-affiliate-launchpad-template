import fs from "node:fs";
import { backtest, parseCsv } from "../../backtest.mjs";
import { computeStats } from "../../simulator.mjs";
import { SPREADS, getStrategyDef } from "../../strategies.mjs";
const log = fs.readFileSync(process.argv[2] ?? new URL("../mt5/tester/GoldH1Trend-2025-10-13_2026-10-12.journal.log", import.meta.url), "utf8").split(/\r?\n/);
const toEpoch = (s) => Date.parse(s.replace(/\./g, "-").replace(" ", "T") + "Z") / 1000;
const ea = []; let open = null;
for (const line of log) {
  let m = line.match(/(\d{4}\.\d\d\.\d\d \d\d:\d\d:\d\d)\s+market (buy|sell) [\d.]+ XAUUSD sl: ([\d.]+) tp: ([\d.]+)/);
  if (m && !line.includes("CTrade")) { open = { time: toEpoch(m[1]), side: m[2], sl: +m[3], tp: +m[4] }; continue; }
  m = line.match(/(\d{4}\.\d\d\.\d\d \d\d:\d\d:\d\d)\s+deal #\d+ (buy|sell) [\d.]+ XAUUSD at ([\d.]+) done/);
  if (m && open) {
    if (open.entry == null) { open.entry = +m[3]; }
    else { const dir = open.side === "buy" ? 1 : -1; const risk = Math.abs(open.entry - open.sl);
      ea.push({ ...open, exitTime: toEpoch(m[1]), exit: +m[3], r: dir * (+m[3] - open.entry) / risk, reason: open.reason }); open = null; }
    continue;
  }
  m = line.match(/(stop loss|take profit) triggered/); if (m && open) open.reason = m[1] === "stop loss" ? "sl" : "tp";
}
const from = Date.parse("2025-10-13T00:00:00Z") / 1000, to = Date.parse("2026-10-13T00:00:00Z") / 1000;
SPREADS.frxXAUUSD = 0.17;
const candles = parseCsv(fs.readFileSync(new URL("../data/mt5/XAUUSD_h1.csv", import.meta.url), "utf8"));
const eng = backtest(getStrategyDef("gold-h1-trend"), "frxXAUUSD", candles).trades.filter((t) => t.entryTime >= from && t.entryTime < to);
const hour = (e) => Math.floor(e / 3600);
const byKey = new Map(eng.map((t) => [`${hour(t.entryTime)}:${t.side}`, t]));
let matched = 0, sameOutcome = 0; const diffs = []; const onlyEa = [];
for (const t of ea) { const g = byKey.get(`${hour(t.time)}:${t.side}`);
  if (!g) { onlyEa.push(t); continue; } matched++; byKey.delete(`${hour(t.time)}:${t.side}`);
  if (g.exitReason === t.reason) sameOutcome++; diffs.push({ dEntry: t.entry - g.entry, dR: t.r - g.r, ea: t, eng: g }); }
const iso = (e) => new Date(e * 1000).toISOString().slice(0, 16);
const se = computeStats(ea), sg = computeStats(eng);
console.log(`EA (Strategy Tester, real ticks): trades=${se.trades} winRate=${se.winRate}% expectancy=${se.expectancyR}R totalR=${se.totalR} PF=${se.profitFactor} maxDD=${se.maxDrawdownR}R`);
console.log(`Engine (MT5 H1 candles, spread 0.17, no swap): trades=${sg.trades} winRate=${sg.winRate}% expectancy=${sg.expectancyR}R totalR=${sg.totalR} PF=${sg.profitFactor} maxDD=${sg.maxDrawdownR}R`);
console.log(`matched on entry hour and side: ${matched}; same exit type among matched: ${sameOutcome}; only in EA: ${onlyEa.length}; only in engine: ${byKey.size}`);
const abs = diffs.map((d) => Math.abs(d.dEntry)).sort((a, b) => a - b); const dr = diffs.map((d) => d.dR);
console.log(`matched trades: median |entry price difference| ${abs[Math.floor(abs.length / 2)].toFixed(2)}, max ${abs.at(-1).toFixed(2)}; mean R difference (EA - engine) ${(dr.reduce((a, b) => a + b, 0) / dr.length).toFixed(3)}`);
console.log("only in EA:", onlyEa.map((t) => `${iso(t.time)} ${t.side} r=${t.r.toFixed(2)}`).join("; "));
console.log("only in engine:", [...byKey.values()].map((t) => `${iso(t.entryTime)} ${t.side} r=${t.r}`).join("; "));
console.log("different exit type:", diffs.filter((d) => d.ea.reason !== d.eng.exitReason).map((d) => `${iso(d.ea.time)} EA ${d.ea.reason} ${d.ea.r.toFixed(2)} vs engine ${d.eng.exitReason} ${d.eng.r}`).join("; "));
const slSlip = ea.filter((t) => t.reason === "sl").map((t) => Math.abs(t.exit - t.sl)).sort((a, b) => a - b);
console.log(`EA stop fills: n=${slSlip.length} median slippage beyond stop ${slSlip[Math.floor(slSlip.length / 2)].toFixed(2)}, worst ${slSlip.at(-1).toFixed(2)}`);
