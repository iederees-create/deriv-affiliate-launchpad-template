# Backtest results (IS+VAL+OOS)

Deriv MT5 H1 data. Costs: measured spread plus swap unless a column says otherwise. R = multiples of the risk on each trade.
Out-of-sample rows are the only evidence. In-sample and validation rows are context.

## A. Results by segment (measured spread + swap)

| Strategy | Symbol | Segment | Trades | Win rate | Avg win R | Avg loss R | Expectancy R | 95% interval | Profit factor | Max drawdown R | Longest losing streak |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gold-h1-trend | frxXAUUSD | in-sample | 361 | 34.1% | 1.98 | -1.05 | -0.019 | -0.164 to 0.134 | 0.97 | 48.1 | 13 |
| gold-h1-trend | frxXAUUSD | validation | 117 | 37.6% | 1.95 | -1.02 | 0.099 | -0.160 to 0.359 | 1.16 | 9.2 | 8 |
| gold-h1-trend | frxXAUUSD | out-of-sample | 120 | 34.2% | 1.98 | -1.02 | 0.006 | -0.247 to 0.263 | 1.01 | 8.0 | 8 |
| gold-london-breakout | frxXAUUSD | in-sample | 800 | 44.9% | 0.96 | -0.78 | 0.000 | -0.067 to 0.068 | 1.00 | 31.0 | 10 |
| gold-london-breakout | frxXAUUSD | validation | 277 | 41.2% | 1.09 | -0.81 | -0.027 | -0.148 to 0.096 | 0.94 | 21.4 | 9 |
| gold-london-breakout | frxXAUUSD | out-of-sample | 189 | 47.1% | 0.84 | -0.68 | 0.040 | -0.085 to 0.166 | 1.11 | 21.9 | 10 |
| forex-breakout-retest | frxEURUSD | in-sample | 1063 | 32.1% | 1.97 | -1.03 | -0.065 | -0.148 to 0.021 | 0.91 | 81.4 | 18 |
| forex-breakout-retest | frxEURUSD | validation | 352 | 30.1% | 1.97 | -1.03 | -0.127 | -0.266 to 0.020 | 0.82 | 54.7 | 18 |
| forex-breakout-retest | frxEURUSD | out-of-sample | 291 | 31.3% | 1.98 | -1.05 | -0.102 | -0.263 to 0.065 | 0.86 | 40.1 | 15 |
| forex-breakout-retest | frxGBPUSD | in-sample | 1096 | 31.5% | 1.98 | -1.02 | -0.076 | -0.161 to 0.007 | 0.89 | 106.0 | 15 |
| forex-breakout-retest | frxGBPUSD | validation | 335 | 30.7% | 1.97 | -1.03 | -0.105 | -0.248 to 0.049 | 0.85 | 57.1 | 18 |
| forex-breakout-retest | frxGBPUSD | out-of-sample | 359 | 30.4% | 1.98 | -1.05 | -0.127 | -0.269 to 0.022 | 0.83 | 52.4 | 12 |
| forex-breakout-retest | frxUSDJPY | in-sample | 1087 | 33.3% | 1.97 | -1.03 | -0.030 | -0.113 to 0.054 | 0.96 | 81.6 | 14 |
| forex-breakout-retest | frxUSDJPY | validation | 363 | 30.9% | 2.00 | -1.02 | -0.087 | -0.229 to 0.063 | 0.88 | 53.4 | 19 |
| forex-breakout-retest | frxUSDJPY | out-of-sample | 383 | 30.3% | 2.00 | -1.01 | -0.099 | -0.238 to 0.041 | 0.86 | 42.7 | 15 |
| forex-breakout-retest | pooled | in-sample | 3246 | 32.3% | 1.97 | -1.02 | -0.057 | -0.104 to -0.009 | 0.92 | 220.6 | 22 |
| forex-breakout-retest | pooled | validation | 1050 | 30.6% | 1.98 | -1.02 | -0.106 | -0.189 to -0.021 | 0.85 | 157.4 | 20 |
| forex-breakout-retest | pooled | out-of-sample | 1033 | 30.6% | 1.99 | -1.03 | -0.110 | -0.195 to -0.026 | 0.85 | 123.4 | 19 |
| forex-rsi-bollinger-reversion | frxEURUSD | in-sample | 170 | 30.6% | 2.03 | -1.02 | -0.087 | -0.296 to 0.133 | 0.88 | 37.0 | 12 |
| forex-rsi-bollinger-reversion | frxEURUSD | validation | 60 | 26.7% | 2.10 | -1.02 | -0.186 | -0.520 to 0.173 | 0.75 | 19.4 | 9 |
| forex-rsi-bollinger-reversion | frxEURUSD | out-of-sample | 48 | 33.3% | 2.02 | -1.03 | -0.014 | -0.417 to 0.420 | 0.98 | 13.5 | 11 |
| forex-rsi-bollinger-reversion | frxGBPUSD | in-sample | 149 | 36.2% | 1.88 | -1.02 | 0.032 | -0.194 to 0.261 | 1.05 | 10.7 | 6 |
| forex-rsi-bollinger-reversion | frxGBPUSD | validation | 69 | 44.9% | 2.09 | -1.02 | 0.377 | 0.012 to 0.765 | 1.67 | 6.9 | 5 |
| forex-rsi-bollinger-reversion | frxGBPUSD | out-of-sample | 58 | 24.1% | 2.06 | -1.03 | -0.282 | -0.611 to 0.074 | 0.64 | 21.4 | 10 |
| forex-rsi-bollinger-reversion | frxUSDJPY | in-sample | 182 | 33% | 2.00 | -1.07 | -0.054 | -0.262 to 0.161 | 0.92 | 15.1 | 11 |
| forex-rsi-bollinger-reversion | frxUSDJPY | validation | 74 | 28.4% | 1.88 | -1.04 | -0.209 | -0.506 to 0.094 | 0.72 | 22.3 | 7 |
| forex-rsi-bollinger-reversion | frxUSDJPY | out-of-sample | 61 | 14.8% | 2.31 | -1.02 | -0.533 | -0.811 to -0.210 | 0.39 | 33.3 | 25 |
| forex-rsi-bollinger-reversion | pooled | in-sample | 501 | 33.1% | 1.97 | -1.04 | -0.040 | -0.163 to 0.089 | 0.94 | 30.7 | 11 |
| forex-rsi-bollinger-reversion | pooled | validation | 203 | 33.5% | 2.03 | -1.02 | -0.003 | -0.202 to 0.203 | 1.00 | 23.7 | 8 |
| forex-rsi-bollinger-reversion | pooled | out-of-sample | 167 | 23.4% | 2.10 | -1.03 | -0.297 | -0.496 to -0.088 | 0.62 | 61.3 | 14 |

