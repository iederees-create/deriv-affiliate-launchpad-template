import { describe, expect, it } from 'vitest';
import {
  durationLabel,
  hottestMarket,
  marketLabel,
  parseOpenedEvent,
  rsiZone,
  zoneCopy,
} from './liveBoard';

describe('live board helpers', () => {
  it('maps broker codes to names people recognise', () => {
    expect(marketLabel('1HZ75V')).toBe('Volatility 75 (1s)');
    expect(marketLabel('R_100')).toBe('Volatility 100');
    expect(marketLabel('frxEURUSD')).toBe('EUR/USD');
    expect(marketLabel('cryBTCUSD')).toBe('BTC/USD');
    expect(marketLabel('unknown')).toBe('unknown');
  });

  it('labels RSI bands in plain language', () => {
    expect(rsiZone(12)).toBe('buy');
    expect(rsiZone(88)).toBe('sell');
    expect(rsiZone(28)).toBe('near-buy');
    expect(rsiZone(72)).toBe('near-sell');
    expect(rsiZone(51)).toBe('mid');
    expect(rsiZone(null)).toBe('empty');
    expect(zoneCopy('buy')).toBe('Buy zone');
  });

  it('says contract length in minutes, not ticks, when the unit is minutes', () => {
    expect(durationLabel(5, 'm')).toBe('5 minutes');
    expect(durationLabel(1, 'h')).toBe('1 hour');
    expect(durationLabel(8, 't')).toBe('8 ticks');
  });

  it('picks the market whose RSI is closest to a 20/80 signal', () => {
    const symbol = hottestMarket({
      R_10: { M5: 48, M10: 49, M15: 50, M30: 49, H1: 51, H2: 50, H4: 50, H8: 50, D1: 50 },
      '1HZ75V': { M5: 18, M10: 40, M15: 44, M30: 50, H1: 52, H2: 48, H4: 48, H8: 47, D1: 47 },
    });
    expect(symbol).toBe('1HZ75V');
  });

  it('reads the signalling chart out of a trade-opened event', () => {
    expect(parseOpenedEvent('Opened CALL from M5 RSI on 1HZ75V at stake 0.35 (5m).')).toEqual({
      side: 'CALL',
      timeframe: 'M5',
      symbol: '1HZ75V',
    });
  });
});
