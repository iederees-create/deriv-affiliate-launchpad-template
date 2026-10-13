import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { adx, atr, bollinger, ema, rsi, sma } from "./indicators.mjs";
import { advance, computeStats, newRecord } from "./simulator.mjs";
import { STRATEGIES, SPREADS } from "./strategies.mjs";
import { fetchCandlesMany, parseCandles } from "./deriv.mjs";
import { runPaper } from "./run-paper.mjs";
import { backtest, parseCsv } from "./backtest.mjs";

const H = 3600;
const EPOCH0 = 1704067200; // 2024-01-01 00:00 UTC (a Monday)

function lcg(seed) {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32;
}

function randomWalk(n, { start = 100, vol = 0.002, seed = 7, epoch0 = EPOCH0 } = {}) {
  const r = lcg(seed);
  const gauss = () => {
    let u = 0;
    for (let k = 0; k < 6; k++) u += r();
    return (u - 3) / Math.sqrt(0.5);
  };
  let price = start;
  const out = [];
  for (let i = 0; i < n; i++) {
    const open = price;
    const close = open * (1 + vol * gauss());
    const range = Math.abs(open * vol * gauss()) * 0.8 + open * vol * 0.3;
    out.push({
      epoch: epoch0 + i * H,
      open,
      high: Math.max(open, close) + range * r(),
      low: Math.min(open, close) - range * r(),
      close
    });
    price = close;
  }
  return out;
}

const c = (i, open, high, low, close) => ({ epoch: EPOCH0 + i * H, open, high, low, close });

function stub(signalAt, sig) {
  return {
    slug: "stub",
    name: "stub",
    rulesVersion: 1,
    symbols: ["frxEURUSD"],
    granularity: H,
    warmup: 1,
    prepare: () => ({}),
    evaluate: (_ind, _candles, i) => (i === signalAt ? { ...sig } : null)
  };
}

function runStub(candles, sig, signalAt = 2) {
  const strategy = stub(signalAt, sig);
  const rec = newRecord(strategy, "2024-01-01T00:00:00Z");
  advance(rec, strategy, "frxEURUSD", candles, candles[candles.length - 1].epoch + H, { backfill: true });
  return rec;
}

describe("indicators", () => {
  it("computes SMA and EMA on known values", () => {
    expect(sma([1, 2, 3, 4, 5], 3).slice(2)).toEqual([2, 3, 4]);
    const e = ema([1, 2, 3, 4, 5], 3);
    expect(e[2]).toBe(2);
    expect(e[3]).toBe(3);
    expect(e[4]).toBe(4);
  });

  it("computes ATR, RSI, Bollinger and ADX sensibly", () => {
    const flat = Array.from({ length: 40 }, (_, i) => c(i, 10, 11, 9, 10));
    expect(atr(flat, 14)[30]).toBeCloseTo(2, 10);
    expect(rsi(Array.from({ length: 30 }, (_, i) => i), 14)[29]).toBe(100);
    const b = bollinger([1, 1, 1, 1, 1], 3, 2);
    expect(b.upper[4]).toBe(1);
    const trend = Array.from({ length: 80 }, (_, i) => c(i, 100 + i, 101 + i, 99.5 + i, 100.8 + i));
    expect(adx(trend, 14)[79]).toBeGreaterThan(40);
  });
});