## B. Expectancy (R) under each cost scenario

| Strategy | Symbol | Segment | 1x, no swap | 1x + swap | 1.5x + swap | 2x + swap | Engine default spread + swap | Avg nights held |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gold-h1-trend | frxXAUUSD | in-sample | 0.012 | -0.019 | -0.036 | -0.051 | -0.054 | 1.32 |
| gold-h1-trend | frxXAUUSD | validation | 0.119 | 0.099 | 0.085 | 0.081 | 0.080 | 1.26 |
| gold-h1-trend | frxXAUUSD | out-of-sample | 0.014 | 0.006 | 0.004 | 0.002 | 0.002 | 1.16 |
| gold-london-breakout | frxXAUUSD | in-sample | 0.000 | 0.000 | -0.013 | -0.023 | -0.025 | 0.01 |
| gold-london-breakout | frxXAUUSD | validation | -0.027 | -0.027 | -0.051 | -0.059 | -0.060 | 0.02 |
| gold-london-breakout | frxXAUUSD | out-of-sample | 0.040 | 0.040 | 0.037 | 0.035 | 0.034 | 0.01 |
| forex-breakout-retest | frxEURUSD | in-sample | -0.052 | -0.065 | -0.076 | -0.090 | -0.117 | 0.70 |
| forex-breakout-retest | frxEURUSD | validation | -0.111 | -0.127 | -0.146 | -0.150 | -0.173 | 0.87 |
| forex-breakout-retest | frxEURUSD | out-of-sample | -0.089 | -0.102 | -0.108 | -0.118 | -0.142 | 0.94 |
| forex-breakout-retest | frxGBPUSD | in-sample | -0.066 | -0.076 | -0.083 | -0.094 | -0.135 | 0.71 |
| forex-breakout-retest | frxGBPUSD | validation | -0.092 | -0.105 | -0.129 | -0.143 | -0.161 | 0.83 |
| forex-breakout-retest | frxGBPUSD | out-of-sample | -0.113 | -0.127 | -0.154 | -0.150 | -0.186 | 0.69 |
| forex-breakout-retest | frxUSDJPY | in-sample | -0.018 | -0.030 | -0.048 | -0.066 | -0.093 | 0.68 |
| forex-breakout-retest | frxUSDJPY | validation | -0.090 | -0.087 | -0.097 | -0.102 | -0.123 | 0.79 |
| forex-breakout-retest | frxUSDJPY | out-of-sample | -0.103 | -0.099 | -0.102 | -0.115 | -0.156 | 0.69 |
| forex-breakout-retest | pooled | in-sample | -0.045 | -0.057 | -0.069 | -0.083 | -0.115 | 0.69 |
| forex-breakout-retest | pooled | validation | -0.098 | -0.106 | -0.124 | -0.131 | -0.152 | 0.83 |
| forex-breakout-retest | pooled | out-of-sample | -0.103 | -0.110 | -0.122 | -0.128 | -0.162 | 0.76 |
| forex-rsi-bollinger-reversion | frxEURUSD | in-sample | -0.075 | -0.087 | -0.094 | -0.100 | -0.113 | 0.76 |
| forex-rsi-bollinger-reversion | frxEURUSD | validation | -0.170 | -0.186 | -0.193 | -0.200 | -0.229 | 0.67 |
| forex-rsi-bollinger-reversion | frxEURUSD | out-of-sample | 0.005 | -0.014 | -0.021 | -0.028 | -0.042 | 0.83 |
| forex-rsi-bollinger-reversion | frxGBPUSD | in-sample | 0.043 | 0.032 | 0.004 | -0.001 | -0.054 | 0.77 |
| forex-rsi-bollinger-reversion | frxGBPUSD | validation | 0.390 | 0.377 | 0.347 | 0.340 | 0.322 | 0.74 |
| forex-rsi-bollinger-reversion | frxGBPUSD | out-of-sample | -0.272 | -0.282 | -0.290 | -0.296 | -0.369 | 0.55 |
| forex-rsi-bollinger-reversion | frxUSDJPY | in-sample | -0.022 | -0.054 | -0.081 | -0.091 | -0.118 | 0.70 |
| forex-rsi-bollinger-reversion | frxUSDJPY | validation | -0.180 | -0.209 | -0.215 | -0.221 | -0.245 | 0.69 |
| forex-rsi-bollinger-reversion | frxUSDJPY | out-of-sample | -0.517 | -0.533 | -0.538 | -0.550 | -0.563 | 0.43 |
| forex-rsi-bollinger-reversion | pooled | in-sample | -0.021 | -0.040 | -0.060 | -0.067 | -0.097 | 0.74 |
| forex-rsi-bollinger-reversion | pooled | validation | 0.017 | -0.003 | -0.016 | -0.022 | -0.047 | 0.70 |
| forex-rsi-bollinger-reversion | pooled | out-of-sample | -0.282 | -0.297 | -0.303 | -0.313 | -0.347 | 0.59 |

