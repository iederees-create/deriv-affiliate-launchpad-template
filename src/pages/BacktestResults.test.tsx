import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { BacktestResults } from "./BacktestResults";
import { backtestResults } from "../data/backtestResults";
import { strategies } from "../data/strategies";

const html = renderToString(
  <MemoryRouter>
    <BacktestResults />
  </MemoryRouter>
);

describe("backtest results page", () => {
  it("shows every tested idea with its verdict and never calls one a winner", () => {
    for (const row of backtestResults.rows) {
      expect(html).toContain(row.name);
      expect(["no evidence of edge", "inconclusive"]).toContain(row.verdict);
    }
    expect(html).toContain("None of the six");
    expect(html).not.toMatch(/guaranteed|% accurate|proven profitable/i);
  });

  it("carries the risk and affiliate disclosures", () => {
    expect(html).toContain("I may earn a commission");
    expect(html).toContain("Trading involves risk");
    expect(html).toContain("not financial advice");
  });

  it("covers each paper strategy and links to its page", () => {
    const paperSlugs = strategies.filter((s) => s.record.kind === "paper").map((s) => s.slug);
    for (const slug of paperSlugs) {
      expect(backtestResults.rows.some((row) => row.slug === slug), slug).toBe(true);
      expect(html).toContain(`/strategies/${slug}`);
    }
  });
});
