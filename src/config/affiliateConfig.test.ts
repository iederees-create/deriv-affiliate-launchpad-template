import { describe, expect, it } from "vitest";
import { affiliateConfig, filledSocialLinks, whatsappUrl } from "./affiliateConfig";

describe("affiliate public surfaces", () => {
  it("exposes TikTok and trader LinkedIn, and hides empty channels", () => {
    const links = filledSocialLinks();
    expect(links.map((item) => item.key)).toEqual(["tiktok", "linkedin"]);
    expect(links[0]?.href).toBe("https://www.tiktok.com/@tradegrurufx");
    expect(links[1]?.href).toContain("iederees-francis-973879228");
  });

  it("prices the sit-with-you walkthrough in rand and keeps it on demo", () => {
    const { sitWithMe } = affiliateConfig;
    expect(sitWithMe.priceLabel).toBe("R1,800");
    expect(sitWithMe.durationMinutes).toBe(60);
    expect(sitWithMe.whatsappMessage).toMatch(/14-day demo plan/i);
    expect(sitWithMe.whatsappMessage).toMatch(/do not place live trades/i);
    expect(sitWithMe.whatsappMessage.toLowerCase()).not.toMatch(/fund live|deposit now/);
  });

  it("builds a WhatsApp deep link with the sit-with-you message", () => {
    const href = whatsappUrl(affiliateConfig.sitWithMe.whatsappMessage);
    expect(href).toContain("wa.me/27629494708");
    expect(href).toContain(encodeURIComponent(affiliateConfig.sitWithMe.whatsappMessage));
  });
});
