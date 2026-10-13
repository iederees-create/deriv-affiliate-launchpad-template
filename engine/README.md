# Paper-trading engine

Runs the strategies in `strategies.mjs` on Deriv candle prices and publishes every simulated trade.
The same simulator (`simulator.mjs`) is used for the hourly public record and for backtests.

## How the public record works

- `.github/workflows/paper-trade.yml` runs `node engine/run-paper.mjs` every hour.
- It fetches the last 500 H1 candles for gold, EUR/USD, GBP/USD and USD/JPY from Deriv's public WebSocket API.
- Results are committed to the `paper-data` branch (`paper/<slug>.json` and `paper/index.json`). The site reads
  them from raw.githubusercontent.com. Nothing is written to `main`, so the site is not redeployed each hour.
- The record starts at the first run. Nothing is back-filled, so results are forward results.
- Each commit on `paper-data` is a timestamped, tamper-evident history of the record.

## Simulation rules (deliberately conservative)

- Signal on the close of candle k, entry at the open of candle k+1.
- Half the assumed spread is paid on entry and half on exit, always against the trade.
- If a stop and a target are both touched in one candle, the stop is assumed to hit first.
- A candle that opens beyond a stop or target fills at the open, not at the level.
- A trade is skipped if the assumed cost is over 25% of its risk distance.
- Results are in R (multiples of initial risk). The spreads in `strategies.mjs` are assumptions, not measured.

## Changing a strategy

Rules are frozen per `rulesVersion`. If you change a rule, bump `rulesVersion` in `strategies.mjs`. The runner
refuses to continue an old record under new rules, so archive the old `paper-data` file first (move or rename
it) and let a new record start. Never edit trades by hand.

## Backtest on history

```
node engine/backtest.mjs --slug gold-h1-trend --symbol frxXAUUSD --csv xauusd_h1.csv --trades trades.csv
node engine/backtest.mjs --slug forex-breakout-retest --symbol frxEURUSD --deriv 5000
```

CSV columns: `time,open,high,low,close`. MT5 exports (`2024.01.02 03:00`) are read as UTC. Backtest results on data
you looked at while choosing rules are in-sample and are not evidence. Test on data you did not tune on.

## Limits

- Simulated on candle data. It cannot model real slippage, requotes, widening spreads at news, or partial fills.
- It runs on GitHub's schedule, which can be delayed by 15 minutes or more. Entries use candle opens, so a delayed
  run does not change fills.
- GitHub disables scheduled workflows after 60 days without repository activity. Re-enable it in the Actions tab.
- Tests: `npx vitest run engine`.
