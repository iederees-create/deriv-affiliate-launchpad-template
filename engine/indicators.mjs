// Causal indicators: the value at index i only ever uses candles 0..i.
// Candles are { epoch, open, high, low, close } with epoch in seconds (candle open time).

const blank = (n) => new Array(n).fill(NaN);

export function sma(values, n) {
  const out = blank(values.length);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= n) sum -= values[i - n];
    if (i >= n - 1) out[i] = sum / n;
  }
  return out;
}

// EMA seeded with the SMA of the first n values (MT5 seeds differently; the difference fades quickly).
export function ema(values, n) {
  const out = blank(values.length);
  if (values.length < n) return out;
  let seed = 0;
  for (let i = 0; i < n; i++) seed += values[i];
  let prev = seed / n;
  out[n - 1] = prev;
  const a = 2 / (n + 1);
  for (let i = n; i < values.length; i++) {
    prev = values[i] * a + prev * (1 - a);
    out[i] = prev;
  }
  return out;
}

export function trueRange(candles, i) {
  const c = candles[i];
  if (i === 0) return c.high - c.low;
  const pc = candles[i - 1].close;
  return Math.max(c.high - c.low, Math.abs(c.high - pc), Math.abs(c.low - pc));
}

// Wilder ATR.
export function atr(candles, n) {
  const out = blank(candles.length);
  if (candles.length <= n) return out;
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += trueRange(candles, i);
  let prev = sum / n;
  out[n] = prev;
  for (let i = n + 1; i < candles.length; i++) {
    prev = (prev * (n - 1) + trueRange(candles, i)) / n;
    out[i] = prev;
  }
  return out;
}

// Wilder RSI.
export function rsi(closes, n) {
  const out = blank(closes.length);
  if (closes.length <= n) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= n; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  let ag = gain / n;
  let al = loss / n;
  out[n] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  for (let i = n + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    ag = (ag * (n - 1) + (d > 0 ? d : 0)) / n;
    al = (al * (n - 1) + (d < 0 ? -d : 0)) / n;
    out[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  }
  return out;
}

export function bollinger(closes, n, k) {
  const mid = sma(closes, n);
  const upper = blank(closes.length);
  const lower = blank(closes.length);
  for (let i = n - 1; i < closes.length; i++) {
    let v = 0;
    for (let j = i - n + 1; j <= i; j++) v += (closes[j] - mid[i]) ** 2;
    const sd = Math.sqrt(v / n);
    upper[i] = mid[i] + k * sd;
    lower[i] = mid[i] - k * sd;
  }
  return { mid, upper, lower };
}

// Wilder ADX.
export function adx(candles, n) {
  const len = candles.length;
  const out = blank(len);
  if (len < 2 * n) return out;
  const pdm = new Array(len).fill(0);
  const mdm = new Array(len).fill(0);
  const tr = new Array(len).fill(0);
  for (let i = 1; i < len; i++) {
    const up = candles[i].high - candles[i - 1].high;
    const down = candles[i - 1].low - candles[i].low;
    pdm[i] = up > down && up > 0 ? up : 0;
    mdm[i] = down > up && down > 0 ? down : 0;
    tr[i] = trueRange(candles, i);
  }
  let sTR = 0;
  let sP = 0;
  let sM = 0;
  for (let i = 1; i <= n; i++) {
    sTR += tr[i];
    sP += pdm[i];
    sM += mdm[i];
  }
  const dxAt = () => {
    const pdi = sTR === 0 ? 0 : (100 * sP) / sTR;
    const mdi = sTR === 0 ? 0 : (100 * sM) / sTR;
    const sum = pdi + mdi;
    return sum === 0 ? 0 : (100 * Math.abs(pdi - mdi)) / sum;
  };
  const dx = blank(len);
  dx[n] = dxAt();
  for (let i = n + 1; i < len; i++) {
    sTR = sTR - sTR / n + tr[i];
    sP = sP - sP / n + pdm[i];
    sM = sM - sM / n + mdm[i];
    dx[i] = dxAt();
  }
  let sumDx = 0;
  for (let i = n; i <= 2 * n - 1; i++) sumDx += dx[i];
  let prev = sumDx / n;
  out[2 * n - 1] = prev;
  for (let i = 2 * n; i < len; i++) {
    prev = (prev * (n - 1) + dx[i]) / n;
    out[i] = prev;
  }
  return out;
}

// Highest high / lowest low of the n candles BEFORE index i (excludes i itself).
export function priorHigh(candles, n) {
  const out = blank(candles.length);
  for (let i = n; i < candles.length; i++) {
    let m = -Infinity;
    for (let j = i - n; j < i; j++) m = Math.max(m, candles[j].high);
    out[i] = m;
  }
  return out;
}

export function priorLow(candles, n) {
  const out = blank(candles.length);
  for (let i = n; i < candles.length; i++) {
    let m = Infinity;
    for (let j = i - n; j < i; j++) m = Math.min(m, candles[j].low);
    out[i] = m;
  }
  return out;
}
