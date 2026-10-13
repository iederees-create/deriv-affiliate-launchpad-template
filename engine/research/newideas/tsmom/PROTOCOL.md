# N3 time-series momentum: protocol, fixed before any result (2026-10-13)

A NEW idea, third hypothesis in this folder. Source: Moskowitz, Ooi and Pedersen, "Time Series Momentum",
Journal of Financial Economics, 2012. The rule below is the paper's headline rule, not chosen from this data.
No monthly or daily return statistics from this data were looked at before writing this file.

## Rule

At each month end, for each of XAUUSD, EURUSD, GBPUSD and USDJPY: if the price is above where it was 12 months
earlier, be long for the next month; otherwise be short. Position size is scaled so each instrument targets
the same risk: 10% a year, using the volatility of the previous 60 daily returns, capped at 3x leverage.
The portfolio is the equal-weight average of the four. Rebalanced monthly. No stops.

## Data

Daily closes (last H1 close of each UTC day) from histdata to 2016-12-31 and the Deriv MT5 export from
2017-01-01. Forex from 2006, gold from 2009-03.

## Costs

- Spread: the measured spread, paid on every change of position (in proportion to the change).
- Swap: today's Deriv rates per night for the side held, every calendar day (the triple Wednesday charge
  covers the weekend), applied to all years. Real rates were different in the past; this is an assumption.
- Results are shown before costs, after spread, and after spread and swap. The verdict uses the last.

## Evidence window and verdict

The rule was published in 2012, so months from 2013-01 onward are unseen by the rule's authors. That is the
evidence window. Earlier months are context. With three hypotheses now tested in this folder, the interval is 98.3%.

"Worth a forward paper record" needs all of: portfolio mean monthly return after spread and swap above zero
in the evidence window; lower end of the 98.3% bootstrap interval above zero; and above zero in both halves of
the evidence window (2013-01 to 2019-11, and 2019-12 onward). Otherwise "no evidence of edge".
A pass earns a forward paper record, not real money.

One sensitivity check only: 6-month and 9-month look-backs, reported but not used for the verdict.