## C. Results per calendar year (measured spread + swap): trades / expectancy R / total R

| Strategy | Symbol | 2017 (IS) | 2018 (IS) | 2019 (IS) | 2020 (IS) | 2021 (IS) | 2022 (IS*) | 2023 (VAL) | 2024 (VAL*) | 2025 (OOS) | 2026 (OOS) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gold-h1-trend | frxXAUUSD | 52 / 0.20 / 10.4 | 73 / -0.19 / -13.8 | 66 / -0.27 / -17.8 | 55 / -0.05 / -2.8 | 62 / 0.08 / 4.7 | 65 / 0.14 / 9.1 | 57 / 0.29 / 16.7 | 60 / -0.13 / -7.7 | 51 / 0.09 / 4.7 | 57 / 0.04 / 2.2 |
| gold-london-breakout | frxXAUUSD | 123 / -0.07 / -8.2 | 144 / 0.01 / 1.7 | 131 / -0.05 / -6.5 | 125 / -0.04 / -5.0 | 132 / -0.00 / -0.3 | 163 / 0.11 / 18.6 | 140 / -0.03 / -4.1 | 141 / 0.03 / 4.3 | 110 / -0.12 / -13.5 | 57 / 0.23 / 12.9 |
| forex-breakout-retest | frxEURUSD | 174 / -0.10 / -17.5 | 199 / -0.01 / -2.7 | 161 / -0.23 / -36.2 | 189 / 0.07 / 12.4 | 177 / -0.08 / -14.7 | 180 / -0.09 / -15.6 | 189 / -0.12 / -23.3 | 176 / -0.11 / -19.7 | 157 / -0.02 / -3.7 | 104 / -0.21 / -22.3 |
| forex-breakout-retest | frxGBPUSD | 155 / 0.00 / 0.2 | 190 / -0.08 / -15.9 | 164 / -0.15 / -24.2 | 197 / -0.07 / -14.5 | 207 / -0.10 / -20.0 | 203 / -0.07 / -14.7 | 186 / -0.09 / -16.3 | 156 / -0.10 / -15.6 | 188 / -0.11 / -20.3 | 144 / -0.16 / -23.3 |
| forex-breakout-retest | frxUSDJPY | 183 / -0.04 / -8.3 | 179 / -0.04 / -7.5 | 172 / -0.10 / -17.0 | 180 / -0.03 / -5.8 | 196 / -0.11 / -21.2 | 203 / 0.15 / 30.5 | 184 / -0.18 / -33.6 | 196 / -0.00 / -0.5 | 207 / -0.02 / -4.8 | 133 / -0.26 / -34.0 |
| forex-breakout-retest | pooled | 512 / -0.05 / -25.5 | 568 / -0.05 / -26.0 | 497 / -0.16 / -77.4 | 566 / -0.01 / -7.9 | 580 / -0.10 / -56.0 | 586 / 0.00 / 0.2 | 559 / -0.13 / -73.1 | 528 / -0.07 / -35.8 | 552 / -0.05 / -28.8 | 381 / -0.21 / -79.6 |
| forex-rsi-bollinger-reversion | frxEURUSD | 31 / -0.07 / -2.0 | 25 / -0.59 / -14.8 | 31 / -0.12 / -3.9 | 35 / -0.18 / -6.2 | 20 / 0.00 / 0.1 | 30 / 0.33 / 10.0 | 25 / -0.32 / -7.9 | 38 / -0.11 / -4.2 | 25 / -0.28 / -7.0 | 18 / 0.52 / 9.3 |
| forex-rsi-bollinger-reversion | frxGBPUSD | 19 / -0.07 / -1.3 | 24 / 0.29 / 6.9 | 38 / 0.15 / 5.7 | 29 / 0.12 / 3.4 | 17 / -0.16 / -2.7 | 24 / -0.11 / -2.8 | 30 / 0.08 / 2.4 | 43 / 0.30 / 13.0 | 33 / -0.33 / -10.8 | 19 / 0.03 / 0.5 |
| forex-rsi-bollinger-reversion | frxUSDJPY | 28 / -0.03 / -0.8 | 22 / -0.47 / -10.3 | 32 / 0.20 / 6.5 | 30 / -0.01 / -0.4 | 35 / 0.14 / 4.8 | 39 / -0.22 / -8.7 | 33 / -0.34 / -11.3 | 44 / -0.16 / -7.0 | 30 / -0.80 / -23.9 | 24 / -0.28 / -6.8 |
| forex-rsi-bollinger-reversion | pooled | 78 / -0.05 / -4.1 | 71 / -0.26 / -18.2 | 101 / 0.08 / 8.3 | 94 / -0.03 / -3.1 | 72 / 0.03 / 2.2 | 93 / -0.02 / -1.4 | 88 / -0.19 / -16.8 | 125 / 0.01 / 1.8 | 88 / -0.47 / -41.7 | 61 / 0.05 / 3.0 |

