export const affiliateConfig = {
  brandName: "Apex Trade Network",
  productName: "Trading Affiliate Website Template",
  affiliateOwnerName: "Iederees Francis",
  primaryAffiliateLink: "https://t.deriv.link?t=VQGBGPUYGJDZ",
  demoAccountLink: "https://t.deriv.link?t=VQGBGPUYGJDZ",
  liveAccountLink: "https://t.deriv.link?t=VQGBGPUYGJDZ",
  partnerProgrammeLink: "https://t.deriv.link?t=VQGBGPUYGJDZ",
  learnBasicsLink: "/deriv-affiliate-launchpad-template/learn",
  whatsappNumber: "+27629494708",
  email: "iedereesfrancis@gmail.com",
  disclosureText:
    "Affiliate disclosure: this site is independently run by Iederees Francis. I may earn a commission if you register, deposit, trade, or join a partner programme through the links on this site.",
  riskDisclaimer:
    "Trading involves risk. CFDs and other leveraged products can result in losses greater than the initial amount committed. This website is educational and promotional, not financial advice.",
  socialLinks: {
    youtube: "https://example.com/youtube",
    tiktok: "https://example.com/tiktok",
    instagram: "https://example.com/instagram",
    x: "https://example.com/x",
    linkedin: "https://www.linkedin.com/in/iederees-francis/"
  },
  themeColours: {
    background: "#08111f",
    surface: "#101a2b",
    primary: "#6be4c4",
    secondary: "#8ab4ff",
    accent: "#f8d06b"
  }
} as const;

export type AffiliateConfig = typeof affiliateConfig;
