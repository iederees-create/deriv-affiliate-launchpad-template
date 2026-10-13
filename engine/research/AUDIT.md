# Engine audit (Step 3)

Audited 2026-10-13 at commit d2b2001: `engine/simulator.mjs`, `strategies.mjs`, `indicators.mjs`, `deriv.mjs`,
`run-paper.mjs`, `backtest.mjs`. No engine file was changed. `npx vitest run engine`: 2 files, 21 tests, all pass.

## Verdict

No look-ahead bias and no off-by-one in the signal/entry sequence. One defect stops the public paper record
from working at all (A1). The rest are modelling gaps that make results somewhat too optimistic or make the
paper record and a backtest disagree slightly.

## What is correct

- Indicators are causal. `priorHigh`/`priorLow` exclude the current candle (`indicators.mjs:141-158`); EMA, ATR,
  RSI, ADX and Bollinger at index i use candles 0..i only.
- Signal on the close of candle k, entry at the open of k+1 (`simulator.mjs:146-153`). `evaluate` never reads
  beyond index i in any of the four strategies.
- The forming candle is excluded (`simulator.mjs:130`).
- Stop is checked before target inside a candle, and a gap through a level fills at the open
  (`simulator.mjs:111-120`).
- Session hours use UTC consistently (`strategies.mjs:10-11`); nothing depends on the computer's time zone.

## Defects and gaps

| # | Severity | Where | What |
| --- | --- | --- | --- |
| A1 | High | `deriv.mjs:4` | The endpoint `wss://ws.derivws.com/websockets/v3` does not answer: HTTPS status 520, and `node engine/backtest.mjs ... --deriv 500` dies with a socket error (tested from this computer 2026-10-13). `wss://api.derivws.com/trading/v1/options/ws/public` does answer. If GitHub's runners get the same reply, every hourly run fails with "Deriv socket error" and no record is ever published. |
| A2 | High (cost) | `simulator.mjs:80-100` | Overnight swap is not charged. `gold-h1-trend`, `forex-breakout-retest` and `forex-rsi-bollinger-reversion` have no time exit and can hold for days. One night long EURUSD or gold costs about three typical spreads (see COSTS.md). |
| A3 | Medium (cost) | `simulator.mjs:44,82` | One spread per symbol for every hour. Measured spreads at 20:00-22:00 UTC are 6-15 times the daytime level for forex and about double for gold. Stops and time exits that fill in those hours are under-charged. |
| A4 | Medium | `strategies.mjs:69,76` | The "London" breakout uses fixed UTC hours. The 07:00 UTC candle is 08:00 in London in summer but 07:00 in winter, so for about five months a year the range ends an hour before the London open and the first signal candle is a pre-open candle. Not an error in the code, but the rule is "fixed UTC", not "London session". |
| A5 | Low | `simulator.mjs:47,84,112-120` | Half the spread is added to both entry and exit, which is right for mid-price candles. MT5 and histdata candles are bid prices. On bid data a sell's stop is really triggered one spread earlier than simulated and its target one spread later; buys are slightly favoured the other way. Total cost per completed trade is still one spread. The effect is about spread/risk per trade, small at measured spreads. |
| A6 | Low | `run-paper.mjs:43`, `simulator.mjs:140` | The paper runner recomputes indicators on the latest 500 candles each hour. EMA(200) has not fully converged in that window. Measured on the last 12,000 gold candles: 139 `gold-h1-trend` signals agree, 3 appear only with full history and 1 only with the 500-candle window (about 3%). The other three strategies gave identical signals. |
| A7 | Low | `strategies.mjs:87,91` with `simulator.mjs:51-63` | `gold-london-breakout` marks the day as traded when the signal fires, before the simulator decides whether the trade is valid. A signal skipped for cost or an invalid stop still uses up that day. |
| A8 | Low | `simulator.mjs:61` | The cost filter compares the spread with the risk distance only. For the reversion strategy the target (the Bollinger mid-line at signal time) can be much closer than the stop, so a trade can pass the filter while its possible reward is only a few spreads. |
| A9 | Low | `strategies.mjs:117`, `simulator.mjs:146` | Look-backs count candles, not hours, so "the last 5 candles" can span a weekend, and a signal on Friday's last candle enters at Monday's open. A real order would behave the same way; noted because weekend gaps then hit the stop at the open. |
| A10 | Info | `deriv.mjs:58` | With `adjust_start_time: 1` the first candle of every API reply has an off-the-hour timestamp (for example 21:00:27). It is 499 candles back, so it only touches indicator warm-up. |
| A11 | Info | data feeds | The Deriv API feed has no Sunday bars and restarts Monday 00:00 UTC; MT5 history has Sunday-evening bars. A backtest on MT5 data and the paper record on API data will not match candle for candle. |

## Proposed changes (not applied; none alters a frozen trading rule)

1. A1: make the endpoint configurable and default to the one that answers; let the workflow fail loudly with
   the HTTP status. Needs a decision because it changes what feeds the public record.
2. A2/A3: add optional `swap` and per-hour `spread` inputs to the simulator, default off, so the public record
   keeps its documented assumptions while research runs can switch them on.
3. A6: fetch 1,000+ candles in the paper runner, or state on the site that EMA(200) is computed on a 500-candle
   window.
4. A4, A7, A8: these are rule changes. Any fix needs a `rulesVersion` bump and a new record. For Step 4 they
   are tested as sensitivity variants only, labelled as such.

For Step 4, swap and per-scenario spreads are applied in a separate research harness that calls the unmodified
engine functions.