`*` 2022 is in-sample until 13 November and validation after; 2024 is validation until 28 October and out-of-sample after.

## D. Older period on a different feed (histdata, to end of 2016; measured spread + swap). Context only.

| Strategy | Symbol | Period | Trades | Win rate | Avg win R | Avg loss R | Expectancy R | 95% interval | Profit factor | Max drawdown R | Longest losing streak |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gold-h1-trend | frxXAUUSD | 2009-03 to 2016-12 | 471 | 38% | 1.97 | -1.04 | 0.104 | -0.024 to 0.235 | 1.16 | 28.3 | 12 |
| gold-london-breakout | frxXAUUSD | 2009-03 to 2016-12 | 1131 | 42.3% | 1.02 | -0.81 | -0.033 | -0.091 to 0.028 | 0.93 | 54.5 | 16 |
| forex-breakout-retest | frxEURUSD | 2006-01 to 2016-12 | 1849 | 32.8% | 2.00 | -1.02 | -0.031 | -0.095 to 0.034 | 0.96 | 85.5 | 15 |
| forex-breakout-retest | frxGBPUSD | 2006-01 to 2016-12 | 1905 | 32.3% | 1.99 | -1.02 | -0.046 | -0.110 to 0.018 | 0.93 | 117.3 | 17 |
| forex-breakout-retest | frxUSDJPY | 2006-01 to 2016-12 | 1811 | 32.3% | 1.99 | -1.04 | -0.059 | -0.125 to 0.008 | 0.92 | 118.1 | 15 |
| forex-breakout-retest | pooled | 2006-01 to 2016-12 | 5565 | 32.5% | 1.99 | -1.02 | -0.045 | -0.083 to -0.008 | 0.93 | 268.4 | 20 |
| forex-rsi-bollinger-reversion | frxEURUSD | 2006-01 to 2016-12 | 287 | 32.8% | 2.05 | -1.03 | -0.022 | -0.190 to 0.153 | 0.97 | 30.2 | 12 |
| forex-rsi-bollinger-reversion | frxGBPUSD | 2006-01 to 2016-12 | 305 | 30.5% | 1.94 | -1.03 | -0.127 | -0.283 to 0.030 | 0.82 | 56.6 | 9 |
| forex-rsi-bollinger-reversion | frxUSDJPY | 2006-01 to 2016-12 | 274 | 33.9% | 1.94 | -1.04 | -0.028 | -0.197 to 0.144 | 0.96 | 24.4 | 9 |
| forex-rsi-bollinger-reversion | pooled | 2006-01 to 2016-12 | 866 | 32.3% | 1.98 | -1.03 | -0.061 | -0.158 to 0.036 | 0.91 | 78.0 | 18 |

