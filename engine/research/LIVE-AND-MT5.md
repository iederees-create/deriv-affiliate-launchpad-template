# Paper record (Step 5) and MT5 Strategy Tester check (Step 6)

Checked 2026-10-13.

## Step 5: the public paper record

- `gh run list --workflow paper-trade.yml`: no runs at 14:13 UTC, three hours after the workflow was pushed
  (11:16 UTC). The workflow is listed as active. There is no `paper-data` branch.
- So there are no forward trades to compare with the backtest yet.
- Until this branch is merged the workflow would fail anyway: `main` still uses the Deriv address that
  returns HTTP 520 (AUDIT.md, A1). With the fix on this branch, `node engine/run-paper.mjs --data <scratch>`
  fetched 500 candles for all four symbols and wrote all five JSON files.
- GitHub can take hours to start the first scheduled run of a new workflow. If nothing has run a day after
  merging, start it once by hand from the Actions tab ("Run workflow").

### Stand-in check: paper feed against MT5 feed, same 12 months

The paper engine reads Deriv's API candles; the backtests used MT5 candles. `backtest/feed-compare.mjs` runs
the frozen rules on both for 2025-10-13 to 2026-10-13 (measured spread, no swap). These numbers are inside the
out-of-sample window and add no new evidence; they show how far the two feeds disagree.

| Strategy | Symbol | API-feed trades | MT5-feed trades | Same entry hour and side | API expectancy R | MT5 expectancy R |
|---|---|---|---|---|---|---|
| gold-h1-trend | XAUUSD | 62 | 67 | 43 | 0.027 | -0.027 |
| gold-london-breakout | XAUUSD | 78 | 79 | 77 | 0.160 | 0.144 |
| forex-breakout-retest | EURUSD | 165 | 135 | 101 | -0.178 | -0.172 |
| forex-breakout-retest | GBPUSD | 176 | 180 | 135 | -0.150 | -0.087 |
| forex-breakout-retest | USDJPY | 181 | 173 | 134 | -0.135 | -0.180 |
| forex-rsi-bollinger-reversion | EURUSD | 20 | 25 | 11 | 0.196 | 0.354 |
| forex-rsi-bollinger-reversion | GBPUSD | 23 | 28 | 18 | 0.177 | -0.212 |
| forex-rsi-bollinger-reversion | USDJPY | 34 | 36 | 28 | -0.777 | -0.515 |

The session-based London breakout is nearly identical on both feeds. For the indicator-based strategies only
about 55% to 80% of trades line up, because the feeds differ slightly bar by bar and the API feed has no
Sunday-evening bars. Expect the published paper record to drift from any MT5 chart or EA by this much.

## Step 6: `mt5/GoldH1Trend.mq5` in the Strategy Tester

- Compiled in MetaEditor (build 6230): 0 errors, 0 warnings. It had never been compiled before.
- Strategy Tester, XAUUSD H1, 2025-10-13 to 2026-10-12, "every tick based on real ticks" (Model=4), deposit
  100,000 USD, leverage 1:100. Real ticks were downloaded from DerivSVG-Server for every month of the range.
  The tester is a simulation; no order went to the account.
- To compare rules like for like, the EA's safety filters were switched off through inputs (daily loss limit
  100%, spread limit 100,000 points, margin use 100%). Strategy inputs were left at their defaults.
- Journal: `mt5/tester/GoldH1Trend-2025-10-13_2026-10-12.journal.log`. Comparison: `backtest/ea-compare.mjs`.

| | Trades | Win rate | Expectancy R | Total R | Profit factor | Max drawdown R |
|---|---|---|---|---|---|---|
| EA, Strategy Tester, real ticks | 63 | 30.2% | -0.106 | -6.71 | 0.85 | 8.7 |
| Engine, MT5 H1 candles, spread 0.17, no swap | 68 | 33.8% | 0.003 | 0.21 | 1.00 | 7.6 |

The tester's final balance was 93,048.95 USD from 100,000 (-6.95% at 1% risk per trade, swap included).
One year and 63 trades is far too few to say the EA is worse than the engine; the point is where they differ.

### Where they agree

- All 63 EA trades have an engine trade in the same hour and direction. Entry prices differ by a median of
  0.07 and at most 0.09. The signal logic and entry timing match.
- 60 of the 63 matched trades end the same way (stop or target).

### Where they disagree

1. **The EA drops signals that fire at the daily market break (EA defect).** Three times the order was refused
   with "Market closed" (2025-12-10 21:00, 2026-01-08 21:00, 2026-04-20 22:01) and the EA never retried,
   because it had already marked that candle as handled. The engine enters at the next candle's open after the
   break. Two of those three engine trades were winners.
2. **Different ATR.** The EA uses MT5's `iATR`, a plain average of the last 14 true ranges. The engine uses
   Wilder's smoothed ATR. Stop distances therefore differ a little, which flipped three outcomes (the EA won
   one the engine lost, and lost two the engine won) and changed when later trades could open (two more engine
   trades the EA did not take because it still held a position).
3. **Stop slippage.** The tester filled 44 stops a median of 0.09 beyond the stop price, and one 11.20 beyond
   it on a gap. The engine fills at the stop price unless the candle opens beyond it.
4. **Swap** is charged by the tester and not by the engine.

Across the matched trades the EA averaged 0.046 R per trade less than the engine.

### Proposed (not applied)

- EA: if an order is refused because the market is closed, try again on the next tick or next candle; and
  decide which ATR is "the rule" so the EA and the engine use the same one. Both are changes to a published
  strategy and need a version bump.
- Site wording: the EA's header still says "NOT COMPILED OR BACKTESTED BY ITS AUTHOR YET". It has now been
  compiled and run once in the tester, and that run lost 6.95%. Also, the reversion strategy's page note says
  "the target is usually closer than the stop"; in the backtests its average win is about 2 R, so the target
  is usually further away than the stop.
