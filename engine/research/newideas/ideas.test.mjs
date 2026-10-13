import { describe, expect, it } from "vitest";
import { backtest } from "../../backtest.mjs";
import { sessionTrade, shiftLeg } from "./ideas.mjs";

const HOUR = 3600;

// Flat hourly candles, Monday 2024-01-08 00:00 UTC onwards, with a small fixed range so ATR is defined.
function flatCandles(count, price) {
  const start = Date.UTC(2024, 0, 1) / 1000;
  return Array.from({ length: count }, (_, i) => ({ epoch: start + i * HOUR, open: price, high: price + 1, low: price - 1, close: price }));
}

describe("session trade idea", () => {
  it("enters at the entry hour on weekdays only and leaves at the exit hour the same day", () => {
    // Arrange
    const leg = { slug: "t", name: "t", symbol: "frxXAUUSD", side: "buy", entryHour: 7, exitHour: 15 };
    const candles = flatCandles(24 * 21, 2000);

    // Act
    const { trades } = backtest(sessionTrade(leg), "frxXAUUSD", candles);

    // Assert
    expect(trades.length).toBeGreaterThan(8);
    for (const t of trades) {
      const entry = new Date(t.entryTime * 1000);
      const exit = new Date(t.exitTime * 1000);
      expect(entry.getUTCHours()).toBe(7);
      expect([1, 2, 3, 4, 5]).toContain(entry.getUTCDay());
      expect(exit.getUTCHours()).toBe(15);
      expect(exit.getUTCDate()).toBe(entry.getUTCDate());
      expect(t.exitReason).toBe("time");
      expect(t.entryTime).toBeGreaterThan(t.signalTime);
    }
  });

  it("uses the 23:00 candle of the day before for a midnight entry", () => {
    const leg = { slug: "t", name: "t", symbol: "frxXAUUSD", side: "buy", entryHour: 0, exitHour: 7 };
    const { trades } = backtest(sessionTrade(leg), "frxXAUUSD", flatCandles(24 * 21, 2000));
    expect(trades.length).toBeGreaterThan(8);
    for (const t of trades) expect(new Date(t.entryTime * 1000).getUTCHours()).toBe(0);
  });

  it("shifts a session by whole hours", () => {
    expect(shiftLeg({ entryHour: 7, exitHour: 15 }, -1)).toMatchObject({ entryHour: 6, exitHour: 14 });
    expect(shiftLeg({ entryHour: 7, exitHour: 15 }, 1)).toMatchObject({ entryHour: 8, exitHour: 16 });
    // a midnight entry cannot move earlier, so its second variant is two hours later
    expect(shiftLeg({ entryHour: 0, exitHour: 7 }, -1)).toMatchObject({ entryHour: 2, exitHour: 9 });
  });
});
