// The four strategies. Rules are frozen per `rulesVersion`: if you change a rule, bump the version so the
// old public record is never silently mixed with results from different rules.
//
// Contract: evaluate(ind, candles, i, ctx) looks ONLY at candles 0..i (the last CLOSED candle) and returns
// null or a signal. The simulator enters at the OPEN of candle i+1.
//   signal = { side: 'buy'|'sell', slLevel?|slDistance, tpLevel?|rr, timeExitHour?, tag }

import { adx, atr, bollinger, ema, priorHigh, priorLow, rsi } from "./indicators.mjs";

export const utcHour = (epoch) => new Date(epoch * 1000).getUTCHours();
export const utcDay = (epoch) => Math.floor(epoch / 86400);

const closes = (candles) => candles.map((c) => c.close);
const ok = (...values) => values.every((v) => Number.isFinite(v));

// Assumed round-trip spread in price units. These are assumptions, not measured Deriv spreads: edit them to
// match what you actually see, and re-run any backtest.
export const SPREADS = {
  frxXAUUSD: 0.35,
  frxEURUSD: 0.00012,
  frxGBPUSD: 0.00016,
  frxUSDJPY: 0.016
};

// Skip a trade if the assumed round-trip cost would be more than this share of the risk distance.
export const MAX_COST_R = 0.25;

const FOREX = ["frxEURUSD", "frxGBPUSD", "frxUSDJPY"];

export const STRATEGIES = [
  {
    slug: "gold-h1-trend",
    name: "Gold H1 Trend",
    rulesVersion: 1,
    symbols: ["frxXAUUSD"],
    granularity: 3600,
    warmup: 250,
    prepare(candles) {
      const c = closes(candles);
      return { fast: ema(c, 20), slow: ema(c, 50), trend: ema(c, 200), atr: atr(candles, 14) };
    },
    evaluate(ind, candles, i) {
      if (i < 1) return null;
      const { fast, slow, trend } = ind;
      if (!ok(fast[i], fast[i - 1], slow[i], slow[i - 1], trend[i], ind.atr[i])) return null;
      const close = candles[i].close;
      if (fast[i - 1] <= slow[i - 1] && fast[i] > slow[i] && close > trend[i]) {
        return { side: "buy", slDistance: 2 * ind.atr[i], rr: 2, tag: "ema-cross-up" };
      }
      if (fast[i - 1] >= slow[i - 1] && fast[i] < slow[i] && close < trend[i]) {
        return { side: "sell", slDistance: 2 * ind.atr[i], rr: 2, tag: "ema-cross-down" };
      }
      return null;
    }
  },
  {
    slug: "gold-london-breakout",
    name: "Gold London Breakout",
    rulesVersion: 1,
    symbols: ["frxXAUUSD"],
    granularity: 3600,
    warmup: 30,
    prepare(candles) {
      return { atr: atr(candles, 14) };
    },
    evaluate(ind, candles, i, ctx) {
      const c = candles[i];
      const hour = utcHour(c.epoch);
      if (hour < 7 || hour > 10) return null; // signal candle opens 07:00-10:00 UTC
      const day = utcDay(c.epoch);
      if (ctx.lastTradeDay === day) return null; // one trade per day
      let hi = -Infinity;
      let lo = Infinity;
      let count = 0;
      for (let j = i - 1; j >= 0 && utcDay(candles[j].epoch) === day; j--) {
        if (utcHour(candles[j].epoch) <= 6) {
          hi = Math.max(hi, candles[j].high);
          lo = Math.min(lo, candles[j].low);
          count++;
        }
      }
      const a = ind.atr[i];
      if (count < 5 || !ok(a) || a <= 0) return null;
      const width = hi - lo;
      if (width < 0.5 * a || width > 3 * a) return null; // range too thin or too wide
      if (c.close > hi) {
        ctx.lastTradeDay = day;
        return { side: "buy", slLevel: lo, rr: 1.5, timeExitHour: 20, tag: "asian-high-break" };
      }
      if (c.close < lo) {
        ctx.lastTradeDay = day;
        return { side: "sell", slLevel: hi, rr: 1.5, timeExitHour: 20, tag: "asian-low-break" };
      }
      return null;
    }
  },
  {
    slug: "forex-breakout-retest",
    name: "Forex Breakout and Retest",
    rulesVersion: 1,
    symbols: FOREX,
    granularity: 3600,
    warmup: 120,
    prepare(candles) {
      return {
        hh: priorHigh(candles, 20),
        ll: priorLow(candles, 20),
        trend: ema(closes(candles), 100),
        atr: atr(candles, 14)
      };
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
          if (c.low <= level + 0.25 * a && c.close > level && c.close > ind.trend[i]) {
            ctx.lastBreakoutTime = candles[b].epoch;
            return { side: "buy", slLevel: Math.min(c.low, level) - 0.5 * a, rr: 2, tag: "retest-hold-up" };
          }
        } else {
          const level = ind.ll[b];
          let failed = false;
          for (let j = b + 1; j < i; j++) if (candles[j].close > level) failed = true;
          if (failed) return null;
          if (c.high >= level - 0.25 * a && c.close < level && c.close < ind.trend[i]) {
            ctx.lastBreakoutTime = candles[b].epoch;
            return { side: "sell", slLevel: Math.max(c.high, level) + 0.5 * a, rr: 2, tag: "retest-hold-down" };
          }
        }
        return null; // most recent breakout found but no valid retest yet
      }
      return null;
    }
  },
  {
    slug: "forex-rsi-bollinger-reversion",
    name: "Forex RSI/Bollinger Reversion",
    rulesVersion: 1,
    symbols: FOREX,
    granularity: 3600,
    warmup: 60,
    prepare(candles) {
      const c = closes(candles);
      return { bb: bollinger(c, 20, 2), rsi: rsi(c, 14), adx: adx(candles, 14), atr: atr(candles, 14) };
    },
    evaluate(ind, candles, i) {
      const { bb } = ind;
      if (!ok(bb.mid[i], bb.upper[i], bb.lower[i], ind.rsi[i], ind.adx[i], ind.atr[i])) return null;
      if (ind.adx[i] >= 20) return null; // only trade when the market is not trending
      const close = candles[i].close;
      if (close < bb.lower[i] && ind.rsi[i] < 30) {
        return { side: "buy", slDistance: 1.5 * ind.atr[i], tpLevel: bb.mid[i], tag: "lower-band-oversold" };
      }
      if (close > bb.upper[i] && ind.rsi[i] > 70) {
        return { side: "sell", slDistance: 1.5 * ind.atr[i], tpLevel: bb.mid[i], tag: "upper-band-overbought" };
      }
      return null;
    }
  }
];

export function getStrategyDef(slug) {
  return STRATEGIES.find((s) => s.slug === slug);
}
