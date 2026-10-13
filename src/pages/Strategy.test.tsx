import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { StrategyPage } from "./Strategy";
import { Strategies } from "./Strategies";
import { AuthProvider } from "../components/AuthProvider";

function render(path: string) {
  return renderToString(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/strategies/:slug" element={<StrategyPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("strategy pages render", () => {
  it("lists every strategy on the index", () => {
    const html = render("/strategies");
    expect(html).toContain("Gold H1 Trend");
    expect(html).toContain("Chart Select");
  });

  it("shows disclosure, risk text and a tagged partner link on the gold page", () => {
    const html = render("/strategies/gold-h1-trend");
    expect(html).toContain("I may earn a commission");
    expect(html).toContain("Trading involves risk");
    expect(html).toContain("No verified record yet");
    expect(html).toContain("utm_content=strategy-gold-h1-trend");
  });

  it("tags the partner link per strategy", () => {
    const html = render("/strategies/chart-select-call-pulse");
    expect(html).toContain("utm_content=strategy-chart-select-call-pulse");
    expect(html).not.toContain("No verified record yet");
  });

  it("handles an unknown strategy", () => {
    expect(render("/strategies/nope")).toContain("Strategy not found");
  });
});
