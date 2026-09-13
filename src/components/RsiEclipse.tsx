import { formatRsi, rsiZone, zoneCopy, type RsiZone } from '../lib/liveBoard';

type RsiEclipseProps = {
  rsi: number | null | undefined;
  label: string;
  caption?: string;
  oversold?: number;
  overbought?: number;
  highlight?: boolean;
};

const START = -135;
const SWEEP = 270;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const start = polar(cx, cy, r, from);
  const end = polar(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

function zoneClass(zone: RsiZone): string {
  if (zone === 'buy') return 'is-buy';
  if (zone === 'sell') return 'is-sell';
  if (zone === 'near-buy') return 'is-near-buy';
  if (zone === 'near-sell') return 'is-near-sell';
  return '';
}

export function RsiEclipse({
  rsi,
  label,
  caption,
  oversold = 20,
  overbought = 80,
  highlight = false,
}: RsiEclipseProps) {
  const zone = rsiZone(rsi, oversold, overbought);
  const value = Number.isFinite(rsi) ? Math.min(100, Math.max(0, Number(rsi))) : null;
  const angle = value == null ? null : START + (value / 100) * SWEEP;
  const needle = angle == null ? null : polar(50, 54, 28, angle);
  const buyFrom = START;
  const buyTo = START + (oversold / 100) * SWEEP;
  const sellFrom = START + (overbought / 100) * SWEEP;
  const sellTo = START + SWEEP;

  return (
    <figure className={`rsi-eclipse ${zoneClass(zone)} ${highlight ? 'is-hot' : ''}`}>
      <svg viewBox="0 0 100 78" role="img" aria-label={`${label}: RSI ${formatRsi(rsi)}. ${zoneCopy(zone)}.`}>
        <path d={arcPath(50, 54, 32, START, START + SWEEP)} className="eclipse-track" />
        <path d={arcPath(50, 54, 32, buyFrom, buyTo)} className="eclipse-buy" />
        <path d={arcPath(50, 54, 32, sellFrom, sellTo)} className="eclipse-sell" />
        {needle ? (
          <>
            <line x1="50" y1="54" x2={needle.x} y2={needle.y} className="eclipse-needle" />
            <circle cx="50" cy="54" r="3.2" className="eclipse-hub" />
          </>
        ) : (
          <circle cx="50" cy="54" r="3.2" className="eclipse-hub is-empty" />
        )}
        <text x="18" y="76" className="eclipse-mark">{oversold}</text>
        <text x="82" y="76" className="eclipse-mark eclipse-mark-right">{overbought}</text>
      </svg>
      <figcaption>
        <strong>{formatRsi(rsi)}</strong>
        <span>{label}</span>
        <em>{caption || zoneCopy(zone)}</em>
      </figcaption>
    </figure>
  );
}
