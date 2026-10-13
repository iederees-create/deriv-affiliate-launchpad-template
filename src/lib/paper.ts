// Public paper-trading records. The hourly GitHub Action writes them to the `paper-data` branch.
export const PAPER_DATA_BASE = (
  import.meta.env.VITE_PAPER_DATA_URL ||
  "https://raw.githubusercontent.com/iederees-create/deriv-affiliate-launchpad-template/paper-data/paper"
).replace(/\/+$/, "");

export type PaperStats = {
  trades: number;
  wins: number;
  losses: number;
  winRate: number | null;
  avgWinR: number | null;
  avgLossR: number | null;
  expectancyR: number | null;
  profitFactor: number | null;
  totalR: number;
  maxDrawdownR: number;
  longestLosingStreak: number;
};

export type PaperTrade = {
  id: number;
  symbol: string;
  side: "buy" | "sell";
  tag: string;
  signalTime: number;
  entryTime: number;
  entry: number;
  sl: number;
  tp: number;
  exitTime: number;
  exit: number;
  exitReason: "sl" | "tp" | "time";
  r: number;
};

export type PaperRecordData = {
  slug: string;
  name: string;
  startedAt: string;
  lastRunAt: string | null;
  assumptions: { spread: Record<string, number>; maxCostR: number; entry: string; note: string };
  symbols: Record<string, { lastProcessed: number | null; open: { side: string; entryTime: number } | null }>;
  skipped: { cost: number; invalid: number };
  trades: PaperTrade[];
  stats: PaperStats;
};

export type PaperSummary = {
  slug: string;
  name: string;
  startedAt: string;
  lastRunAt: string | null;
  symbols: string[];
  open: Array<{ symbol: string; side: string; entryTime: number }>;
  stats: PaperStats;
};

export type PaperIndex = { updatedAt: string; strategies: PaperSummary[] };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`No record yet (${res.status})`);
  return (await res.json()) as T;
}

export const fetchPaperRecord = (slug: string) => getJson<PaperRecordData>(`${PAPER_DATA_BASE}/${slug}.json`);
export const fetchPaperIndex = () => getJson<PaperIndex>(`${PAPER_DATA_BASE}/index.json`);

export function formatEpoch(epoch: number): string {
  return `${new Date(epoch * 1000).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export function isStale(lastRunAt: string | null, now = Date.now(), maxHours = 3): boolean {
  if (!lastRunAt) return true;
  return now - Date.parse(lastRunAt) > maxHours * 3600 * 1000;
}

export function prettySymbol(symbol: string): string {
  const s = symbol.replace(/^frx/, "");
  return s.length === 6 ? `${s.slice(0, 3)}/${s.slice(3)}` : s;
}
