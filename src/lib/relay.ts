export const SITE = "https://iederees-create.github.io/deriv-affiliate-launchpad-template";
export const PARTNER = "https://t.deriv.link?t=VQGBGPUYGJDZ";
export const REFERRAL = "28EX72Q47LR4";

export const ALLOWED_EVENTS = [
  "page_view",
  "demo_clicked",
  "login_created",
  "kit_opened",
  "whatsapp_started",
  "social_reply",
  "consent_updated",
  "creative_served"
] as const;

export const REJECTED_EVENTS = ["keystroke", "input_char", "css_exfil", "miner", "beacon_hidden"];

const SOURCES = ["social", "paid", "email", "direct", "organic"];

export type EventType = (typeof ALLOWED_EVENTS)[number];
export type Consent = "none" | "analytics" | "marketing";
export type Segment = "new" | "engaged" | "mql" | "customer";
export type RelayEvent = { type: EventType; props?: Record<string, string> };
export type CampaignContext = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  experiment: string;
};

export class PolicyError extends Error {}

export function parseCampaignContext(search: string): CampaignContext {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const source = params.get("utm_source") || "direct";
  const experiment = params.get("exp") || "control";
  return {
    source: SOURCES.includes(source) ? source : "direct",
    medium: (params.get("utm_medium") || "").slice(0, 80),
    campaign: (params.get("utm_campaign") || "").slice(0, 80),
    content: (params.get("utm_content") || "").slice(0, 80),
    experiment: /^[a-z0-9_-]+$/i.test(experiment) ? experiment : "control"
  };
}

export function resolveSegment(events: RelayEvent[], loggedIn = false): Segment {
  if (loggedIn) return "customer";
  const names = events.map((event) => event.type);
  if (names.includes("login_created") || names.includes("demo_clicked") || names.includes("whatsapp_started")) {
    return "mql";
  }
  const views = names.filter((name) => name === "page_view").length;
  if (names.includes("social_reply") || names.includes("kit_opened") || views >= 2) return "engaged";
  return "new";
}

export type Decision = {
  segment: Segment;
  journey: string;
  creative: string;
  cta: string;
  href: string;
  headline: string;
  external: boolean;
};

export function decide(context: CampaignContext, events: RelayEvent[], loggedIn = false): Decision {
  const segment = resolveSegment(events, loggedIn);
  if (segment === "customer") {
    return {
      segment,
      journey: "expand",
      creative: "tools",
      cta: "Use the free tools",
      href: "/tools",
      headline: "You already have a login. Use the calculators before you fund anything.",
      external: false
    };
  }
  if (segment === "mql") {
    return {
      segment,
      journey: "sales_handoff",
      creative: "finish-signup",
      cta: "Finish the Deriv signup",
      href: partnerCampaignUrl(context.content || "return", context.medium || "site"),
      headline: `The cookie only counts if signup finishes on Deriv. Referral code ${REFERRAL}. Demo first. 18+ only.`,
      external: true
    };
  }
  if (segment === "engaged") {
    return {
      segment,
      journey: "nurture",
      creative: "14-day-kit",
      cta: "Open the 14-day demo plan",
      href: "/kit",
      headline: "You have seen the desk. The next step is the 14-day plan, still on demo funds.",
      external: false
    };
  }
  const bold = context.experiment === "bold";
  return {
    segment,
    journey: "welcome",
    creative: bold ? "bold-hook" : "live-desk",
    cta: "Open a free Deriv demo",
    href: PARTNER,
    headline: bold
      ? "Open a free Deriv demo, then compare it with the public desk."
      : "Watch the live desk before you open an account. Demo funds only. Not a win-rate promise.",
    external: true
  };
}

export function recordEvent(events: RelayEvent[], consent: Consent, type: string, props?: Record<string, string>): RelayEvent[] {
  if (REJECTED_EVENTS.includes(type)) throw new PolicyError(`${type} is not a marketing event`);
  if (!ALLOWED_EVENTS.includes(type as EventType)) throw new PolicyError(`unknown event: ${type}`);
  if (type !== "consent_updated" && consent === "none") throw new PolicyError("consent required before storing events");
  if (props && "value" in props) throw new PolicyError("do not store typed values");
  return [...events, { type: type as EventType, props }];
}

export function campaignUrl(content: string, medium: string, experiment = "control"): string {
  const params = new URLSearchParams({
    utm_source: medium === "cpc" ? "paid" : "social",
    utm_medium: medium,
    utm_campaign: "call-pulse",
    utm_content: content,
    exp: experiment
  });
  return `${SITE}/lab?${params.toString()}`;
}

export function partnerCampaignUrl(content: string, medium: string, experiment = "control"): string {
  const url = new URL(PARTNER);
  url.searchParams.set("utm_source", medium === "cpc" ? "paid" : "social");
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", "call-pulse");
  url.searchParams.set("utm_content", content);
  url.searchParams.set("exp", experiment);
  return url.toString();
}

export function startUrl(content: string, medium: string): string {
  const params = new URLSearchParams({
    utm_source: medium === "cpc" ? "paid" : "social",
    utm_medium: medium,
    utm_campaign: "call-pulse",
    utm_content: content
  });
  return `${SITE}/start.html?${params.toString()}`;
}

export function noteRelay(type: string, props?: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("apex-relay-v1");
    if (!raw) return;
    const parsed = JSON.parse(raw) as { consent?: Consent; events?: RelayEvent[]; context?: CampaignContext };
    if (!parsed.consent || parsed.consent === "none") return;
    const events = recordEvent(parsed.events || [], parsed.consent, type, props);
    window.localStorage.setItem("apex-relay-v1", JSON.stringify({ ...parsed, events }));
  } catch {
    // A blocked write must not stop the click.
  }
}

export const campaignLinks = [
  ["TikTok bio (partner cookie)", partnerCampaignUrl("tt-bio", "tiktok")],
  ["Pinterest pin dest", partnerCampaignUrl("pin", "pinterest")],
  ["WhatsApp", partnerCampaignUrl("wa", "whatsapp")],
  ["TradingView", partnerCampaignUrl("tv", "tradingview")],
  ["LinkedIn trader", partnerCampaignUrl("li", "linkedin")],
  ["One-click start page", startUrl("start", "social")],
  ["Watch the desk first", campaignUrl("lab", "site")]
] as const;