## E. Parameter sensitivity on in-sample + validation (measured spread + swap). Never uses out-of-sample trades.

### gold-h1-trend: 4 of 10 neighbouring settings positive

| Setting | Trades | Expectancy R | Profit factor | Total R |
| --- | --- | --- | --- | --- |
| frozen rules | 478 | 0.010 | 1.02 | 4.9 |
| fast=15 | 536 | -0.057 | 0.92 | -30.3 |
| fast=25 | 467 | -0.038 | 0.94 | -18.0 |
| slow=40 | 523 | -0.014 | 0.98 | -7.2 |
| slow=60 | 460 | 0.009 | 1.01 | 4.1 |
| trend=150 | 511 | 0.013 | 1.02 | 6.4 |
| trend=250 | 447 | 0.000 | 1.00 | -0.2 |
| atrMult=1.5 | 538 | -0.004 | 0.99 | -2.1 |
| atrMult=2.5 | 403 | 0.055 | 1.08 | 22.1 |
| rr=1.5 | 501 | -0.017 | 0.97 | -8.5 |
| rr=2.5 | 463 | 0.046 | 1.06 | 21.2 |

### gold-london-breakout: 4 of 13 neighbouring settings positive

| Setting | Trades | Expectancy R | Profit factor | Total R |
| --- | --- | --- | --- | --- |
| frozen rules | 1077 | -0.007 | 0.98 | -7.8 |
| firstHour=6, lastHour=9, rangeEndHour=5 | 1276 | -0.014 | 0.97 | -18.4 |
| firstHour=8, lastHour=11, rangeEndHour=7 | 893 | 0.001 | 1.00 | 0.9 |
| londonClock=true | 1019 | 0.008 | 1.02 | 8.0 |
| lastHour=9 | 944 | -0.010 | 0.98 | -9.7 |
| lastHour=11 | 1191 | -0.015 | 0.97 | -17.8 |
| rr=1 | 1077 | -0.010 | 0.97 | -11.0 |
| rr=2 | 1077 | 0.023 | 1.05 | 24.6 |
| exitHour=18 | 1077 | -0.017 | 0.96 | -18.3 |
| exitHour=22 | 1077 | -0.011 | 0.98 | -11.6 |
| minWidth=0.25 | 1077 | -0.007 | 0.98 | -7.8 |
| minWidth=0.75 | 1077 | -0.007 | 0.98 | -7.8 |
| maxWidth=2 | 604 | 0.007 | 1.01 | 3.9 |
| maxWidth=4 | 1188 | -0.004 | 0.99 | -5.0 |

