import { describe, expect, it } from 'vitest';
import {
  TRADINGVIEW_AFFILIATE_ID,
  TRADINGVIEW_PARTNER_URL,
  derivToTradingViewSymbol,
  tapeSymbolsFor,
  tradingViewInterval,
  tradingViewPartnerChartUrl,
  tradingViewToDerivSymbol,
} from './tradingView';

describe('TradingView Deriv symbols', () => {
  it('maps classic and 1-second volatility codes onto DERIV pages', () => {
    expect(derivToTradingViewSymbol('R_75')).toBe('DERIV:VOLATILITY_75_INDEX');
    expect(derivToTradingViewSymbol('1HZ75V')).toBe('DERIV:VOLATILITY_75_1S_INDEX');
    expect(derivToTradingViewSymbol('1HZ10V')).toBe('DERIV:VOLATILITY_10_1S_INDEX');
    expect(derivToTradingViewSymbol('frxEURUSD')).toBeNull();
  });

  it('maps widget clicks back onto desk symbols', () => {
    expect(tradingViewToDerivSymbol('DERIV:VOLATILITY_100_1S_INDEX')).toBe('1HZ100V');
    expect(tradingViewToDerivSymbol('DERIV:VOLATILITY_10_INDEX')).toBe('R_10');
    expect(tradingViewToDerivSymbol('NASDAQ:AAPL')).toBeNull();
  });

  it('uses the signalling chart interval on the embedded price chart', () => {
    expect(tradingViewInterval('M5')).toBe('5');
    expect(tradingViewInterval('M10')).toBe('10');
    expect(tradingViewInterval('M15')).toBe('15');
    expect(tradingViewInterval('H1')).toBe('60');
  });

  it('builds a volatility-only ticker tape', () => {
    const tape = tapeSymbolsFor(['1HZ75V', 'R_10', 'BOOM500', '1HZ75V']);
    expect(tape).toEqual([
      { proName: 'DERIV:VOLATILITY_75_1S_INDEX', title: 'Volatility 75 (1s)' },
      { proName: 'DERIV:VOLATILITY_10_INDEX', title: 'Volatility 10' },
    ]);
  });

  it('stamps the partner id onto TradingView chart links from the desk', () => {
    expect(TRADINGVIEW_AFFILIATE_ID).toBe('1171949');
    expect(TRADINGVIEW_PARTNER_URL).toContain('aff_id=1171949');
    expect(TRADINGVIEW_PARTNER_URL).toContain('aff_sub=apexdesk');
    expect(TRADINGVIEW_PARTNER_URL).toContain('source=lab');
    const chart = tradingViewPartnerChartUrl('DERIV:VOLATILITY_75_1S_INDEX');
    expect(chart).toContain('symbol=DERIV%3AVOLATILITY_75_1S_INDEX');
    expect(chart).toContain('aff_id=1171949');
  });
});
