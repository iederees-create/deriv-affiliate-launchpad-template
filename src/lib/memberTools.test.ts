import { describe, expect, it } from 'vitest';
import { calculateDrawdown, calculateTradePlan, csvToJournal, journalStats, journalToCsv, sessionStatus, type JournalEntry } from './memberTools';

describe('member calculators', () => {
  it('calculates buy and sell trade plans', () => {
    expect(calculateTradePlan('buy', '100', '95', '110', '2')).toMatchObject({ risk: 10, reward: 20, ratio: 2 });
    expect(calculateTradePlan('sell', '100', '105', '90', '2')).toMatchObject({ risk: 10, reward: 20, ratio: 2 });
  });
  it('rejects invalid geometry and values', () => {
    expect(calculateTradePlan('buy', '100', '110', '90', '2')).toHaveProperty('error');
    expect(calculateTradePlan('buy', '', '95', '110', '2')).toHaveProperty('error');
  });
  it('calculates drawdown and asymmetric recovery', () => {
    expect(calculateDrawdown('1000', '800')).toMatchObject({ amount: 200, percentage: 20, recovery: 25, progress: 80 });
    expect(calculateDrawdown('1000', '1200')).toHaveProperty('error');
    expect(calculateDrawdown('1000', '0')).toMatchObject({ amount: 1000, percentage: 100, recovery: Infinity, progress: 0 });
  });
});

describe('journal data', () => {
  const entries: JournalEntry[] = [
    { id:'1',date:'2026-08-24',market:'Demo A',account:'demo',direction:'buy',entry:1,exit:2,size:1,result:20,setup:'A',notes:'comma, quote " safe',lessons:'Wait' },
    { id:'2',date:'2026-08-24',market:'Demo B',account:'demo',direction:'sell',entry:2,exit:1,size:1,result:-10,setup:'B',notes:'',lessons:'Stop' }
  ];
  it('calculates journal statistics', () => expect(journalStats(entries)).toMatchObject({ total:2, winRate:50, averageWin:20, averageLoss:10, net:10, profitFactor:2 }));
  it('round-trips CSV including punctuation', () => expect(csvToJournal(journalToCsv(entries))).toEqual(entries));
  it('rejects malformed CSV', () => expect(() => csvToJournal('wrong,headers\n1,2')).toThrow());
});

describe('session planner', () => {
  it('returns all IANA-zone sessions with local labels', () => {
    const result = sessionStatus(new Date('2026-08-24T08:00:00Z'));
    expect(result).toHaveLength(4);
    expect(result.map((item) => item.zone)).toEqual(['Australia/Sydney','Asia/Tokyo','Europe/London','America/New_York']);
    expect(result.every((item) => item.localHours.includes('–'))).toBe(true);
  });
});
