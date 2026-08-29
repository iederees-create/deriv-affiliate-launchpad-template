import { describe, expect, it } from "vitest";
import { derivSocketUrl, parseHistoryMessage, parseTickMessage } from "./derivMarket";

describe("deriv market client", () => {
  it("builds the documented websocket url", () => {
    expect(derivSocketUrl(1089)).toBe("wss://ws.derivws.com/websockets/v3?app_id=1089");
  });

  it("rejects a missing app id", () => {
    expect(() => derivSocketUrl(0)).toThrow(/app_id/);
  });

  it("parses a tick and ignores errors or junk", () => {
    expect(parseTickMessage({ tick: { symbol: "R_75", quote: 123.45, epoch: 1_700_000_000 } })).toEqual({
      symbol: "R_75",
      quote: 123.45,
      epoch: 1_700_000_000
    });
    expect(parseTickMessage({ error: { message: "InvalidSymbol" }, tick: { symbol: "R_75", quote: 1, epoch: 1 } })).toBeNull();
    expect(parseTickMessage({ tick: { symbol: "R_75", quote: "bad", epoch: 1 } })).toBeNull();
    expect(parseTickMessage(null)).toBeNull();
  });

  it("parses a ticks_history print", () => {
    expect(
      parseHistoryMessage({
        echo_req: { ticks_history: "R_10", end: "latest", count: 1 },
        history: { prices: [4771.124], times: [1_788_029_736] }
      })
    ).toEqual({ symbol: "R_10", quote: 4771.124, epoch: 1_788_029_736 });
    expect(parseHistoryMessage({ error: { code: "InvalidSymbol" }, echo_req: { ticks_history: "R_10" } })).toBeNull();
  });
});
