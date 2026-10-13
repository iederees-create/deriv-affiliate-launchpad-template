import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { STRATEGIES } from "./strategies.mjs";

const pages = JSON.parse(fs.readFileSync(new URL("../src/data/strategies.json", import.meta.url), "utf8"));

describe("site and engine agree", () => {
  it("every paper-tested page has an engine strategy, and every engine strategy has a page", () => {
    const paperSlugs = pages.filter((p) => p.record.kind === "paper").map((p) => p.slug).sort();
    expect(paperSlugs).toEqual(STRATEGIES.map((s) => s.slug).sort());
  });

  it("the sitemap lists every strategy page", () => {
    const sitemap = fs.readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
    for (const p of pages) expect(sitemap, p.slug).toContain(`/strategies/${p.slug}<`);
  });
});
