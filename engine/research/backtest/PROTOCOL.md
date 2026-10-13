# Backtest protocol (Step 4), fixed before any result was looked at

Written 2026-10-13, committed before the first run of `run.mjs`. Rules under test are the four frozen
`rulesVersion: 1` strategies in `engine/strategies.mjs`, unchanged.

## Data and split

- Primary data: Deriv MT5 H1 export, 2017-01-01 to 2026-10-13 (`data/mt5/*_h1.csv`, bid prices).
- Split by entry time of each trade, fixed by calendar date:
  - in-sample (IS): 2017-01-01 to 2022-11-13 (oldest 60%)
  - validation (VAL): 2022-11-14 to 2024-10-28 (next 20%)
  - out-of-sample (OOS): 2024-10-29 to 2026-10-13 (latest 20%)
- The engine runs once over the whole series so indicators carry across boundaries; trades are then
  assigned to a segment by entry time.
- Older data (histdata 2006-2016 for forex, 2009-03 to 2016 for gold, a different price feed) is reported
  separately as "older period". It is not called out-of-sample and does not enter the verdict.
- OOS numbers are produced once, by the `--oos` run, after the IS/VAL and sensitivity output is committed.
  No rule or parameter is changed afterwards.

## Costs

- Spread scenarios per COSTS.md: measured (1x), 1.5x, 2x, and the engine default. The spread is set through the
  engine's `SPREADS` table at run time, so it also drives the engine's own cost filter. Gold uses the same
  absolute spread for all years, which over-charges the years when gold was cheaper.
- Swap is added per trade after the run: one charge for every 21:00 UTC rollover between entry and exit on
  Monday to Friday, tripled on Wednesday, at today's Deriv rates for the trade's side, divided by the trade's
  risk distance. Today's rates are applied to all years; real rates differed in the past.
- Headline cost level: measured spread plus swap. Not modelled: slippage, wider spreads at rollover and news,
  requotes.

## Reported for every strategy, symbol and segment

Trades, win rate, average win and average loss in R, expectancy in R, profit factor, maximum drawdown in R,
longest losing streak, results per calendar year, and a bootstrap 95% interval for expectancy (10,000 resamples).
For the two forex strategies the three pairs are also pooled.

## Sensitivity (IS and VAL only)

One parameter at a time is moved a step either side of the frozen value (EMA lengths, ATR multiples, reward
ratio, session hours, look-back, band width, RSI and ADX thresholds). A strategy whose result is positive only
at the frozen setting is overfit. The parameterised copies of the rules must reproduce the frozen engine's
trades exactly at default settings (checked by `variants.test.mjs`). Variants are never candidates for trading.

## Monte Carlo

Trade order shuffled 10,000 times (seeded), 1% of equity risked per trade, compounding. Reported: median and
5th to 95th percentile of maximum drawdown, and the share of runs that reach a 20% drawdown.

## Verdict rule

- "worth a small live trial": at least 100 OOS trades; OOS expectancy above zero at measured spread plus swap
  and still above zero at 2x spread plus swap; lower end of the OOS 95% interval above zero; IS and VAL
  expectancy both above zero; and at least 70% of sensitivity variants positive on IS+VAL.
- "inconclusive": fewer than 100 OOS trades, or OOS expectancy above zero but the interval includes zero.
- "no evidence of edge": everything else.