describe("simulator rules", () => {
  const sig = { side: "buy", slDistance: 0.001, rr: 2, tag: "t" };
  const prefix = [c(0, 1.1, 1.101, 1.099, 1.1), c(1, 1.1, 1.101, 1.099, 1.1), c(2, 1.1, 1.101, 1.099, 1.1)];

  it("enters at the next candle open plus half the spread, and exits at target", () => {
    const rec = runStub([...prefix, c(3, 1.1, 1.101, 1.0995, 1.1005), c(4, 1.1005, 1.103, 1.1, 1.102)], sig);
    expect(rec.trades).toHaveLength(1);
    const t = rec.trades[0];
    expect(t.entryTime).toBe(EPOCH0 + 3 * H);
    expect(t.entry).toBeCloseTo(1.1 + SPREADS.frxEURUSD / 2, 6);
    expect(t.exitReason).toBe("tp");
    expect(t.r).toBeGreaterThan(1.8);
    expect(t.r).toBeLessThan(2);
  });

  it("assumes the stop hits first when stop and target are both touched in one candle", () => {
    const rec = runStub([...prefix, c(3, 1.1, 1.104, 1.098, 1.1)], sig);
    expect(rec.trades[0].exitReason).toBe("sl");
    expect(rec.trades[0].r).toBeLessThan(-1);
  });

  it("fills at the open, not the level, when a candle gaps through the stop", () => {
    const rec = runStub([...prefix, c(3, 1.1, 1.1005, 1.0999, 1.1), c(4, 1.095, 1.096, 1.094, 1.095)], sig);
    const t = rec.trades[0];
    expect(t.exitReason).toBe("sl");
    expect(t.r).toBeLessThan(-4);
  });

  it("skips a trade whose assumed cost is too large for its risk", () => {
    const rec = runStub([...prefix, c(3, 1.1, 1.101, 1.099, 1.1), c(4, 1.1, 1.101, 1.099, 1.1)], { ...sig, slDistance: 0.0002 });
    expect(rec.trades).toHaveLength(0);
    expect(rec.skipped.cost).toBe(1);
  });

  it("does not backfill on the first live run and ignores the still-forming candle", () => {
    const strategy = stub(99, sig);
    const rec = newRecord(strategy, "2024-01-01T00:00:00Z");
    const candles = [c(0, 1, 1, 1, 1), c(1, 1, 1, 1, 1), c(2, 1, 1, 1, 1)];
    const now = EPOCH0 + 2 * H + 10; // candle 2 is still forming
    advance(rec, strategy, "frxEURUSD", candles, now);
    expect(rec.symbols.frxEURUSD.lastProcessed).toBe(EPOCH0 + 1 * H);
    candles.push(c(3, 1, 1, 1, 1));
    expect(advance(rec, strategy, "frxEURUSD", candles, EPOCH0 + 4 * H)).toBe(2);
  });

  it("computes drawdown, profit factor and streaks", () => {
    const s = computeStats([{ r: 1 }, { r: -1 }, { r: -1 }, { r: 2 }, { r: -0.5 }]);
    expect(s.trades).toBe(5);
    expect(s.winRate).toBe(40);
    expect(s.totalR).toBe(0.5);
    expect(s.maxDrawdownR).toBe(2);
    expect(s.longestLosingStreak).toBe(2);
    expect(s.profitFactor).toBeCloseTo(3 / 2.5, 2);
  });
});

describe("strategies", () => {
  it("finds a gold trend entry in a crafted pullback-and-rally", () => {
    const closes = [];
    for (let i = 0; i < 400; i++) closes.push(2000 + i * 0.5);
    for (let i = 0; i < 40; i++) closes.push(closes[closes.length - 1] - 0.4);
    for (let i = 0; i < 40; i++) closes.push(closes[closes.length - 1] + 1.5);
    const candles = closes.map((cl, i) => c(i, i ? closes[i - 1] : cl, cl + 1, cl - 1, cl));
    const s = STRATEGIES.find((x) => x.slug === "gold-h1-trend");
    const ind = s.prepare(candles);
    const sigs = candles.map((_, i) => s.evaluate(ind, candles, i, {})).filter(Boolean);
    expect(sigs.length).toBeGreaterThan(0);
    expect(sigs[0].side).toBe("buy");
    expect(sigs[0].slDistance).toBeGreaterThan(0);
  });

  it("finds a London breakout above a tight Asian range", () => {
    const candles = [];
    for (let d = 0; d < 3; d++) {
      for (let h = 0; h < 24; h++) {
        const i = d * 24 + h;
        let px = 2000 + (h % 2 === 0 ? 0 : 0.8);
        let hi = px + 0.5;
        let lo = px - 0.5;
        if (d === 2 && h === 8) {
          px = 2004;
          hi = 2004.5;
          lo = 2001;
        }
        candles.push({ epoch: EPOCH0 + i * H, open: px, high: hi, low: lo, close: px });
      }
    }
    const s = STRATEGIES.find((x) => x.slug === "gold-london-breakout");
    const ind = s.prepare(candles);
    const idx = 2 * 24 + 8;
    const ctx = {};
    const sig = s.evaluate(ind, candles, idx, ctx);
    expect(sig?.side).toBe("buy");
    expect(sig.slLevel).toBeLessThan(2000);
    expect(sig.timeExitHour).toBe(20);
    expect(s.evaluate(ind, candles, idx + 1, ctx)).toBeNull(); // one trade per day
  });

  it("never peeks ahead: a signal at i is identical when later candles are removed", () => {
    for (const s of STRATEGIES) {
      const candles = randomWalk(1500, { seed: 11 });
      const full = s.prepare(candles);
      for (let i = s.warmup; i < candles.length; i += 3) {
        const trunc = candles.slice(0, i + 1);
        expect(s.evaluate(s.prepare(trunc), trunc, i, {}), `${s.slug} @${i}`).toEqual(s.evaluate(full, candles, i, {}));
      }
    }
  });

  it("finds no free lunch on pure noise and produces sane trades", () => {
    for (const s of STRATEGIES) {
      for (const sym of s.symbols) {
        const start = sym === "frxXAUUSD" ? 2000 : sym === "frxUSDJPY" ? 150 : 1.1;
        const candles = randomWalk(6000, { start, vol: 0.0015, seed: 21 });
        const rec = backtest(s, sym, candles);
        for (const t of rec.trades) {
          expect(Number.isFinite(t.r)).toBe(true);
          expect(t.exitTime).toBeGreaterThanOrEqual(t.entryTime);
          expect(t.entryTime).toBeGreaterThan(t.signalTime);
          expect(["sl", "tp", "time"]).toContain(t.exitReason);
        }
        if (rec.trades.length >= 30) expect(rec.stats.expectancyR, `${s.slug} ${sym}`).toBeLessThan(0.35);
      }
    }
  });
});

