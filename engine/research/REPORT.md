# Which strategy, if any, is worth a small live trial? (Step 7)

2026-10-13. Research, not financial advice. Any strategy can lose money.

## Answer

None. Two of the four strategies lose money after costs on data they had never seen. The two gold strategies
come out at zero within noise, and their ten-year record is flat to negative with deep drawdowns. There is no
strategy here to put real money on, and no result here should be advertised as an edge.

## Out-of-sample results

Deriv MT5 H1 data, 2024-10-29 to 2026-10-13, looked at once. Costs: spread measured on the account plus swap.

| Strategy | Symbol | OOS trades | Expectancy R after costs | Profit factor | Max drawdown R | Verdict |
|---|---|---|---|---|---|---|
| gold-h1-trend | XAUUSD | 120 | +0.006 | 1.01 | 8.0 | inconclusive (zero within noise) |
| gold-london-breakout | XAUUSD | 189 | +0.040 | 1.11 | 21.9 | inconclusive (zero within noise) |
| forex-breakout-retest | EURUSD | 291 | -0.102 | 0.86 | 40.1 | no evidence of edge |
| forex-breakout-retest | GBPUSD | 359 | -0.127 | 0.83 | 52.4 | no evidence of edge |
| forex-breakout-retest | USDJPY | 383 | -0.099 | 0.86 | 42.7 | no evidence of edge |
| forex-breakout-retest | three pairs pooled | 1,033 | -0.110 | 0.85 | 123.4 | no evidence of edge |
| forex-rsi-bollinger-reversion | EURUSD | 48 | -0.014 | 0.98 | 13.5 | inconclusive (under 100 trades) |
| forex-rsi-bollinger-reversion | GBPUSD | 58 | -0.282 | 0.64 | 21.4 | inconclusive (under 100 trades) |
| forex-rsi-bollinger-reversion | USDJPY | 61 | -0.533 | 0.39 | 33.3 | inconclusive (under 100 trades) |
| forex-rsi-bollinger-reversion | three pairs pooled | 167 | -0.297 | 0.62 | 61.3 | no evidence of edge |

95% intervals for expectancy: gold-h1-trend -0.25 to +0.26; gold-london-breakout -0.09 to +0.17;
breakout-retest pooled -0.20 to -0.03; reversion pooled -0.50 to -0.09. Full tables, cost scenarios, yearly
results, sensitivity and Monte Carlo: `backtest/out/results-oos.md`.

## Why "inconclusive" is not "promising"

- Both gold strategies were also flat on the seven years before the out-of-sample window (in-sample -0.019 R
  and 0.000 R; validation +0.099 R and -0.027 R), and fewer than half of nearby parameter settings were positive.
- Shuffling ten years of their trades at 1% risk gives a median maximum drawdown of 31% to 33% and a 99%
  chance of passing through a 20% drawdown, for an end result at or below the starting balance.
- The one MT5 Strategy Tester run of the gold EA on real ticks (last 12 months) lost 6.95%.

## How much forward testing would settle it

- gold-london-breakout: the per-trade spread of results is about 0.9 R. Confirming an edge of +0.04 R with
  ordinary confidence needs about 3,800 trades. At roughly 95 trades a year that is about 40 years.
- gold-h1-trend: results vary by about 1.4 R per trade. Even an edge of +0.10 R per trade, far more than
  observed, needs about 1,600 trades, about 26 years at 60 trades a year.
- The two forex strategies do not need more testing. They are negative in every segment, on the older
  independent data, and at nearly every parameter setting.

Forward paper testing is still worth running as a public record, but it cannot turn these four into
evidence of an edge on any useful timescale.

## Live-trial plan

Not proposed, because nothing passed. For reference, the bar a future strategy would have to clear before a
trial, and the shape the trial would take:

- Bar: at least 100 out-of-sample trades; expectancy above zero at measured costs and at double the spread;
  the lower end of the 95% interval above zero; positive in-sample and validation; most nearby parameter
  settings positive. Rules frozen before the out-of-sample data is looked at.
- Trial: demo account first for at least 30 trades to check fills against the backtest. Then live at 0.5%
  risk per trade, fixed rules, one position per symbol, no martingale and no size increase after losses.
  Stop for the day after losing 1.5% and stop the trial at a 10% drawdown from the starting balance or if
  results after 100 trades fall below the backtest's 5th-percentile path. Judge only after 100 trades.

## What was established along the way

- Data (DATA.md): 9.8 years of Deriv MT5 H1 history exported from the terminal, verified on UTC from 2017;
  17 to 21 years of histdata.com bars as an older check, with their undocumented clock convention measured
  and corrected; Deriv's public API gives one year only.
- Costs (COSTS.md): measured spreads are 2 to 4 times lower than the engine assumes; the unmodelled costs are
  swap and the 20:00-22:00 UTC rollover spreads. Costs are not why the strategies fail.
- Engine (AUDIT.md): no look-ahead bias. The Deriv address it used was dead; fixed on this branch.
- Paper record and EA (LIVE-AND-MT5.md): the paper Action has not run yet; the gold EA compiles and matches
  the engine's entries, but drops signals at the daily market break and uses a different ATR.

## Still unknown

- Whether the account pays a commission on forex and gold trades. If it does, every figure above is too kind.
- Historical swap rates and historical spreads; today's were applied to all years.
- Slippage and news-time spreads, which are not modelled and would lower results further.

## Reproduce

```
python3 engine/research/histdata-download.py && python3 engine/research/build-h1.py
node engine/research/backtest/run.mjs --oos
node engine/research/backtest/feed-compare.mjs
node engine/research/backtest/ea-compare.mjs
npx vitest run engine
```
The MT5 data needs `engine/research/mt5/ExportH1.mq5` run once in the terminal (see DATA.md).
