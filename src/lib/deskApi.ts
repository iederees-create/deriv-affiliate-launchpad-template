export type MarketCard = {
  id: string;
  symbol: string;
  name: string;
  market: "synthetic" | "forex";
  risk: "medium" | "high" | "very-high";
  session: "24/7" | "weekday";
  beginnerNote: string;
};

export type JourneyDay = {
  day: number;
  title: string;
  task: string;
  resource: string;
};

export type Journey = {
  id: string;
  title: string;
  account: "demo" | "live";
  rule: string;
  days: JourneyDay[];
};

export type Offer = {
  id: string;
  kind: "product" | "service";
  title: string;
  summary: string;
  audience: "beginner" | "member" | "affiliate";
  price: string;
  href: string;
};

export type OfferCatalog = {
  products: Offer[];
  services: Offer[];
};

export type Envelope<T> = {
  data: T;
  meta?: { generated_at?: string; source?: string };
};

export function apiUrl(resource: string): string {
  const base = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${base}api/v1/${resource.replace(/^\//, "")}`;
}

export function unwrapEnvelope<T>(body: unknown, resource: string): T {
  if (!body || typeof body !== "object" || !("data" in body)) {
    throw new Error(`Desk API ${resource} returned an invalid envelope.`);
  }
  return (body as Envelope<T>).data;
}

export async function loadResource<T>(resource: string, fetchImpl: typeof fetch = fetch): Promise<T> {
  const response = await fetchImpl(apiUrl(resource));
  if (!response.ok) {
    throw new Error(`Desk API ${resource} failed (${response.status}).`);
  }
  return unwrapEnvelope<T>(await response.json(), resource);
}

export function loadMarkets(fetchImpl?: typeof fetch) {
  return loadResource<MarketCard[]>("markets.json", fetchImpl);
}

export function loadJourney(fetchImpl?: typeof fetch) {
  return loadResource<Journey>("journey.json", fetchImpl);
}

export function loadOffers(fetchImpl?: typeof fetch) {
  return loadResource<OfferCatalog>("offers.json", fetchImpl);
}

export function finiteNonNegative(value: string | number): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function stakePlan(accountValue: string | number, riskPctValue: string | number) {
  const account = finiteNonNegative(accountValue);
  const riskPct = finiteNonNegative(riskPctValue);
  if (account === null || riskPct === null) return { error: "Enter a valid account size and risk percent." } as const;
  const risk = clamp(riskPct, 0, 5);
  return { account, riskPct: risk, perTrade: account * (risk / 100) } as const;
}

export function dailyBudget(accountValue: string | number, dailyPctValue: string | number, lostTodayValue: string | number) {
  const account = finiteNonNegative(accountValue);
  const dailyPct = finiteNonNegative(dailyPctValue);
  const lost = finiteNonNegative(lostTodayValue);
  if (account === null || dailyPct === null || lost === null) {
    return { error: "Enter a valid account size, daily percent, and amount already lost." } as const;
  }
  const daily = clamp(dailyPct, 0, 10);
  const dailyCap = account * (daily / 100);
  const remaining = Math.max(0, dailyCap - lost);
  return { dailyPct: daily, dailyCap, lost, remaining, stopNow: remaining <= 0 } as const;
}

export function drawdownRecovery(drawdownPctValue: string | number) {
  const raw = finiteNonNegative(drawdownPctValue);
  if (raw === null) return { error: "Enter a valid drawdown percent." } as const;
  const dd = clamp(raw, 0, 90);
  const recovery = dd >= 100 ? Number.POSITIVE_INFINITY : (1 / (1 - dd / 100) - 1) * 100;
  return { drawdownPct: dd, recovery } as const;
}

export function streakSurvival(accountValue: string | number, riskPctValue: string | number, lossesValue: string | number) {
  const plan = stakePlan(accountValue, riskPctValue);
  const losses = finiteNonNegative(lossesValue);
  if ("error" in plan || losses === null) return { error: "Enter a valid account, risk percent, and loss count." } as const;
  const streak = Math.min(30, Math.floor(losses));
  return { streak, afterStreak: plan.account * Math.pow(1 - plan.riskPct / 100, streak) } as const;
}

export function sampleExpectancy(winsValue: string | number, lossesValue: string | number, avgWinRValue: string | number, avgLossRValue: string | number) {
  const wins = finiteNonNegative(winsValue);
  const losses = finiteNonNegative(lossesValue);
  const avgWinR = finiteNonNegative(avgWinRValue);
  const avgLossR = finiteNonNegative(avgLossRValue);
  if (wins === null || losses === null || avgWinR === null || avgLossR === null) {
    return { error: "Enter valid win, loss, and R values." } as const;
  }
  const winCount = Math.floor(wins);
  const lossCount = Math.floor(losses);
  const sample = winCount + lossCount;
  const winRate = sample === 0 ? 0 : winCount / sample;
  const expectancy = sample === 0 ? 0 : winRate * avgWinR - (1 - winRate) * avgLossR;
  return { winCount, lossCount, sample, winRate, expectancy } as const;
}

export function journeyDay(journey: Journey, day: number): JourneyDay | null {
  if (!Number.isInteger(day) || day < 1) return null;
  return journey.days.find((item) => item.day === day) ?? null;
}

export function localDateIso(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function todayJourneyDay(startIso: string, now = new Date()): number {
  const start = new Date(`${startIso}T00:00:00`);
  if (Number.isNaN(start.getTime())) return 1;
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.floor((nowUtc - startUtc) / 86_400_000);
  return clamp(diff + 1, 1, 14);
}

export function siteHref(path: string): string {
  if (path === "whatsapp") return path;
  if (/^https:\/\//i.test(path)) return path;
  if (!path.startsWith("/") || path.startsWith("//")) return "#";
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path}`;
}