describe("Deriv data", () => {
  it("rejects errors and bad candles, and sorts good ones", () => {
    expect(() => parseCandles({ error: { message: "nope" } })).toThrow(/nope/);
    expect(() => parseCandles({ candles: [{ epoch: 1, open: "x", high: 1, low: 1, close: 1 }] })).toThrow();
    const out = parseCandles({ candles: [{ epoch: 2, open: 1, high: 2, low: 0, close: 1 }, { epoch: 1, open: 1, high: 2, low: 0, close: 1 }] });
    expect(out.map((x) => x.epoch)).toEqual([1, 2]);
  });

  it("sends candle requests and collects replies by req_id", async () => {
    const sent = [];
    class FakeWS {
      constructor(url) {
        this.url = url;
        this.l = {};
        FakeWS.url = url;
        queueMicrotask(() => this.emit("open"));
      }
      addEventListener(t, f) {
        (this.l[t] ||= []).push(f);
      }
      emit(t, e = {}) {
        (this.l[t] || []).forEach((f) => f(e));
      }
      send(msg) {
        const req = JSON.parse(msg);
        sent.push(req);
        queueMicrotask(() => this.emit("message", { data: JSON.stringify({ req_id: req.req_id, candles: [{ epoch: 20, open: 1, high: 1, low: 1, close: 1 }, { epoch: 10, open: 1, high: 1, low: 1, close: 1 }] }) }));
      }
      close() {
        this.emit("close");
      }
    }
    const map = await fetchCandlesMany([{ symbol: "frxXAUUSD", granularity: 3600, count: 500 }, { symbol: "frxEURUSD", granularity: 3600 }], { WebSocketImpl: FakeWS });
    expect(FakeWS.url).toContain("app_id=1089");
    expect(sent.map((s) => s.ticks_history)).toEqual(["frxXAUUSD", "frxEURUSD"]);
    expect(sent[0]).toMatchObject({ style: "candles", granularity: 3600, end: "latest" });
    expect(map.get("frxXAUUSD:3600").map((x) => x.epoch)).toEqual([10, 20]);
  });
});

