// Step 5 substitute: the paper record has no trades, so compare what the engine does on the paper feed
// (Deriv API candles) with what it does on MT5 candles over the same 12 months.
import fs from "node:fs";
import { backtest, parseCsv } from "../../backtest.mjs";
import { computeStats } from "../../simulator.mjs";
import { SPREADS, STRATEGIES } from "../../strategies.mjs";
const D = new URL("../data/", import.meta.url).pathname;
const NAME = { frxXAUUSD: "XAUUSD", frxEURUSD: "EURUSD", frxGBPUSD: "GBPUSD", frxUSDJPY: "USDJPY" };
const MEASURED = { frxXAUUSD: 0.17, frxEURUSD: 0.00004, frxGBPUSD: 0.00005, frxUSDJPY: 0.005 };
Object.assign(SPREADS, MEASURED);
console.log("| Strategy | Symbol | API-feed trades | MT5-feed trades | Same entry hour and side | API expectancy R | MT5 expectancy R | API total R | MT5 total R |");
console.log("|---|---|---|---|---|---|---|---|---|");
for (const st of STRATEGIES) for (const sym of st.symbols) {
  const api = parseCsv(fs.readFileSync(`${D}frx${NAME[sym]}_h1_hour.csv`, "utf8")).slice(0, -1);
  const from = api[0].epoch, to = api.at(-1).epoch;
  const mt5 = parseCsv(fs.readFileSync(`${D}mt5/${NAME[sym]}_h1.csv`, "utf8")).filter((c) => c.epoch >= from && c.epoch <= to);
  const a = backtest(st, sym, api), m = backtest(st, sym, mt5);
  const key = (t) => `${t.entryTime}:${t.side}`;
  const mk = new Set(m.trades.map(key));
  const same = a.trades.filter((t) => mk.has(key(t))).length;
  const sa = computeStats(a.trades), sm = computeStats(m.trades);
  console.log(`| ${st.slug} | ${NAME[sym]} | ${sa.trades} | ${sm.trades} | ${same} | ${sa.expectancyR} | ${sm.expectancyR} | ${sa.totalR} | ${sm.totalR} |`);
}
