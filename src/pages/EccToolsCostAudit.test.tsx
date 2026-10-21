import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { EccToolsCostAudit } from "./EccToolsCostAudit";
import { AuthProvider } from "../components/AuthProvider";

describe("ecc-tools-cost-audit page", () => {
  it("renders the FX sit-out clock, not a billing audit", () => {
    const html = renderToString(
      <AuthProvider>
        <MemoryRouter>
          <EccToolsCostAudit />
        </MemoryRouter>
      </AuthProvider>
    );
    expect(html).toContain("FX news sit-out");
    expect(html).toContain("not a billing audit");
    expect(html).toContain("I trade synthetics");
    expect(html).toContain("I trade FX");
    expect(html).toContain("Volatility Indices");
  });
});
