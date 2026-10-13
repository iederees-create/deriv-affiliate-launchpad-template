// New ideas under test (see PROTOCOL.md). Same contract as engine/strategies.mjs so the unmodified simulator runs them.

import { atr } from "../../indicators.mjs";
import { utcHour } from "../../strategies.mjs";

const HOUR = 3600;
const STOP_ATR_MULTIPLE = 3;
const NO_TARGET_RR = 1000; // far beyond reach: these trades end at the stop or at the time exit

// One trade per weekday: enter at entryHour (UTC), leave at exitHour (UTC) the same day.
export function sessionTrade({ slug, name, symbol, side, entryHour, exitHour }) {
  const signalHour = (entryHour + 23) % 24;
  return {
    slug,
    name,
    rulesVersion: 1,
    symbols: [symbol],
    granularity: HOUR,
    warmup: 30,
    session: { side, entryHour, exitHour },
    prepare(candles) {
      return { atr: atr(candles, 14) };
    },
    evaluate(ind, candles, i) {
      const c = candles[i];
      if (utcHour(c.epoch) !== signalHour) return null;
      const entryWeekday = new Date((c.epoch + HOUR) * 1000).getUTCDay();
      if (entryWeekday === 0 || entryWeekday === 6) return null;
      const a = ind.atr[i];
      if (!Number.isFinite(a) || a <= 0) return null;
      return { side, slDistance: STOP_ATR_MULTIPLE * a, rr: NO_TARGET_RR, timeExitHour: exitHour, tag: `${side}-${entryHour}-${exitHour}` };
    }
  };
}

const leg = (slug, symbol, side, entryHour, exitHour) => ({ slug, name: slug, symbol, side, entryHour, exitHour });

export const IDEAS = [
  { key: "N1 gold-asia-session", legs: [leg("gold-asia-session", "frxXAUUSD", "buy", 0, 7)] },
  {
    key: "N2 fx-local-hours",
    legs: [
      leg("eurusd-europe-short", "frxEURUSD", "sell", 7, 15),
      leg("eurusd-us-long", "frxEURUSD", "buy", 15, 20),
      leg("gbpusd-europe-short", "frxGBPUSD", "sell", 7, 15),
      leg("gbpusd-us-long", "frxGBPUSD", "buy", 15, 20),
      leg("usdjpy-tokyo-long", "frxUSDJPY", "buy", 0, 6),
      leg("usdjpy-us-short", "frxUSDJPY", "sell", 13, 20)
    ]
  }
];

// Comparison only, never a candidate: holding gold through the rest of the day.
export const GOLD_REST_OF_DAY = { key: "gold rest-of-day (comparison)", legs: [leg("gold-rest-of-day", "frxXAUUSD", "buy", 7, 20)] };

// The simulator closes a time-exit trade at the UTC day change, so a session cannot start before 00:00.
// For the legs that enter at 00:00 the "earlier" variant is therefore two hours later instead.
export function shiftLeg(l, hours) {
  const applied = l.entryHour + hours < 0 ? 2 : hours;
  return { ...l, entryHour: l.entryHour + applied, exitHour: l.exitHour + applied };
}