### forex-breakout-retest (three pairs pooled): 0 of 10 neighbouring settings positive

| Setting | Trades | Expectancy R | Profit factor | Total R |
| --- | --- | --- | --- | --- |
| frozen rules | 4296 | -0.069 | 0.90 | -296.6 |
| lookback=15 | 4764 | -0.064 | 0.91 | -304.4 |
| lookback=25 | 3910 | -0.089 | 0.87 | -349.3 |
| trend=80 | 4462 | -0.074 | 0.89 | -332.3 |
| trend=120 | 4163 | -0.069 | 0.90 | -288.1 |
| tolerance=0.15 | 4002 | -0.073 | 0.90 | -291.6 |
| tolerance=0.35 | 4390 | -0.057 | 0.92 | -248.9 |
| buffer=0.25 | 4656 | -0.095 | 0.87 | -440.7 |
| buffer=0.75 | 3951 | -0.036 | 0.95 | -143.9 |
| rr=1.5 | 4741 | -0.073 | 0.88 | -347.0 |
| rr=2.5 | 3935 | -0.059 | 0.92 | -233.3 |

### forex-rsi-bollinger-reversion (three pairs pooled): 1 of 10 neighbouring settings positive

| Setting | Trades | Expectancy R | Profit factor | Total R |
| --- | --- | --- | --- | --- |
| frozen rules | 704 | -0.029 | 0.96 | -20.5 |
| period=15 | 683 | -0.036 | 0.95 | -24.4 |
| period=25 | 708 | -0.014 | 0.98 | -10.0 |
| width=1.75 | 726 | -0.041 | 0.94 | -29.7 |
| width=2.25 | 663 | -0.036 | 0.95 | -24.1 |
| rsiLow=25 | 177 | -0.004 | 0.99 | -0.8 |
| rsiLow=35 | 1821 | -0.100 | 0.85 | -182.7 |
| adxMax=15 | 121 | 0.021 | 1.03 | 2.5 |
| adxMax=25 | 1577 | -0.052 | 0.93 | -81.5 |
| atrMult=1 | 772 | -0.036 | 0.95 | -27.6 |
| atrMult=2 | 675 | -0.031 | 0.95 | -20.8 |

## F. Monte Carlo: trade order shuffled 10,000 times, 1% of equity risked per trade (measured spread + swap)

