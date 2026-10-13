# New ideas, stage IS (trades entered before 2022-11-14)

Measured spread. R = multiples of the 3 x ATR stop distance. See PROTOCOL.md.

## A. Results by segment

| Idea | Unit | Segment | Trades | Win rate | Avg win R | Avg loss R | Expectancy R | 97.5% interval | Profit factor | Max drawdown R | Longest losing streak | Stopped out |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N1 gold-asia-session | single | in-sample | 1381 | 47.1% | 0.36 | -0.36 | -0.024 | -0.052 to 0.004 | 0.88 | 37.9 | 10 | 4.6% |
| N2 fx-local-hours | pooled | in-sample | 9106 | 47.7% | 0.58 | -0.52 | 0.001 | -0.016 to 0.018 | 1.00 | 127.1 | 18 | 16.0% |
| N2 fx-local-hours | eurusd-europe-short | in-sample | 1521 | 48.7% | 0.81 | -0.75 | 0.013 | -0.041 to 0.067 | 1.04 | 34.3 | 10 | 31.0% |
| N2 fx-local-hours | eurusd-us-long | in-sample | 1521 | 47.5% | 0.40 | -0.38 | -0.006 | -0.036 to 0.023 | 0.97 | 34.4 | 10 | 6.0% |
| N2 fx-local-hours | gbpusd-europe-short | in-sample | 1522 | 47.2% | 0.88 | -0.74 | 0.024 | -0.032 to 0.080 | 1.06 | 23.9 | 10 | 31.5% |
| N2 fx-local-hours | gbpusd-us-long | in-sample | 1521 | 49.5% | 0.35 | -0.35 | -0.004 | -0.031 to 0.023 | 0.98 | 29.1 | 8 | 4.2% |
| N2 fx-local-hours | usdjpy-tokyo-long | in-sample | 1500 | 47.7% | 0.41 | -0.41 | -0.020 | -0.052 to 0.011 | 0.90 | 57.7 | 15 | 8.7% |
| N2 fx-local-hours | usdjpy-us-short | in-sample | 1521 | 45.8% | 0.61 | -0.51 | 0.000 | -0.042 to 0.044 | 1.00 | 31.9 | 13 | 14.3% |
| gold rest-of-day (comparison) | single | in-sample | 1501 | 45.7% | 0.88 | -0.75 | -0.007 | -0.066 to 0.050 | 0.98 | 57.7 | 11 | 34.4% |

## B. Expectancy R at 2x measured spread

| Idea | in-sample |
| --- | --- |
| N1 gold-asia-session | -0.042 |
| N2 fx-local-hours | -0.010 |
| gold rest-of-day (comparison) | -0.029 |

## C. Per calendar year: trades / expectancy R / total R

| Idea | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 |
| --- | --- | --- | --- | --- | --- | --- |
| N1 gold-asia-session | 132 / -0.01 / -1.0 | 255 / -0.09 / -23.2 | 257 / -0.01 / -2.9 | 257 / -0.01 / -3.6 | 256 / 0.03 / 7.5 | 224 / -0.04 / -10.0 |
| N2 fx-local-hours | 1532 / 0.02 / 34.2 | 1552 / -0.01 / -17.9 | 1553 / 0.00 / 0.1 | 1559 / -0.04 / -69.6 | 1560 / 0.01 / 20.5 | 1350 / 0.03 / 42.7 |
| gold rest-of-day (comparison) | 244 / 0.01 / 2.6 | 258 / -0.06 / -14.5 | 258 / 0.07 / 17.4 | 259 / 0.08 / 21.6 | 258 / -0.13 / -33.7 | 224 / -0.02 / -4.5 |

## D. One-hour shift check on in-sample + validation only

| Idea | One hour earlier (two hours later for 00:00 legs) | As specified | One hour later |
| --- | --- | --- | --- |
| N1 gold-asia-session | -0.015 | -0.024 | -0.011 |
| N2 fx-local-hours | 0.009 | 0.001 | -0.008 |

## E. Older period on a different feed (histdata to end of 2016). Context only: its clock is less certain.

| Idea | Unit | Period | Trades | Win rate | Avg win R | Avg loss R | Expectancy R | 97.5% interval | Profit factor | Max drawdown R | Longest losing streak | Stopped out |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N1 gold-asia-session | single | to 2016-12 | 2010 | 53.6% | 0.35 | -0.35 | 0.023 | -0.001 to 0.046 | 1.14 | 16.2 | 9 | 5.1% |
| N2 fx-local-hours | pooled | to 2016-12 | 17083 | 48.5% | 0.56 | -0.51 | 0.009 | -0.003 to 0.022 | 1.04 | 89.5 | 21 | 15.5% |
| gold rest-of-day (comparison) | single | to 2016-12 | 2014 | 41.7% | 0.90 | -0.78 | -0.082 | -0.132 to -0.031 | 0.82 | 164.8 | 19 | 39.5% |
