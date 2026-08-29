import { describe, expect, it } from "vitest";
import {
  clamp,
  dailyBudget,
  drawdownRecovery,
  journeyDay,
  loadResource,
  sampleExpectancy,
  stakePlan,
  streakSurvival,
  todayJourneyDay,
  unwrapEnvelope,
  type Journey
} from "./deskApi";

const journey: Journey = {
  id: "demo-14",
  title: "14-day",
  account: "demo",
  rule: "demo first",
  days: [
    { day: 1, title: "Stop", task: "Write it", resource: "/kit" },
    { day: 14, title: "Keep files", task: "Download", resource: "/kit" }
  ]
};

describe("desk calculators", () => {
  it("sizes a 1% stake on a 500 account", () => {
    expect(stakePlan("500", "1")).toMatchObject({ account: 500, riskPct: 1, perTrade: 5 });
  });

  it("caps risk at 5%", () => {
    expect(stakePlan(1000, 12)).toMatchObject({ riskPct: 5, perTrade: 50 });
  });

  it("rejects invalid stake inputs", () => {
    expect(stakePlan("abc", "1")).toHaveProperty("error");
    expect(stakePlan(-10, 1)).toHaveProperty("error");
  });

  it("computes remaining daily budget and stop", () => {
    expect(dailyBudget(500, 2, 4)).toMatchObject({ dailyCap: 10, remaining: 6, stopNow: false });
    expect(dailyBudget(500, 2, 12)).toMatchObject({ remaining: 0, stopNow: true });
  });

  it("computes asymmetric drawdown recovery", () => {
    expect(drawdownRecovery(20)).toMatchObject({ recovery: 25 });
    expect(drawdownRecovery("not-a-number")).toHaveProperty("error");
  });

  it("compounds a losing streak", () => {
    expect(streakSurvival(1000, 1, 5)).toMatchObject({ streak: 5 });
    const result = streakSurvival(1000, 1, 5);
    if ("error" in result) throw new Error("unexpected");
    expect(result.afterStreak).toBeCloseTo(1000 * Math.pow(0.99, 5), 8);
  });

  it("computes sample expectancy in R", () => {
    expect(sampleExpectancy(8, 12, 1.2, 1)).toMatchObject({ sample: 20, winRate: 0.4 });
    const result = sampleExpectancy(8, 12, 1.2, 1);
    if ("error" in result) throw new Error("unexpected");
    expect(result.expectancy).toBeCloseTo(0.4 * 1.2 - 0.6 * 1, 8);
  });
});

describe("journey helpers", () => {
  it("looks up a day or returns null", () => {
    expect(journeyDay(journey, 1)?.title).toBe("Stop");
    expect(journeyDay(journey, 2)).toBeNull();
    expect(journeyDay(journey, 0)).toBeNull();
  });

  it("maps a start date to a 1–14 day index", () => {
    expect(todayJourneyDay("2026-08-29", new Date("2026-08-29T18:00:00"))).toBe(1);
    expect(todayJourneyDay("2026-08-29", new Date("2026-09-04T09:00:00"))).toBe(7);
    expect(todayJourneyDay("2026-08-29", new Date("2026-10-01T09:00:00"))).toBe(14);
  });

  it("clamps helper values", () => {
    expect(clamp(12, 0, 5)).toBe(5);
    expect(clamp(-2, 0, 5)).toBe(0);
  });
});

describe("api envelope", () => {
  it("unwraps a data envelope", () => {
    expect(unwrapEnvelope({ data: { ok: true }, meta: { source: "apex-desk" } }, "test.json")).toEqual({ ok: true });
  });

  it("rejects a missing envelope", () => {
    expect(() => unwrapEnvelope({ ok: true }, "test.json")).toThrow(/invalid envelope/);
  });

  it("loads a resource through fetch and the envelope", async () => {
    const fetchImpl: typeof fetch = async () =>
      ({
        ok: true,
        json: async () => ({ data: { id: "demo-14" } })
      }) as Response;
    await expect(loadResource<{ id: string }>("journey.json", fetchImpl)).resolves.toEqual({ id: "demo-14" });
  });

  it("surfaces HTTP failures", async () => {
    const fetchImpl: typeof fetch = async () => ({ ok: false, status: 404, json: async () => ({}) }) as Response;
    await expect(loadResource("missing.json", fetchImpl)).rejects.toThrow(/404/);
  });
});
