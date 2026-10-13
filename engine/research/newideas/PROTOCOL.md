# New ideas: protocol, fixed before any result (2026-10-13)

These are NEW ideas, not the four frozen paper strategies. They were chosen from published research on
time-of-day effects, with round-number settings taken from the session clock, not from this data. No
hour-of-day statistics from this data were looked at before writing this file. (The spread-by-hour tables in
COSTS.md and the old strategies' results had been seen.)

## Why these ideas

The four tested strategies were chart-pattern rules with no reason to expect a return. These two have a
documented cause: who trades at which hour.

- **N1 gold-asia-session.** Research on intraday gold reports that gold's gains have tended to arrive
  outside London and New York hours. Rule: buy XAUUSD at the 00:00 UTC open, close at 07:00 UTC, Monday to
  Friday. Gold rose strongly over 2017-2026, so any long-only rule looks good. The rule only counts as a timing
  edge if it also beats holding gold through the rest of the day (a 07:00 to 20:00 UTC long, same stop).
- **N2 fx-local-hours.** Research on currency order flow reports that a currency tends to weaken during its
  own region's business hours and recover afterwards. One pooled strategy with six legs:
  - EURUSD: sell 07:00, close 15:00 UTC. Buy 15:00, close 20:00 UTC.
  - GBPUSD: sell 07:00, close 15:00 UTC. Buy 15:00, close 20:00 UTC.
  - USDJPY: buy 00:00, close 06:00 UTC. Sell 13:00, close 20:00 UTC.

Every trade: signal on the close of the candle before the entry hour, entry at the next open, protective stop
3 x ATR(14) from entry, no profit target, time exit. No trade is held overnight, so no swap applies. One
position per leg. Fixed UTC hours all year (no daylight-saving adjustment).

## Test

- Engine: the unmodified simulator (`engine/simulator.mjs`), same conventions as before.
- Data and split: Deriv MT5 H1. In-sample 2017-01-01 to 2022-11-13, validation to 2024-10-28, out-of-sample
  2024-10-29 to 2026-10-13. Stages are run and committed in that order: `--stage IS`, `--stage VAL`,
  `--stage OOS`. The out-of-sample stage is run once. Nothing is changed after any stage.
- Older context: histdata 2006-2016 (forex) and 2009-03 to 2016 (gold), shown with the in-sample stage. Its
  clock was verified against UTC only at sample months, and these ideas depend on the hour, so it is context only.
- Costs: measured spread (COSTS.md), and 2x. Not modelled: slippage on the stop, news-time spreads.
- Two hypotheses are tested (N1, and N2 pooled), so intervals are 97.5% instead of 95%.
- No parameter search. A single sensitivity check moves every session one hour earlier and one hour later;
  an effect that vanishes with a one-hour shift is treated as noise.
  The simulator closes time-exit trades at the UTC day change, so the two legs that enter at 00:00 cannot be
  moved earlier; their second variant is two hours later (02:00) instead.

## Verdict rule

"Worth a forward paper record and a small demo trial" needs all of: at least 100 out-of-sample trades;
out-of-sample expectancy above zero at measured spread and at 2x spread; lower end of the 97.5% interval above
zero; in-sample and validation expectancy above zero; positive at both one-hour shifts on in-sample plus
validation. N1 also needs the Asia window to beat the rest-of-day window in all three segments.
Anything less is "no evidence of edge" or, under 100 trades, "inconclusive". A pass earns a forward paper
record, not real money.
