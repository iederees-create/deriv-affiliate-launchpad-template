import { describe, expect, it } from "vitest";
import { getStrategy, statusLabels, strategies } from "./strategies";

const BANNED = /risk[- ]free|passive income|\bproven\b|never lose|can't lose|cannot lose|\b9\d\s?%\s*(win|accura)|\b100\s?%\s*(win|accura)/i;

function allText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allText);
  if (value && typeof value === "object") return Object.values(value).flatMap(allText);
  return [];
}

describe("strategy pages", () => {
  it("has unique, url-safe slugs", () => {
    const slugs = strategies.map((item) => item.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("never uses hype or guaranteed-result wording", () => {
    for (const item of strategies) {
      for (const text of allText(item)) expect(text, `${item.slug}: ${text}`).not.toMatch(BANNED);
    }
  });

  it("states risk controls and known limits on every strategy", () => {
    for (const item of strategies) {
      expect(item.risk.perTrade.length).toBeGreaterThan(0);
      expect(item.risk.stop.length).toBeGreaterThan(0);
      expect(item.risk.dailyStop.length).toBeGreaterThan(0);
      expect(item.limits.length).toBeGreaterThan(0);
      expect(item.breakEvenNote.length).toBeGreaterThan(0);
    }
  });

  it("only calls a strategy tested when a public record exists", () => {
    for (const item of strategies) {
      if (item.status === "building") expect(item.record.kind).toBe("none");
      else expect(item.record.kind, item.slug).not.toBe("none");
      if (item.record.kind === "external") expect(item.record.url, item.slug).toMatch(/^https:\/\//);
    }
  });

  it("has a label for every status and finds strategies by slug", () => {
    for (const item of strategies) expect(statusLabels[item.status]).toBeTruthy();
    expect(getStrategy("gold-h1-trend")?.name).toBe("Gold H1 Trend");
    expect(getStrategy("does-not-exist")).toBeUndefined();
  });
});
