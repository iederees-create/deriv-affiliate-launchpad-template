export const affiliateConfig = {
  brandName: "Deriv Partner Affiliate Launchpad",
  productName: "Trading Affiliate Website Template",
  affiliateOwnerName: "Your Affiliate Brand",
  primaryAffiliateLink: "https://example.com/your-primary-affiliate-link",
  demoAccountLink: "https://example.com/your-demo-account-link",
  liveAccountLink: "https://example.com/your-live-account-link",
  partnerProgrammeLink: "https://example.com/your-partner-programme-link",
  learnBasicsLink: "/deriv-affiliate-launchpad-template/learn",
  whatsappNumber: "+27000000000",
  email: "hello@example.com",
  disclosureText:
    "Affiliate disclosure: this demo template contains placeholder affiliate links. The website owner may earn commissions when visitors register, deposit, trade, or become partners through configured links.",
  riskDisclaimer:
    "Trading involves risk. CFDs and other leveraged products can result in losses greater than the initial amount committed. This website is educational and promotional, not financial advice.",
  socialLinks: {
    youtube: "https://example.com/youtube",
    tiktok: "https://example.com/tiktok",
    instagram: "https://example.com/instagram",
    x: "https://example.com/x",
    linkedin: "https://example.com/linkedin"
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
