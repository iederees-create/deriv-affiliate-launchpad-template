// Parameterised copies of the four frozen strategies, for sensitivity checks only.
// With no overrides each one must produce exactly the trades of engine/strategies.mjs (see variants.test.mjs).
// Variants are never candidates for trading: a rule change needs a rulesVersion bump in the engine.

import { adx, atr, bollinger, ema, priorHigh, priorLow, rsi } from "../../indicators.mjs";
import { getStrategyDef, utcDay, utcHour } from "../../strategies.mjs";

const closes = (candles) => candles.map((c) => c.close);
const ok = (...values) => values.every((v) => Number.isFinite(v));
const HOUR = 3600;
const DAY = 86400;

export const DEFAULTS = {
  "gold-h1-trend": { fast: 20, slow: 50, trend: 200, atrMult: 2, rr: 2 },
  "gold-london-breakout": { firstHour: 7, lastHour: 10, rangeEndHour: 6, minWidth: 0.5, maxWidth: 3, rr: 1.5, exitHour: 20, londonClock: false },
  "forex-breakout-retest": { lookback: 20, trend: 100, tolerance: 0.25, buffer: 0.5, rr: 2 },
  "forex-rsi-bollinger-reversion": { period: 20, width: 2, rsiLow: 30, adxMax: 20, atrMult: 1.5 }
};

// Last Sunday of a month at 01:00 UTC, when UK clocks change.
function lastSundayOneUtc(year, monthIndex) {
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));
  return Date.UTC(year, monthIndex, lastDay.getUTCDate() - lastDay.getUTCDay(), 1) / 1000;
}

export function isBritishSummerTime(epoch) {
  const year = new Date(epoch * 1000).getUTCFullYear();
  return epoch >= lastSundayOneUtc(year, 2) && epoch < lastSundayOneUtc(year, 9);
}

const BUILDERS = {
  "gold-h1-trend": (p) => ({
    prepare(candles) {
      const c = closes(candles);
      return { fast: ema(c, p.fast), slow: ema(c, p.slow), trend: ema(c, p.trend), atr: atr(candles, 14) };
    },
    evaluate(ind, candles, i) {
      if (i < 1) return null;
      const { fast, slow, trend } = ind;
      if (!ok(fast[i], fast[i - 1], slow[i], slow[i - 1], trend[i], ind.atr[i])) return null;
      const close = candles[i].close;
      if (fast[i - 1] <= slow[i - 1] && fast[i] > slow[i] && close > trend[i]) {
        return { side: "buy", slDistance: p.atrMult * ind.atr[i], rr: p.rr, tag: "ema-cross-up" };
      }
      if (fast[i - 1] >= slow[i - 1] && fast[i] < slow[i] && close < trend[i]) {
        return { side: "sell", slDistance: p.atrMult * ind.atr[i], rr: p.rr, tag: "ema-cross-down" };
      }
      return null;
    }
  }),
  "gold-london-breakout": (p) => ({
    prepare(candles) {
      return { atr: atr(candles, 14) };
    },
    evaluate(ind, candles, i, ctx) {
      const c = candles[i];
      // londonClock keeps the summer hours as they are and moves everything one hour later in UK winter time,
      // so the range always ends at the London open.
      const shift = p.londonClock && !isBritishSummerTime(c.epoch) ? 1 : 0;
      const hour = utcHour(c.epoch);
      if (hour < p.firstHour + shift || hour > p.lastHour + shift) return null;
      const day = utcDay(c.epoch);
      if (ctx.lastTradeDay === day) return null;
      let hi = -Infinity;
      let lo = Infinity;
      let count = 0;
      for (let j = i - 1; j >= 0 && utcDay(candles[j].epoch) === day; j--) {
        if (utcHour(candles[j].epoch) <= p.rangeEndHour + shift) {
          hi = Math.max(hi, candles[j].high);
          lo = Math.min(lo, candles[j].low);
          count++;
        }
      }
      const a = ind.atr[i];
      if (count < 5 || !ok(a) || a <= 0) return null;
      const width = hi - lo;
      if (width < p.minWidth * a || width > p.maxWidth * a) return null;
      if (c.close > hi) {
        ctx.lastTradeDay = day;
        return { side: "buy", slLevel: lo, rr: p.rr, timeExitHour: p.exitHour, tag: "asian-high-break" };
      }
      if (c.close < lo) {
        ctx.lastTradeDay = day;
        return { side: "sell", slLevel: hi, rr: p.rr, timeExitHour: p.exitHour, tag: "asian-low-break" };
      }
      return null;
    }
  }),
  "forex-breakout-retest": (p) => ({
    prepare(candles) {
      return { hh: priorHigh(candles, p.lookback), ll: priorLow(candles, p.lookback), trend: ema(closes(candles), p.trend), atr: atr(candles, 14) };
    },
    evaluate(ind, candles, i, ctx) {
      const a = ind.atr[i];
      if (!ok(a, ind.trend[i]) || a <= 0) return null;
      const c = candles[i];
      const lastUsed = ctx.lastBreakoutTime ?? 0;
      for (let b = i - 1; b >= Math.max(i - 5, 1); b--) {
        if (candles[b].epoch <= lastUsed) break;
        const upBreak = ok(ind.hh[b]) && candles[b].close > ind.hh[b];
        const downBreak = ok(ind.ll[b]) && candles[b].close < ind.ll[b];
        if (!upBreak && !downBreak) continue;
        if (upBreak) {
          const level = ind.hh[b];
          let failed = false;
          for (let j = b + 1; j < i; j++) if (candles[j].close < level) failed = true;
          if (failed) return null;
          if (c.low <= level + p.tolerance * a && c.close > level && c.close > ind.trend[i]) {
            ctx.lastBreakoutTime = candles[b].epoch;
            return { side: "buy", slLevel: Math.min(c.low, level) - p.buffer * a, rr: p.rr, tag: "retest-hold-up" };
          }
        } else {
          const level = ind.ll[b];
          let failed = false;
          for (let j = b + 1; j < i; j++) if (candles[j].close > level) failed = true;
          if (failed) return null;
          if (c.high >= level - p.tolerance * a && c.close < level && c.close < ind.trend[i]) {
            ctx.lastBreakoutTime = candles[b].epoch;
            return { side: "sell", slLevel: Math.max(c.high, level) + p.buffer * a, rr: p.rr, tag: "retest-hold-down" };
          }
        }
        return null;
      }
      return null;
    }
  }),
  "forex-rsi-bollinger-reversion": (p) => ({
    prepare(candles) {
      const c = closes(candles);
      return { bb: bollinger(c, p.period, p.width), rsi: rsi(c, 14), adx: adx(candles, 14), atr: atr(candles, 14) };
    },
    evaluate(ind, candles, i) {
      const { bb } = ind;
      if (!ok(bb.mid[i], bb.upper[i], bb.lower[i], ind.rsi[i], ind.adx[i], ind.atr[i])) return null;
      if (ind.adx[i] >= p.adxMax) return null;
      const close = candles[i].close;
      if (close < bb.lower[i] && ind.rsi[i] < p.rsiLow) {
        return { side: "buy", slDistance: p.atrMult * ind.atr[i], tpLevel: bb.mid[i], tag: "lower-band-oversold" };
      }
      if (close > bb.upper[i] && ind.rsi[i] > 100 - p.rsiLow) {
        return { side: "sell", slDistance: p.atrMult * ind.atr[i], tpLevel: bb.mid[i], tag: "upper-band-overbought" };
      }
      return null;
    }
  })
};

