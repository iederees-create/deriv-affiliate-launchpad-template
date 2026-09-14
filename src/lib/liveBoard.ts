export const MARKET_ORDER = [
  '1HZ10V', '1HZ15V', '1HZ25V', '1HZ30V', '1HZ50V',
  '1HZ75V', '1HZ90V', '1HZ100V', '1HZ150V', '1HZ250V',
  'R_10', 'R_25', 'R_50', 'R_75', 'R_100',
  'frxXAUUSD', 'frxXAGUSD', 'frxXPDUSD', 'frxXPTUSD',
] as const;

export const TIMEFRAME_ORDER = ['M5', 'M10', 'M15', 'M30', 'H1', 'H2', 'H4', 'H8', 'D1'] as const;

export const MARKET_LABELS: Record<string, string> = {
  '1HZ10V': 'Volatility 10 (1s)',
  '1HZ15V': 'Volatility 15 (1s)',
  '1HZ25V': 'Volatility 25 (1s)',
  '1HZ30V': 'Volatility 30 (1s)',
  '1HZ50V': 'Volatility 50 (1s)',
  '1HZ75V': 'Volatility 75 (1s)',
  '1HZ90V': 'Volatility 90 (1s)',
  '1HZ100V': 'Volatility 100 (1s)',
  '1HZ150V': 'Volatility 150 (1s)',
  '1HZ250V': 'Volatility 250 (1s)',
  R_10: 'Volatility 10',
  R_25: 'Volatility 25',
  R_50: 'Volatility 50',
  R_75: 'Volatility 75',
  R_100: 'Volatility 100',
  frxXAUUSD: 'Gold',
  frxXAGUSD: 'Silver',
  frxXPDUSD: 'Palladium',
  frxXPTUSD: 'Platinum',
};

export const TIMEFRAME_LABELS: Record<string, string> = {
  M5: '5 minute',
  M10: '10 minute',
  M15: '15 minute',
  M30: '30 minute',
  H1: '1 hour',
  H2: '2 hour',
  H4: '4 hour',
  H8: '8 hour',
  D1: 'Daily',
};

export const TIMEFRAME_SHORT: Record<string, string> = {
  M5: '5m',
  M10: '10m',
  M15: '15m',
  M30: '30m',
  H1: '1h',
  H2: '2h',
  H4: '4h',
  H8: '8h',
  D1: '1d',
};

export type RsiZone = 'buy' | 'near-buy' | 'mid' | 'near-sell' | 'sell' | 'empty';

export function marketLabel(symbol?: string | null): string {
  if (!symbol) return '—';
  return MARKET_LABELS[symbol] || symbol;
}

export function timeframeLabel(id?: string | null): string {
  if (!id) return '—';
  return TIMEFRAME_LABELS[id] || id;
}

export function rsiZone(rsi: number | null | undefined, oversold = 20, overbought = 80): RsiZone {
  if (!Number.isFinite(rsi)) return 'empty';
  const value = Number(rsi);
  if (value <= oversold) return 'buy';
  if (value >= overbought) return 'sell';
  if (value <= oversold + 10) return 'near-buy';
  if (value >= overbought - 10) return 'near-sell';
  return 'mid';
}

export function zoneCopy(zone: RsiZone): string {
  if (zone === 'buy') return 'Buy zone';
  if (zone === 'sell') return 'Sell zone';
  if (zone === 'near-buy') return 'Getting cheap';
  if (zone === 'near-sell') return 'Getting stretched';
  if (zone === 'mid') return 'Waiting';
  return 'No reading yet';
}

export function durationLabel(duration?: number | null, unit?: string | null): string {
  const n = Number(duration);
  if (!Number.isFinite(n) || n <= 0) return 'matches the signalling chart';
  if (unit === 't') return `${n} tick${n === 1 ? '' : 's'}`;
  if (unit === 'm') return `${n} minute${n === 1 ? '' : 's'}`;
  if (unit === 'h') return `${n} hour${n === 1 ? '' : 's'}`;
  if (unit === 'd') return `${n} day${n === 1 ? '' : 's'}`;
  return `${n}`;
}

export function formatRsi(rsi: number | null | undefined): string {
  if (!Number.isFinite(rsi)) return '—';
  return Number(rsi).toFixed(1);
}

export function hottestMarket(
  rsiByMarket: Record<string, Record<string, number | null>> | null | undefined,
  oversold = 20,
  overbought = 80,
): string | null {
  if (!rsiByMarket) return null;
  let best: { symbol: string; score: number } | null = null;
  for (const symbol of MARKET_ORDER) {
    const frames = rsiByMarket[symbol];
    if (!frames) continue;
    for (const tf of TIMEFRAME_ORDER) {
      const rsi = frames[tf];
      if (!Number.isFinite(rsi)) continue;
      const score = Math.max(oversold - Number(rsi), Number(rsi) - overbought);
      if (!best || score > best.score) best = { symbol, score };
    }
  }
  return best ? best.symbol : null;
}

const OPENED = /Opened (CALL|PUT) from ([A-Z0-9]+) RSI on ([A-Z0-9_]+)/i;

export function parseOpenedEvent(message: string): { side: 'CALL' | 'PUT'; timeframe: string; symbol: string } | null {
  const match = String(message || '').match(OPENED);
  if (!match) return null;
  return {
    side: match[1].toUpperCase() === 'PUT' ? 'PUT' : 'CALL',
    timeframe: match[2].toUpperCase(),
    symbol: match[3].toUpperCase(),
  };
}
