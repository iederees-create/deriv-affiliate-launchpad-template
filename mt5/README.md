# Gold H1 Trend (MT5 Expert Advisor)

Simple trend-following EA for gold (XAUUSD) on the H1 chart. This is the strategy behind
`/strategies/gold-h1-trend`.

**Status: not compiled or backtested yet. There are no results, and none should be claimed.**

## The rules

- Long: 20 EMA crosses above the 50 EMA on a closed H1 candle, and that candle closed above the 200 EMA.
- Short: the mirror image, below the 200 EMA.
- Stop-loss 2x ATR(14). Take-profit 2x the stop distance.
- One position at a time. 1% of balance risked per trade. No new trades after a 3% closed loss in a day.
- Skips the trade if the spread is wide, the margin is tight, or the minimum lot would risk too much.
- No martingale, no grid, no averaging down.

## Install and compile

1. In MT5: File > Open Data Folder > `MQL5` > `Experts`. Copy `GoldH1Trend.mq5` there.
2. Open it in MetaEditor and press F7 to compile. Fix anything the compiler reports before going further.
3. In MT5, drag the EA onto an XAUUSD chart (any timeframe; it always reads H1) with Algo Trading enabled.

Check the exact gold symbol name on your Deriv MT5 account (it may carry a suffix). The EA works on whichever
symbol the chart uses.

## Test it properly, in this order

1. **Strategy Tester:** Every tick based on real ticks, XAUUSD, H1, at least 3-5 years, a deposit close to what
   you would really use. Look at profit factor, maximum drawdown, trade count and the longest losing streak, not
   just net profit.
2. **Out-of-sample check:** run it on a period you did not look at while choosing settings. If results collapse,
   the settings were fitted to the past.
3. **Demo forward test:** at least 4-8 weeks on a demo account.
4. **Publish the record:** connect the account to Myfxbook or an MQL5 Signal with read-only access.
5. **Update the page:** in `src/data/strategies.json`, set `status` to `demo-forward-test`, set the record `kind`
   to `external` with its `url`. A test in `src/data/strategies.test.ts` stops you marking it as tested without a
   record.

Do not move to a live account until the forward record has at least 100 closed trades and you are comfortable
with the worst drawdown in it. Start small. Any strategy can lose money.
