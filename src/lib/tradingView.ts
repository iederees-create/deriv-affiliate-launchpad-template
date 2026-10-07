/** Map Deriv websocket symbols onto TradingView DERIV: pages. */
import { marketLabel } from './liveBoard';

export const TRADINGVIEW_CHART_HOST = 'https://www.tradingview.com';
export const TRADINGVIEW_LAB_CHART_URL =
  'https://iederees-create.github.io/deriv-affiliate-launchpad-template/lab';
export const TRADINGVIEW_DERIV_CONNECT_URL =
  'https://deriv.com/trading-platforms/tradingview?t=VQGBGPUYGJDZ';
/** TradingView Partner Program — iedereesfrancis, affiliate id 1171949. */
export const TRADINGVIEW_AFFILIATE_ID = '1171949';
export const TRADINGVIEW_PARTNER_URL =
  'https://www.tradingview.com/?aff_id=1171949&aff_sub=apexdesk&source=lab';

export function tradingViewPartnerChartUrl(symbol: string): string {
  const params = new URLSearchParams({
    symbol,
    aff_id: TRADINGVIEW_AFFILIATE_ID,
    aff_sub: 'apexdesk',
    source: 'lab',
  });
  return `${TRADINGVIEW_CHART_HOST}/chart/?${params.toString()}`;
}

const ONE_SEC = /^1HZ(\d+)V$/i;
const CLASSIC = /^R_(\d+)$/i;
const TV_SYMBOL = /^DERIV:VOLATILITY_(\d+)(_1S)?_INDEX$/i;

export function derivToTradingViewSymbol(code: string | null | undefined): string | null {
  const raw = String(code || '').trim();
  if (!raw) return null;
  const oneSec = raw.match(ONE_SEC);
  if (oneSec) return `DERIV:VOLATILITY_${oneSec[1]}_1S_INDEX`;
  const classic = raw.match(CLASSIC);
  if (classic) return `DERIV:VOLATILITY_${classic[1]}_INDEX`;
  return null;
}

export function tradingViewToDerivSymbol(symbol: string | null | undefined): string | null {
  const raw = String(symbol || '').trim();
  if (!raw) return null;
  const match = raw.match(TV_SYMBOL);
  if (!match) return null;
  return match[2] ? `1HZ${match[1]}V` : `R_${match[1]}`;
}

export function tradingViewInterval(timeframe: string | null | undefined): string {
  const tf = String(timeframe || '').toUpperCase();
  if (tf === 'M5') return '5';
  if (tf === 'M10') return '10';
  if (tf === 'M15') return '15';
  if (tf === 'M30') return '30';
  if (tf === 'H1') return '60';
  if (tf === 'H4') return '240';
  if (tf === 'D1') return 'D';
  return '5';
}

export function tapeSymbolsFor(codes: string[]): Array<{ proName: string; title: string }> {
  const seen = new Set<string>();
  const rows: Array<{ proName: string; title: string }> = [];
  for (const code of codes) {
    const proName = derivToTradingViewSymbol(code);
    if (!proName || seen.has(proName)) continue;
    seen.add(proName);
    rows.push({ proName, title: marketLabel(code) });
  }
  return rows;
}
