// Candle-by-candle paper-trading simulator. The same code runs the hourly public record and CSV backtests.
//
// Conventions (all deliberately conservative):
//  - A signal is generated on the close of candle k and the trade enters at the OPEN of candle k+1.
//  - Entry and exit each pay half of an assumed spread, always against the trade.
//  - If a stop and a target are both touched inside one candle, the stop is assumed to hit first.
//  - If a candle opens beyond a stop or target (a gap), the exit fills at the open, not at the level.
//  - A trade is skipped if the assumed round-trip cost is more than MAX_COST_R of its risk distance.
//  - Results are reported in R (multiples of the initial risk), so no position sizing is needed.

import { MAX_COST_R, SPREADS, utcDay, utcHour } from "./strategies.mjs";

const round = (x, dp = 5) => (Number.isFinite(x) ? Math.round(x * 10 ** dp) / 10 ** dp : null);

export function emptySymbolState() {
  return { lastProcessed: null, pending: null, open: null, ctx: {} };
}

export function newRecord(strategy, nowIso) {
  const symbols = {};
  for (const sym of strategy.symbols) symbols[sym] = emptySymbolState();
  return {
    schema: 1,
    slug: strategy.slug,
    name: strategy.name,
    rulesVersion: strategy.rulesVersion,
    startedAt: nowIso,
    lastRunAt: null,
    assumptions: {
      spread: Object.fromEntries(strategy.symbols.map((s) => [s, SPREADS[s]])),
      maxCostR: MAX_COST_R,
      entry: "Open of the candle after the signal candle",
      note: "Simulated on candle data. Spread costs are assumed, not measured. Real fills will differ."
    },
    symbols,
    skipped: { cost: 0, invalid: 0 },
    trades: [],
    stats: computeStats([])
  };
}

function tryOpen(rec, strategy, sym, s, c) {
  const sig = s.pending;
  const spread = SPREADS[sym] ?? 0;
  const half = spread / 2;
  const buy = sig.side === "buy";
  const entry = buy ? c.open + half : c.open - half;
  const sl = sig.slLevel ?? (buy ? entry - sig.slDistance : entry + sig.slDistance);
  const risk = Math.abs(entry - sl);
  const slOk = buy ? sl < entry : sl > entry;
  if (!Number.isFinite(risk) || risk <= 0 || !slOk) {
    rec.skipped.invalid++;
    return false;
  }
  const tp = sig.tpLevel ?? (buy ? entry + sig.rr * risk : entry - sig.rr * risk);
  const tpOk = buy ? tp > entry : tp < entry;
  if (!Number.isFinite(tp) || !tpOk) {
    rec.skipped.invalid++;
    return false;
  }
  if (spread / risk > MAX_COST_R) {
    rec.skipped.cost++;
    return false;
  }
  s.open = {
    side: sig.side,
    signalTime: sig.signalTime,
    entryTime: c.epoch,
    entry: round(entry),
    sl: round(sl),
    tp: round(tp),
    risk: round(risk),
    timeExitHour: sig.timeExitHour ?? null,
    entryDay: utcDay(c.epoch),
    tag: sig.tag
  };
  return true;
}

function closePosition(rec, sym, s, exitTime, rawPrice, reason) {
  const pos = s.open;
  const half = (SPREADS[sym] ?? 0) / 2;
  const buy = pos.side === "buy";
  const fill = buy ? rawPrice - half : rawPrice + half;
  const dir = buy ? 1 : -1;
  rec.trades.push({
    id: rec.trades.length + 1,
    symbol: sym,
    side: pos.side,
    tag: pos.tag,
    signalTime: pos.signalTime,
    entryTime: pos.entryTime,
    entry: pos.entry,
    sl: pos.sl,
    tp: pos.tp,
    exitTime,
    exit: round(fill),
    exitReason: reason,
    r: round((dir * (fill - pos.entry)) / pos.risk, 3)
  });
  s.open = null;
}

