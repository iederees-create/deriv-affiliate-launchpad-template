# N3 time-series momentum: result

12-month look-back, monthly rebalance, four instruments, 10% risk target each. See PROTOCOL.md.
Monthly returns of the equal-weight portfolio, as a share of account equity.

## Portfolio

| Window | Months | Mean per month, before costs | After spread | After spread and swap | Per year (after all costs) | 98.3% interval for the monthly mean | Sharpe ratio | Months positive | Max drawdown |
|---|---|---|---|---|---|---|---|---|---|
| Context: before 2013 | 83 | +0.06% | +0.06% | -0.18% | -2.1% | -0.72% to +0.39% | -0.29 | 51% | 27.1% |
| Evidence: 2013-01 onward | 166 | +0.14% | +0.14% | +0.01% | +0.1% | -0.36% to +0.38% | 0.02 | 47% | 26.4% |
| First half: 2013-01 to 2019-11 | 83 | +0.07% | +0.07% | -0.03% | -0.4% | -0.52% to +0.48% | -0.05 | 47% | 21.6% |
| Second half: 2019-12 onward | 83 | +0.21% | +0.21% | +0.05% | +0.6% | -0.47% to +0.56% | 0.08 | 47% | 16.1% |

## Per instrument, evidence window (2013-01 onward)

| Instrument | Months | Before costs, per year | After spread and swap, per year | Months long | Average leverage |
|---|---|---|---|---|---|
| XAUUSD | 166 | +3.9% | +1.5% | 61% | 0.73 |
| EURUSD | 166 | +0.3% | -1.6% | 47% | 1.48 |
| GBPUSD | 166 | -1.2% | -2.9% | 46% | 1.31 |
| USDJPY | 166 | +3.8% | +3.4% | 69% | 1.27 |

## Per calendar year, portfolio after spread and swap

| Year | Months | Return |
|---|---|---|
| 2006 | 11 | -3.8% |
| 2007 | 12 | +3.3% |
| 2008 | 12 | +11.3% |
| 2009 | 12 | -8.5% |
| 2010 | 12 | -9.7% |
| 2011 | 12 | -4.5% |
| 2012 | 12 | -2.9% |
| 2013 | 12 | +6.6% |
| 2014 | 12 | +4.4% |
| 2015 | 12 | +7.1% |
| 2016 | 12 | -9.7% |
| 2017 | 12 | -3.9% |
| 2018 | 12 | -6.9% |
| 2019 | 12 | +0.3% |
| 2020 | 12 | +0.2% |
| 2021 | 12 | -6.1% |
| 2022 | 12 | +11.8% |
| 2023 | 12 | -5.9% |
| 2024 | 12 | -4.2% |
| 2025 | 12 | +8.8% |
| 2026 | 10 | -1.3% |

## Sensitivity (not used for the verdict): evidence window, after spread and swap

| Look-back | Mean per month | Per year | Sharpe ratio |
|---|---|---|---|
| 6 months | +0.05% | +0.6% | 0.08 |
| 9 months | +0.01% | +0.1% | 0.01 |
| 12 months | +0.01% | +0.1% | 0.02 |

## Verdict (rule fixed in PROTOCOL.md)

**no evidence of edge**

- pass: mean monthly return after all costs above zero in the evidence window
- FAIL: lower end of the 98.3% interval above zero
- FAIL: above zero in the first half (2013-01 to 2019-11)
- pass: above zero in the second half (2019-12 onward)
