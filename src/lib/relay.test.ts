import { describe, expect, it } from "vitest";
import { PolicyError, decide, parseCampaignContext, recordEvent } from "./relay";

describe("launchpad relay", () => {
  it("keeps documented campaign params and drops the rest", () => {
    const context = parseCampaignContext("?utm_source=social&utm_campaign=call-pulse&utm_content=yt-short&exp=bold&steal=token");
    expect(context).toMatchObject({ source: "social", campaign: "call-pulse", content: "yt-short", experiment: "bold" });
  });

  it("treats an unknown source as direct", () => {
    expect(parseCampaignContext("?utm_source=ftp").source).toBe("direct");
  });

  it("refuses events before consent and refuses capture events", () => {
    expect(() => recordEvent([], "none", "page_view")).toThrow(PolicyError);
    expect(() => recordEvent([], "analytics", "css_exfil")).toThrow(PolicyError);
    expect(() => recordEvent([], "analytics", "field_completed", { value: "secret" })).toThrow(PolicyError);
  });

  it("shows the live desk to a new social visit", () => {
    const decision = decide(parseCampaignContext("?utm_source=social&utm_content=yt-short"), [], false);
    expect(decision.creative).toBe("live-desk");
    expect(decision.href).toContain("t.deriv.link");
  });

  it("swaps only the new-visitor headline in the bold experiment", () => {
    const decision = decide(parseCampaignContext("?utm_source=social&exp=bold"), [], false);
    expect(decision.creative).toBe("bold-hook");
    expect(decision.headline).toContain("compare it with the public desk");
  });

  it("sends a return visit to the 14-day kit", () => {
    const events = recordEvent([], "analytics", "page_view");
    const again = recordEvent(events, "analytics", "page_view");
    expect(decide(parseCampaignContext(""), again).href).toBe("/kit");
  });

  it("hands a demo click to the VIP step and keeps the referral code visible", () => {
    const events = recordEvent([], "marketing", "demo_clicked", { content: "yt-short" });
    const decision = decide(parseCampaignContext("?utm_source=social&utm_content=yt-short"), events);
    expect(decision.segment).toBe("mql");
    expect(decision.journey).toBe("sales_handoff");
    expect(decision.headline).toContain("28EX72Q47LR4");
  });
});