| Strategy | Symbol | Trades used | Trades | Max drawdown 5th pct | Median | 95th pct | Chance of a 20% drawdown | End equity (start = 1) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gold-h1-trend | frxXAUUSD | out-of-sample | 120 | 10.2% | 14.8% | 21.7% | 10.1% | 1.00 |
| gold-h1-trend | frxXAUUSD | all 2017-2026 | 598 | 22.5% | 31.4% | 43.5% | 98.8% | 1.00 |
| gold-london-breakout | frxXAUUSD | out-of-sample | 189 | 6.6% | 9.8% | 15.1% | 0.1% | 1.07 |
| gold-london-breakout | frxXAUUSD | all 2017-2026 | 1266 | 23.8% | 33.1% | 44.5% | 99.5% | 0.94 |
| forex-breakout-retest | frxEURUSD | out-of-sample | 291 | 29.3% | 35.5% | 43.6% | 100.0% | 0.72 |
| forex-breakout-retest | frxEURUSD | all 2017-2026 | 1706 | 80.2% | 82.7% | 86.4% | 100.0% | 0.20 |
| forex-breakout-retest | frxGBPUSD | out-of-sample | 359 | 39.9% | 44.6% | 51.7% | 100.0% | 0.61 |
| forex-breakout-retest | frxGBPUSD | all 2017-2026 | 1790 | 84.1% | 86.0% | 88.9% | 100.0% | 0.16 |
| forex-breakout-retest | frxUSDJPY | out-of-sample | 383 | 35.4% | 41.4% | 49.4% | 100.0% | 0.66 |
| forex-breakout-retest | frxUSDJPY | all 2017-2026 | 1833 | 71.2% | 75.9% | 82.2% | 100.0% | 0.30 |
| forex-breakout-retest | pooled | out-of-sample | 1033 | 71.5% | 74.2% | 78.7% | 100.0% | 0.29 |
| forex-breakout-retest | pooled | all 2017-2026 | 5329 | 99.0% | 99.2% | 99.4% | 100.0% | 0.01 |
| forex-rsi-bollinger-reversion | frxEURUSD | out-of-sample | 48 | 6.6% | 9.9% | 14.6% | 0.1% | 0.99 |
| forex-rsi-bollinger-reversion | frxEURUSD | all 2017-2026 | 278 | 27.4% | 33.8% | 42.0% | 100.0% | 0.74 |
| forex-rsi-bollinger-reversion | frxGBPUSD | out-of-sample | 58 | 15.6% | 18.6% | 23.0% | 28.4% | 0.84 |
| forex-rsi-bollinger-reversion | frxGBPUSD | all 2017-2026 | 276 | 13.4% | 19.3% | 28.5% | 44.4% | 1.12 |
| forex-rsi-bollinger-reversion | frxUSDJPY | out-of-sample | 61 | 28.1% | 29.2% | 32.2% | 100.0% | 0.72 |
| forex-rsi-bollinger-reversion | frxUSDJPY | all 2017-2026 | 317 | 45.9% | 49.4% | 55.1% | 100.0% | 0.54 |
| forex-rsi-bollinger-reversion | pooled | out-of-sample | 167 | 40.0% | 42.3% | 46.6% | 100.0% | 0.60 |
| forex-rsi-bollinger-reversion | pooled | all 2017-2026 | 871 | 55.9% | 61.4% | 68.7% | 100.0% | 0.45 |

## G. Verdicts (rule fixed in PROTOCOL.md)

| Strategy | Symbol | OOS trades | OOS expectancy R (measured spread + swap) | OOS 95% interval | OOS at 2x spread + swap | OOS profit factor | OOS max drawdown R | IS / VAL expectancy R | Positive neighbours | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gold-h1-trend | frxXAUUSD | 120 | 0.006 | -0.247 to 0.263 | 0.002 | 1.01 | 8.0 | -0.019 / 0.099 | 40.0% | inconclusive |
| gold-london-breakout | frxXAUUSD | 189 | 0.040 | -0.085 to 0.166 | 0.035 | 1.11 | 21.9 | 0.000 / -0.027 | 30.8% | inconclusive |
| forex-breakout-retest | frxEURUSD | 291 | -0.102 | -0.263 to 0.065 | -0.118 | 0.86 | 40.1 | -0.065 / -0.127 | 0.0% | no evidence of edge |
| forex-breakout-retest | frxGBPUSD | 359 | -0.127 | -0.269 to 0.022 | -0.150 | 0.83 | 52.4 | -0.076 / -0.105 | 0.0% | no evidence of edge |
| forex-breakout-retest | frxUSDJPY | 383 | -0.099 | -0.238 to 0.041 | -0.115 | 0.86 | 42.7 | -0.030 / -0.087 | 0.0% | no evidence of edge |
| forex-breakout-retest | pooled | 1033 | -0.110 | -0.195 to -0.026 | -0.128 | 0.85 | 123.4 | -0.057 / -0.106 | 0.0% | no evidence of edge |
| forex-rsi-bollinger-reversion | frxEURUSD | 48 | -0.014 | -0.417 to 0.420 | -0.028 | 0.98 | 13.5 | -0.087 / -0.186 | 10.0% | inconclusive |
| forex-rsi-bollinger-reversion | frxGBPUSD | 58 | -0.282 | -0.611 to 0.074 | -0.296 | 0.64 | 21.4 | 0.032 / 0.377 | 10.0% | inconclusive |
| forex-rsi-bollinger-reversion | frxUSDJPY | 61 | -0.533 | -0.811 to -0.210 | -0.550 | 0.39 | 33.3 | -0.054 / -0.209 | 10.0% | inconclusive |
| forex-rsi-bollinger-reversion | pooled | 167 | -0.297 | -0.496 to -0.088 | -0.313 | 0.62 | 61.3 | -0.040 / -0.003 | 10.0% | no evidence of edge |