export function makeVariant(slug, overrides = {}) {
  const frozen = getStrategyDef(slug);
  const params = { ...DEFAULTS[slug], ...overrides };
  return { slug, name: frozen.name, rulesVersion: frozen.rulesVersion, symbols: frozen.symbols, granularity: frozen.granularity, warmup: frozen.warmup, params, ...BUILDERS[slug](params) };
}

// Each entry is one parameter moved a step either side of the frozen value.
export const SENSITIVITY = {
  "gold-h1-trend": [
    { fast: 15 }, { fast: 25 }, { slow: 40 }, { slow: 60 }, { trend: 150 }, { trend: 250 },
    { atrMult: 1.5 }, { atrMult: 2.5 }, { rr: 1.5 }, { rr: 2.5 }
  ],
  "gold-london-breakout": [
    { firstHour: 6, lastHour: 9, rangeEndHour: 5 }, { firstHour: 8, lastHour: 11, rangeEndHour: 7 }, { londonClock: true },
    { lastHour: 9 }, { lastHour: 11 }, { rr: 1 }, { rr: 2 }, { exitHour: 18 }, { exitHour: 22 },
    { minWidth: 0.25 }, { minWidth: 0.75 }, { maxWidth: 2 }, { maxWidth: 4 }
  ],
  "forex-breakout-retest": [
    { lookback: 15 }, { lookback: 25 }, { trend: 80 }, { trend: 120 }, { tolerance: 0.15 }, { tolerance: 0.35 },
    { buffer: 0.25 }, { buffer: 0.75 }, { rr: 1.5 }, { rr: 2.5 }
  ],
  "forex-rsi-bollinger-reversion": [
    { period: 15 }, { period: 25 }, { width: 1.75 }, { width: 2.25 }, { rsiLow: 25 }, { rsiLow: 35 },
    { adxMax: 15 }, { adxMax: 25 }, { atrMult: 1 }, { atrMult: 2 }
  ]
};

// Number of swap charges between entry and exit: one per 21:00 UTC rollover on Monday to Friday, three on Wednesday.
export function swapNights(entryEpoch, exitEpoch) {
  let t = Math.floor(entryEpoch / DAY) * DAY + 21 * HOUR;
  if (t <= entryEpoch) t += DAY;
  let nights = 0;
  for (; t <= exitEpoch; t += DAY) {
    const weekday = new Date(t * 1000).getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    nights += weekday === 3 ? 3 : 1;
  }
  return nights;
}
