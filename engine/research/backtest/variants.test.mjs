import { describe, expect, it } from "vitest";
import { backtest } from "../../backtest.mjs";
import { STRATEGIES } from "../../strategies.mjs";
import { isBritishSummerTime, makeVariant, swapNights } from "./variants.mjs";

const HOUR = 3600;
const DAY = 86400;

// Deterministic hourly candles on weekdays only, so day and session logic is exercised.
function syntheticCandles(count, start, volatility, seed) {
  let state = seed;
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  const candles = [];
  let price = start;
  let epoch = Date.UTC(2021, 0, 4) / 1000;
  while (candles.length < count) {
    const weekday = new Date(epoch * 1000).getUTCDay();
    if (weekday !== 0 && weekday !== 6) {
      const open = price;
      const close = open * (1 + (random() - 0.5) * volatility);
      const high = Math.max(open, close) * (1 + random() * volatility * 0.5);
      const low = Math.min(open, close) * (1 - random() * volatility * 0.5);
      candles.push({ epoch, open, high, low, close });
      price = close;
    }
    epoch += HOUR;
  }
  return candles;
}

describe("research variants", () => {
  it("reproduce the frozen strategies exactly at default parameters", () => {
    for (const frozen of STRATEGIES) {
      for (const symbol of frozen.symbols) {
        // Arrange
        const start = symbol === "frxXAUUSD" ? 2000 : symbol === "frxUSDJPY" ? 140 : 1.1;
        const candles = syntheticCandles(9000, start, 0.004, 7);

        // Act
        const expected = backtest(frozen, symbol, candles);
        const actual = backtest(makeVariant(frozen.slug), symbol, candles);

        // Assert
        expect(expected.trades.length, `${frozen.slug} ${symbol}`).toBeGreaterThan(20);
        expect(actual.trades).toEqual(expected.trades);
        expect(actual.skipped).toEqual(expected.skipped);
      }
    }
  });

  it("changes the trades when a parameter is overridden", () => {
    const candles = syntheticCandles(9000, 2000, 0.004, 7);
    const base = backtest(makeVariant("gold-h1-trend"), "frxXAUUSD", candles);
    const changed = backtest(makeVariant("gold-h1-trend", { fast: 15 }), "frxXAUUSD", candles);
    expect(changed.trades).not.toEqual(base.trades);
  });

  it("counts swap nights at 21:00 UTC with a triple charge on Wednesday and none at the weekend", () => {
    const monday = Date.UTC(2024, 0, 8) / 1000;
    expect(swapNights(monday + 10 * HOUR, monday + 20 * HOUR)).toBe(0);
    expect(swapNights(monday + 10 * HOUR, monday + 22 * HOUR)).toBe(1);
    expect(swapNights(monday + 22 * HOUR, monday + DAY + 22 * HOUR)).toBe(1);
    expect(swapNights(monday + 2 * DAY + 10 * HOUR, monday + 2 * DAY + 22 * HOUR)).toBe(3);
    expect(swapNights(monday + 4 * DAY + 10 * HOUR, monday + 7 * DAY + 10 * HOUR)).toBe(1);
    expect(swapNights(monday + 10 * HOUR, monday + 7 * DAY + 10 * HOUR)).toBe(7);
  });

  it("knows when the UK is on summer time", () => {
    expect(isBritishSummerTime(Date.UTC(2024, 0, 15) / 1000)).toBe(false);
    expect(isBritishSummerTime(Date.UTC(2024, 6, 15) / 1000)).toBe(true);
    expect(isBritishSummerTime(Date.UTC(2024, 2, 31, 0, 59) / 1000)).toBe(false);
    expect(isBritishSummerTime(Date.UTC(2024, 2, 31, 1, 0) / 1000)).toBe(true);
    expect(isBritishSummerTime(Date.UTC(2024, 9, 27, 1, 0) / 1000)).toBe(false);
  });
});
