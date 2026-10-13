#!/usr/bin/env node
// Paginate Deriv public H1 candles. No login/token.
// Writes UTC CSV (time,open,high,low,close) plus a metadata sidecar.
//
//   node engine/research/fetch-h1.mjs
//
// Source: wss://api.derivws.com/trading/v1/options/ws/public
// wss://ws.derivws.com/websockets/v3 HTTP 520s from this host.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, "data");
const WS_URL = process.env.DERIV_PUBLIC_WS_URL || "wss://api.derivws.com/trading/v1/options/ws/public";
const PAGE = Math.min(5000, Number(process.env.PAGE || 5000));
const GRANULARITY = 3600;
const SYMBOLS = (process.env.SYMBOLS || "frxXAUUSD,frxEURUSD,frxGBPUSD,frxUSDJPY").split(",");
const MAX_PAGES = Number(process.env.MAX_PAGES || 40);
const SLEEP_MS = Number(process.env.SLEEP_MS || 250);

const iso = (epoch) => new Date(epoch * 1000).toISOString().replace(".000Z", "Z");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function openSocket() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error(`connect timeout ${WS_URL}`));
    }, 20000);
    ws.addEventListener("open", () => {
      clearTimeout(timer);
      resolve(ws);
    });
    ws.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error(`socket error ${WS_URL}`));
    });
  });
}

function request(ws, payload, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const reqId = Math.floor(Math.random() * 1e9);
    const timer = setTimeout(() => {
      ws.removeEventListener("message", onMessage);
      reject(new Error(`timeout req ${payload.ticks_history || payload.active_symbols || "msg"}`));
    }, timeoutMs);
    const onMessage = (ev) => {
      let body;
      try {
        body = JSON.parse(typeof ev.data === "string" ? ev.data : String(ev.data));
      } catch {
        return;
      }
      if (Number(body.req_id) !== reqId) return;
      clearTimeout(timer);
      ws.removeEventListener("message", onMessage);
      if (body.error) reject(new Error(body.error.message || JSON.stringify(body.error)));
      else resolve(body);
    };
    ws.addEventListener("message", onMessage);
    ws.send(JSON.stringify({ ...payload, req_id: reqId }));
  });
}

async function fetchAll(ws, symbol) {
  const byEpoch = new Map();
  let end = "latest";
  const pages = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    let body;
    let lastErr;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        body = await request(ws, {
          ticks_history: symbol,
          adjust_start_time: 1,
          count: PAGE,
          end,
          style: "candles",
          granularity: GRANULARITY
        });
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        await sleep(400 * (attempt + 1));
      }
    }
    if (lastErr) throw lastErr;
    const candles = Array.isArray(body.candles) ? body.candles : [];
    const parsed = candles
      .map((c) => ({
        epoch: Number(c.epoch),
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close)
      }))
      .filter((c) => [c.epoch, c.open, c.high, c.low, c.close].every(Number.isFinite));
    parsed.forEach((c) => byEpoch.set(c.epoch, c));
    pages.push({
      page,
      end,
      n: parsed.length,
      first: parsed[0] ? iso(parsed[0].epoch) : null,
      last: parsed.length ? iso(parsed[parsed.length - 1].epoch) : null
    });
    process.stderr.write(
      `${symbol} page ${page + 1}: ${parsed.length} bars  unique=${byEpoch.size}  end=${end}\n`
    );
    if (!parsed.length) break;
    const oldest = Math.min(...parsed.map((c) => c.epoch));
    if (parsed.length < 50) break;
    const nextEnd = oldest - 1;
    if (end !== "latest" && nextEnd >= Number(end)) break;
    end = nextEnd;
    await sleep(SLEEP_MS);
  }
  const rows = [...byEpoch.values()].sort((a, b) => a.epoch - b.epoch);
  return { rows, pages };
}

function gapReport(rows) {
  const gaps = [];
  let weekendGaps = 0;
  let otherGaps = 0;
  for (let i = 1; i < rows.length; i++) {
    const dt = rows[i].epoch - rows[i - 1].epoch;
    if (dt === GRANULARITY) continue;
    const hours = dt / GRANULARITY;
    const start = new Date(rows[i - 1].epoch * 1000);
    const looksWeekend = hours >= 40 && hours <= 56 && start.getUTCDay() === 5;
    if (looksWeekend) weekendGaps++;
    else {
      otherGaps++;
      if (gaps.length < 80) {
        gaps.push({
          after: iso(rows[i - 1].epoch),
          next: iso(rows[i].epoch),
          hours: Math.round(hours * 100) / 100
        });
      }
    }
  }
  return { weekendGaps, otherGaps, sampleNonWeekendGaps: gaps };
}

fs.mkdirSync(OUT, { recursive: true });
const ws = await openSocket();
process.stderr.write(`connected ${WS_URL}\n`);

const index = {
  fetchedAt: new Date().toISOString(),
  source: {
    kind: "Deriv public ticks_history candles",
    endpoint: WS_URL,
    note: "No login or trade token. wss://ws.derivws.com/websockets/v3 returned HTTP 520 from this host; this public options socket answered.",
    style: "candles",
    granularitySeconds: GRANULARITY,
    timezone: "UTC (epoch seconds converted with Date.toISOString)",
    pageSize: PAGE
  },
  symbols: {}
};

for (const symbol of SYMBOLS) {
  const { rows, pages } = await fetchAll(ws, symbol);
  if (!rows.length) {
    index.symbols[symbol] = { error: "no candles" };
    continue;
  }
  const csvPath = path.join(OUT, `${symbol}_h1.csv`);
  const lines = ["time,open,high,low,close", ...rows.map((c) => `${iso(c.epoch)},${c.open},${c.high},${c.low},${c.close}`)];
  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`);
  const gaps = gapReport(rows);
  const meta = {
    symbol,
    csv: path.basename(csvPath),
    bars: rows.length,
    first: iso(rows[0].epoch),
    last: iso(rows[rows.length - 1].epoch),
    firstEpoch: rows[0].epoch,
    lastEpoch: rows[rows.length - 1].epoch,
    timezone: "UTC",
    source: WS_URL,
    pages,
    gaps
  };
  fs.writeFileSync(path.join(OUT, `${symbol}_h1.meta.json`), `${JSON.stringify(meta, null, 2)}\n`);
  index.symbols[symbol] = meta;
  process.stderr.write(`wrote ${csvPath}  ${rows.length} bars  ${meta.first} -> ${meta.last}\n`);
}

try {
  ws.close();
} catch {
  // ignore
}

fs.writeFileSync(path.join(OUT, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
console.log(JSON.stringify({ out: OUT, symbols: Object.fromEntries(Object.entries(index.symbols).map(([k, v]) => [k, { bars: v.bars, first: v.first, last: v.last, otherGaps: v.gaps?.otherGaps, weekendGaps: v.gaps?.weekendGaps }])) }, null, 2));