describe("Deriv error isolation", () => {
  it("keeps good symbols when Deriv rejects one of them", async () => {
    class FakeWS {
      constructor() {
        this.l = {};
        queueMicrotask(() => this.emit("open"));
      }
      addEventListener(t, f) {
        (this.l[t] ||= []).push(f);
      }
      emit(t, e = {}) {
        (this.l[t] || []).forEach((f) => f(e));
      }
      send(msg) {
        const req = JSON.parse(msg);
        const body = req.ticks_history === "frxBAD" ? { req_id: req.req_id, error: { message: "Symbol invalid" } } : { req_id: req.req_id, candles: [{ epoch: 1, open: 1, high: 1, low: 1, close: 1 }] };
        queueMicrotask(() => this.emit("message", { data: JSON.stringify(body) }));
      }
      close() {
        this.emit("close");
      }
    }
    const map = await fetchCandlesMany([{ symbol: "frxXAUUSD", granularity: 3600 }, { symbol: "frxBAD", granularity: 3600 }], { WebSocketImpl: FakeWS });
    expect(map.has("frxXAUUSD:3600")).toBe(true);
    expect(map.has("frxBAD:3600")).toBe(false);
    expect(map.failures[0]).toMatch(/frxBAD.*Symbol invalid/);
  });

  it("fails the run loudly when no symbol can be updated", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "paper-"));
    try {
      await expect(runPaper({ dataDir: dir, fetchMany: async () => new Map(), log: () => {} })).rejects.toThrow(/No symbol could be updated/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("paper runner", () => {
  it("starts without backfill, then records forward results and refuses changed rules", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "paper-"));
    try {
      const series = {
        frxXAUUSD: randomWalk(3000, { start: 2000, vol: 0.0015, seed: 3 }),
        frxEURUSD: randomWalk(3000, { start: 1.1, vol: 0.0015, seed: 4 }),
        frxGBPUSD: randomWalk(3000, { start: 1.27, vol: 0.0015, seed: 5 }),
        frxUSDJPY: randomWalk(3000, { start: 150, vol: 0.0015, seed: 6 })
      };
      const fetchUpTo = (n) => async (reqs) => new Map(reqs.map((r) => [`${r.symbol}:${r.granularity}`, series[r.symbol].slice(Math.max(0, n - 500), n)]));
      const at = (n) => new Date((EPOCH0 + n * H) * 1000);
      const quiet = () => {};

      await runPaper({ dataDir: dir, now: at(2000), fetchMany: fetchUpTo(2000), log: quiet });
      const first = JSON.parse(fs.readFileSync(path.join(dir, "paper", "gold-h1-trend.json"), "utf8"));
      expect(first.trades).toHaveLength(0);
      expect(first.symbols.frxXAUUSD.lastProcessed).toBe(EPOCH0 + 1999 * H);

      await runPaper({ dataDir: dir, now: at(2600), fetchMany: fetchUpTo(2600), log: quiet });
      const second = JSON.parse(fs.readFileSync(path.join(dir, "paper", "gold-h1-trend.json"), "utf8"));
      expect(second.symbols.frxXAUUSD.lastProcessed).toBe(EPOCH0 + 2599 * H);
      expect(second.startedAt).toBe(first.startedAt);
      const index = JSON.parse(fs.readFileSync(path.join(dir, "paper", "index.json"), "utf8"));
      expect(index.strategies.map((s) => s.slug)).toEqual(STRATEGIES.map((s) => s.slug));

      const file = path.join(dir, "paper", "gold-h1-trend.json");
      fs.writeFileSync(file, JSON.stringify({ ...second, rulesVersion: 99 }));
      await expect(runPaper({ dataDir: dir, now: at(2601), fetchMany: fetchUpTo(2601), log: quiet })).rejects.toThrow(/rules changed/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("does not mark a strategy as updated when its data failed to load", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "paper-"));
    try {
      const candles = randomWalk(600, { start: 2000, seed: 9 });
      const partial = async () => new Map([["frxXAUUSD:3600", candles]]);
      await runPaper({ dataDir: dir, now: new Date((EPOCH0 + 600 * H) * 1000), fetchMany: partial, log: () => {} });
      const gold = JSON.parse(fs.readFileSync(path.join(dir, "paper", "gold-h1-trend.json"), "utf8"));
      const eur = JSON.parse(fs.readFileSync(path.join(dir, "paper", "forex-breakout-retest.json"), "utf8"));
      expect(gold.lastRunAt).not.toBeNull();
      expect(eur.lastRunAt).toBeNull();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("backtest CSV", () => {
  it("reads MT5-style, ISO and epoch rows and skips headers", () => {
    const text = ["time,open,high,low,close", "2024.01.02 03:00,1,2,0.5,1.5", "2024-01-02T04:00:00Z,1.5,2,1,1.2", "1704171600,1.2,1.3,1.1,1.25"].join("\n");
    const rows = parseCsv(text);
    expect(rows).toHaveLength(3);
    expect(rows[0].epoch).toBe(Date.UTC(2024, 0, 2, 3) / 1000);
    expect(rows[1].epoch).toBe(Date.UTC(2024, 0, 2, 4) / 1000);
    expect(rows[2].close).toBe(1.25);
  });
});
