import raw from "./strategies.json";

export type StrategyStatus = "building" | "paper-test" | "demo-forward-test" | "live-small" | "retired";
export type RecordKind = "none" | "paper" | "lab-board" | "external";

export type Strategy = {
  slug: string;
  name: string;
  status: StrategyStatus;
  market: string;
  timeframe: string;
  summary: string;
  rule: string[];
  risk: { perTrade: string; stop: string; dailyStop: string };
  breakEvenNote: string;
  record: { kind: RecordKind; label: string; url?: string; minimumTrades: number };
  limits: string[];
  updated: string;
};

export const strategies = raw as Strategy[];

export const statusLabels: Record<StrategyStatus, string> = {
  building: "In development - no results yet",
  "paper-test": "Paper-testing live (simulated)",
  "demo-forward-test": "Live on demo",
  "live-small": "Live, small size",
  retired: "Retired"
};

export function getStrategy(slug: string | undefined): Strategy | undefined {
  return strategies.find((item) => item.slug === slug);
}