function manageOpen(rec, sym, s, c, justOpened) {
  const pos = s.open;
  const buy = pos.side === "buy";
  if (!justOpened && pos.timeExitHour != null && (utcDay(c.epoch) > pos.entryDay || utcHour(c.epoch) >= pos.timeExitHour)) {
    closePosition(rec, sym, s, c.epoch, c.open, "time");
    return;
  }
  if (buy) {
    if (c.open <= pos.sl) return closePosition(rec, sym, s, c.epoch, c.open, "sl");
    if (c.low <= pos.sl) return closePosition(rec, sym, s, c.epoch, pos.sl, "sl");
    if (c.open >= pos.tp) return closePosition(rec, sym, s, c.epoch, c.open, "tp");
    if (c.high >= pos.tp) return closePosition(rec, sym, s, c.epoch, pos.tp, "tp");
  } else {
    if (c.open >= pos.sl) return closePosition(rec, sym, s, c.epoch, c.open, "sl");
    if (c.high >= pos.sl) return closePosition(rec, sym, s, c.epoch, pos.sl, "sl");
    if (c.open <= pos.tp) return closePosition(rec, sym, s, c.epoch, c.open, "tp");
    if (c.low <= pos.tp) return closePosition(rec, sym, s, c.epoch, pos.tp, "tp");
  }
}

/**
 * Advance one symbol through every closed candle newer than s.lastProcessed.
 * On the very first run (lastProcessed === null) nothing is backfilled: the record starts now.
 * Pass { backfill: true } for historical backtests.
 */
export function advance(rec, strategy, sym, candles, nowEpoch, { backfill = false } = {}) {
  const closed = candles.filter((c) => c.epoch + strategy.granularity <= nowEpoch);
  if (closed.length === 0) return 0;
  const s = rec.symbols[sym];
  if (s.lastProcessed == null) {
    if (!backfill) {
      s.lastProcessed = closed[closed.length - 1].epoch;
      return 0;
    }
    s.lastProcessed = closed[Math.min(strategy.warmup, closed.length) - 1].epoch;
  }
  const ind = strategy.prepare(closed);
  let processed = 0;
  for (let k = 0; k < closed.length; k++) {
    const c = closed[k];
    if (c.epoch <= s.lastProcessed) continue;
    let justOpened = false;
    if (s.pending) {
      justOpened = tryOpen(rec, strategy, sym, s, c);
      s.pending = null;
    }
    if (s.open) manageOpen(rec, sym, s, c, justOpened);
    if (!s.open && k >= strategy.warmup) {
      const sig = strategy.evaluate(ind, closed, k, s.ctx);
      s.pending = sig ? { ...sig, signalTime: c.epoch } : null;
    }
    s.lastProcessed = c.epoch;
    processed++;
  }
  rec.stats = computeStats(rec.trades);
  return processed;
}

export function computeStats(trades) {
  const n = trades.length;
  const wins = trades.filter((t) => t.r > 0);
  const losses = trades.filter((t) => t.r <= 0);
  const grossWin = wins.reduce((a, t) => a + t.r, 0);
  const grossLoss = -losses.reduce((a, t) => a + t.r, 0);
  let cum = 0;
  let peak = 0;
  let maxDd = 0;
  let streak = 0;
  let longest = 0;
  for (const t of trades) {
    cum += t.r;
    peak = Math.max(peak, cum);
    maxDd = Math.max(maxDd, peak - cum);
    streak = t.r <= 0 ? streak + 1 : 0;
    longest = Math.max(longest, streak);
  }
  return {
    trades: n,
    wins: wins.length,
    losses: losses.length,
    winRate: n ? round((100 * wins.length) / n, 1) : null,
    avgWinR: wins.length ? round(grossWin / wins.length, 3) : null,
    avgLossR: losses.length ? round(-grossLoss / losses.length, 3) : null,
    expectancyR: n ? round(cum / n, 3) : null,
    profitFactor: grossLoss > 0 ? round(grossWin / grossLoss, 2) : null,
    totalR: round(cum, 2),
    maxDrawdownR: round(maxDd, 2),
    longestLosingStreak: longest
  };
}
