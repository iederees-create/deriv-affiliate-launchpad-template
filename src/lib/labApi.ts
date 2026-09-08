export const LAB_API_BASE = (import.meta.env.VITE_LAB_API_URL || 'https://product-listing-server.onrender.com').replace(/\/+$/, '');

export type LabKind = 'tick_rise_fall' | 'text_notes' | 'script_upload';

export type LabStrategy = {
  id: number;
  memberName: string;
  memberEmail?: string;
  memberId?: string;
  title: string;
  description: string;
  kind: LabKind;
  symbol: string;
  durationTicks: number;
  lookback: number;
  stake: number;
  status: string;
  createdAt: string;
  executable: boolean;
  scriptFilename?: string;
  scriptText?: string;
};

export type LabBoard = {
  enabled: boolean;
  demoOnly: boolean;
  allowRealMode: boolean;
  live: boolean;
  paused?: boolean;
  run: {
    id: number;
    strategyId: number;
    status: string;
    stopReason: string;
    startedAt?: string;
    scheduledEndAt?: string | null;
    pauseUntil?: string | null;
    pauseReason?: string;
    tradeCount: number;
    winCount: number;
    lossCount: number;
    consecutiveLosses: number;
    winRate?: number;
    realizedPnl: number;
    startingBalance?: number | null;
    currentBalance?: number | null;
    percentReturn?: number | null;
    lastTick: number | null;
    lastTickAt: string | null;
    isVirtual: boolean;
  } | null;
  strategy: LabStrategy | null;
  trades: Array<{ id: number; contractType: string; symbol: string; stake: number; profit: number; status: string; openedAt: string; closedAt?: string }>;
  events: Array<{ id: number; type: string; message: string; createdAt: string }>;
  queue: LabStrategy[];
  strategies?: LabStrategy[];
  operator?: { email: string; name: string };
  affiliateLink?: string;
  referralCode?: string;
  recap?: {
    headline: string;
    body: string;
    startedAt?: string | null;
    endsAt?: string | null;
    made: number;
    trades: number;
    wins: number;
    losses: number;
    winRate: number;
  } | null;
};

async function parse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && data.error) || `Lab request failed (${res.status})`);
  }
  return data;
}

export async function fetchLabBoard(): Promise<LabBoard> {
  const res = await fetch(`${LAB_API_BASE}/api/lab/live`);
  return parse(res);
}

export async function submitLabStrategy(token: string, body: {
  title: string;
  description: string;
  kind: LabKind;
  symbol?: string;
  durationTicks?: number;
  lookback?: number;
  stake?: number;
  scriptFilename?: string;
  scriptText?: string;
}) {
  const res = await fetch(`${LAB_API_BASE}/api/lab/strategies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return parse(res);
}

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchOperatorBoard(token: string): Promise<LabBoard> {
  const res = await fetch(`${LAB_API_BASE}/api/lab/operator/status`, {
    headers: authHeaders(token),
  });
  return parse(res);
}

export async function startOperatorRun(token: string, strategyId: number): Promise<LabBoard> {
  const res = await fetch(`${LAB_API_BASE}/api/lab/operator/start`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ strategyId }),
  });
  return parse(res);
}

export type AffiliateClaim = {
  id: number;
  memberEmail: string;
  derivLoginid: string;
  derivClientId: string;
  status: 'pending' | 'verified' | 'rejected';
  source: string;
  note: string;
  createdAt: string;
  verifiedAt: string | null;
};

export async function fetchAffiliateStatus(token: string) {
  const res = await fetch(`${LAB_API_BASE}/api/lab/affiliate/status`, { headers: authHeaders(token) });
  return parse(res) as Promise<{ affiliateLink: string; claim: AffiliateClaim | null; canDownload: boolean }>;
}

export async function claimAffiliate(token: string, loginId: string) {
  const res = await fetch(`${LAB_API_BASE}/api/lab/affiliate/claim`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ loginId }),
  });
  return parse(res) as Promise<{ claim: AffiliateClaim; canDownload: boolean; affiliateLink: string }>;
}

export async function downloadStrategyPack(token: string) {
  const res = await fetch(`${LAB_API_BASE}/api/lab/strategy-pack`, { headers: authHeaders(token) });
  return parse(res) as Promise<{ title: string; markdown: string; symbol: string; lookback: number; durationTicks: number; stake: number }>;
}

export async function fetchAffiliateClaims(token: string) {
  const res = await fetch(`${LAB_API_BASE}/api/lab/operator/affiliates`, { headers: authHeaders(token) });
  return parse(res) as Promise<{ affiliates: AffiliateClaim[] }>;
}

export async function verifyAffiliateClaim(token: string, id: number, status: 'verified' | 'rejected' | 'pending', note?: string) {
  const res = await fetch(`${LAB_API_BASE}/api/lab/operator/affiliates/verify`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ id, status, note }),
  });
  return parse(res) as Promise<{ claim: AffiliateClaim }>;
}

export async function stopOperatorRun(token: string, reason?: string): Promise<LabBoard> {
  const res = await fetch(`${LAB_API_BASE}/api/lab/operator/stop`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reason }),
  });
  return parse(res);
}
