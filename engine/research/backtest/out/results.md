# Backtest results (IS+VAL only)

Deriv MT5 H1 data. Costs: measured spread plus swap unless a column says otherwise. R = multiples of the risk on each trade.
This run does not compute or show out-of-sample trades.

## A. Results by segment (measured spread + swap)

| Strategy | Symbol | Segment | Trades | Win rate | Avg win R | Avg loss R | Expectancy R | 95% interval | Profit factor | Max drawdown R | Longest losing streak |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gold-h1-trend | frxXAUUSD | in-sample | 361 | 34.1% | 1.98 | -1.05 | -0.019 | -0.164 to 0.134 | 0.97 | 48.1 | 13 |
| gold-h1-trend | frxXAUUSD | validation | 117 | 37.6% | 1.95 | -1.02 | 0.099 | -0.160 to 0.359 | 1.16 | 9.2 | 8 |
| gold-london-breakout | frxXAUUSD | in-sample | 800 | 44.9% | 0.96 | -0.78 | 0.000 | -0.067 to 0.068 | 1.00 | 31.0 | 10 |
| gold-london-breakout | frxXAUUSD | validation | 277 | 41.2% | 1.09 | -0.81 | -0.027 | -0.148 to 0.096 | 0.94 | 21.4 | 9 |
| forex-breakout-retest | frxEURUSD | in-sample | 1063 | 32.1% | 1.97 | -1.03 | -0.065 | -0.148 to 0.021 | 0.91 | 81.4 | 18 |
| forex-breakout-retest | frxEURUSD | validation | 352 | 30.1% | 1.97 | -1.03 | -0.127 | -0.266 to 0.020 | 0.82 | 54.7 | 18 |
| forex-breakout-retest | frxGBPUSD | in-sample | 1096 | 31.5% | 1.98 | -1.02 | -0.076 | -0.161 to 0.007 | 0.89 | 106.0 | 15 |
| forex-breakout-retest | frxGBPUSD | validation | 335 | 30.7% | 1.97 | -1.03 | -0.105 | -0.248 to 0.049 | 0.85 | 57.1 | 18 |
| forex-breakout-retest | frxUSDJPY | in-sample | 1087 | 33.3% | 1.97 | -1.03 | -0.030 | -0.113 to 0.054 | 0.96 | 81.6 | 14 |
| forex-breakout-retest | frxUSDJPY | validation | 363 | 30.9% | 2.00 | -1.02 | -0.087 | -0.229 to 0.063 | 0.88 | 53.4 | 19 |
| forex-breakout-retest | pooled | in-sample | 3246 | 32.3% | 1.97 | -1.02 | -0.057 | -0.104 to -0.009 | 0.92 | 220.6 | 22 |
| forex-breakout-retest | pooled | validation | 1050 | 30.6% | 1.98 | -1.02 | -0.106 | -0.189 to -0.021 | 0.85 | 157.4 | 20 |
| forex-rsi-bollinger-reversion | frxEURUSD | in-sample | 170 | 30.6% | 2.03 | -1.02 | -0.087 | -0.296 to 0.133 | 0.88 | 37.0 | 12 |
| forex-rsi-bollinger-reversion | frxEURUSD | validation | 60 | 26.7% | 2.10 | -1.02 | -0.186 | -0.520 to 0.173 | 0.75 | 19.4 | 9 |
| forex-rsi-bollinger-reversion | frxGBPUSD | in-sample | 149 | 36.2% | 1.88 | -1.02 | 0.032 | -0.194 to 0.261 | 1.05 | 10.7 | 6 |
| forex-rsi-bollinger-reversion | frxGBPUSD | validation | 69 | 44.9% | 2.09 | -1.02 | 0.377 | 0.012 to 0.765 | 1.67 | 6.9 | 5 |
| forex-rsi-bollinger-reversion | frxUSDJPY | in-sample | 182 | 33% | 2.00 | -1.07 | -0.054 | -0.262 to 0.161 | 0.92 | 15.1 | 11 |
| forex-rsi-bollinger-reversion | frxUSDJPY | validation | 74 | 28.4% | 1.88 | -1.04 | -0.209 | -0.506 to 0.094 | 0.72 | 22.3 | 7 |
| forex-rsi-bollinger-reversion | pooled | in-sample | 501 | 33.1% | 1.97 | -1.04 | -0.040 | -0.163 to 0.089 | 0.94 | 30.7 | 11 |
| forex-rsi-bollinger-reversion | pooled | validation | 203 | 33.5% | 2.03 | -1.02 | -0.003 | -0.202 to 0.203 | 1.00 | 23.7 | 8 |

## B. Expectancy (R) under each cost scenario

| Strategy | Symbol | Segment | 1x, no swap | 1x + swap | 1.5x + swap | 2x + swap | Engine default spread + swap | Avg nights held |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gold-h1-trend | frxXAUUSD | in-sample | 0.012 | -0.019 | -0.036 | -0.051 | -0.054 | 1.32 |
| gold-h1-trend | frxXAUUSD | validation | 0.119 | 0.099 | 0.085 | 0.081 | 0.080 | 1.26 |
| gold-london-breakout | frxXAUUSD | in-sample | 0.000 | 0.000 | -0.013 | -0.023 | -0.025 | 0.01 |
| gold-london-breakout | frxXAUUSD | validation | -0.027 | -0.027 | -0.051 | -0.059 | -0.060 | 0.02 |
| forex-breakout-retest | frxEURUSD | in-sample | -0.052 | -0.065 | -0.076 | -0.090 | -0.117 | 0.70 |
| forex-breakout-retest | frxEURUSD | validation | -0.111 | -0.127 | -0.146 | -0.150 | -0.173 | 0.87 |
| forex-breakout-retest | frxGBPUSD | in-sample | -0.066 | -0.076 | -0.083 | -0.094 | -0.135 | 0.71 |
| forex-breakout-retest | frxGBPUSD | validation | -0.092 | -0.105 | -0.129 | -0.143 | -0.161 | 0.83 |
| forex-breakout-retest | frxUSDJPY | in-sample | -0.018 | -0.030 | -0.048 | -0.066 | -0.093 | 0.68 |
| forex-breakout-retest | frxUSDJPY | validation | -0.090 | -0.087 | -0.097 | -0.102 | -0.123 | 0.79 |
| forex-breakout-retest | pooled | in-sample | -0.045 | -0.057 | -0.069 | -0.083 | -0.115 | 0.69 |
| forex-breakout-retest | pooled | validation | -0.098 | -0.106 | -0.124 | -0.131 | -0.152 | 0.83 |
| forex-rsi-bollinger-reversion | frxEURUSD | in-sample | -0.075 | -0.087 | -0.094 | -0.100 | -0.113 | 0.76 |
| forex-rsi-bollinger-reversion | frxEURUSD | validation | -0.170 | -0.186 | -0.193 | -0.200 | -0.229 | 0.67 |
| forex-rsi-bollinger-reversion | frxGBPUSD | in-sample | 0.043 | 0.032 | 0.004 | -0.001 | -0.054 | 0.77 |
| forex-rsi-bollinger-reversion | frxGBPUSD | validation | 0.390 | 0.377 | 0.347 | 0.340 | 0.322 | 0.74 |
| forex-rsi-bollinger-reversion | frxUSDJPY | in-sample | -0.022 | -0.054 | -0.081 | -0.091 | -0.118 | 0.70 |
| forex-rsi-bollinger-reversion | frxUSDJPY | validation | -0.180 | -0.209 | -0.215 | -0.221 | -0.245 | 0.69 |
| forex-rsi-bollinger-reversion | pooled | in-sample | -0.021 | -0.040 | -0.060 | -0.067 | -0.097 | 0.74 |
| forex-rsi-bollinger-reversion | pooled | validation | 0.017 | -0.003 | -0.016 | -0.022 | -0.047 | 0.70 |

## C. Results per calendar year (measured spread + swap): trades / expectancy R / total R

| Strategy | Symbol | 2017 (IS) | 2018 (IS) | 2019 (IS) | 2020 (IS) | 2021 (IS) | 2022 (IS*) | 2023 (VAL) | 2024 (VAL*) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gold-h1-trend | frxXAUUSD | 52 / 0.20 / 10.4 | 73 / -0.19 / -13.8 | 66 / -0.27 / -17.8 | 55 / -0.05 / -2.8 | 62 / 0.08 / 4.7 | 65 / 0.14 / 9.1 | 57 / 0.29 / 16.7 | 48 / -0.03 / -1.6 |
| gold-london-breakout | frxXAUUSD | 123 / -0.07 / -8.2 | 144 / 0.01 / 1.7 | 131 / -0.05 / -6.5 | 125 / -0.04 / -5.0 | 132 / -0.00 / -0.3 | 163 / 0.11 / 18.6 | 140 / -0.03 / -4.1 | 119 / -0.03 / -3.9 |
| forex-breakout-retest | frxEURUSD | 174 / -0.10 / -17.5 | 199 / -0.01 / -2.7 | 161 / -0.23 / -36.2 | 189 / 0.07 / 12.4 | 177 / -0.08 / -14.7 | 180 / -0.09 / -15.6 | 189 / -0.12 / -23.3 | 146 / -0.11 / -16.0 |
| forex-breakout-retest | frxGBPUSD | 155 / 0.00 / 0.2 | 190 / -0.08 / -15.9 | 164 / -0.15 / -24.2 | 197 / -0.07 / -14.5 | 207 / -0.10 / -20.0 | 203 / -0.07 / -14.7 | 186 / -0.09 / -16.3 | 129 / -0.10 / -13.6 |
| forex-breakout-retest | frxUSDJPY | 183 / -0.04 / -8.3 | 179 / -0.04 / -7.5 | 172 / -0.10 / -17.0 | 180 / -0.03 / -5.8 | 196 / -0.11 / -21.2 | 203 / 0.15 / 30.5 | 184 / -0.18 / -33.6 | 153 / -0.01 / -1.3 |
| forex-breakout-retest | pooled | 512 / -0.05 / -25.5 | 568 / -0.05 / -26.0 | 497 / -0.16 / -77.4 | 566 / -0.01 / -7.9 | 580 / -0.10 / -56.0 | 586 / 0.00 / 0.2 | 559 / -0.13 / -73.1 | 428 / -0.07 / -30.9 |
| forex-rsi-bollinger-reversion | frxEURUSD | 31 / -0.07 / -2.0 | 25 / -0.59 / -14.8 | 31 / -0.12 / -3.9 | 35 / -0.18 / -6.2 | 20 / 0.00 / 0.1 | 30 / 0.33 / 10.0 | 25 / -0.32 / -7.9 | 33 / -0.04 / -1.2 |
| forex-rsi-bollinger-reversion | frxGBPUSD | 19 / -0.07 / -1.3 | 24 / 0.29 / 6.9 | 38 / 0.15 / 5.7 | 29 / 0.12 / 3.4 | 17 / -0.16 / -2.7 | 24 / -0.11 / -2.8 | 30 / 0.08 / 2.4 | 37 / 0.52 / 19.2 |
| forex-rsi-bollinger-reversion | frxUSDJPY | 28 / -0.03 / -0.8 | 22 / -0.47 / -10.3 | 32 / 0.20 / 6.5 | 30 / -0.01 / -0.4 | 35 / 0.14 / 4.8 | 39 / -0.22 / -8.7 | 33 / -0.34 / -11.3 | 37 / -0.14 / -5.3 |
| forex-rsi-bollinger-reversion | pooled | 78 / -0.05 / -4.1 | 71 / -0.26 / -18.2 | 101 / 0.08 / 8.3 | 94 / -0.03 / -3.1 | 72 / 0.03 / 2.2 | 93 / -0.02 / -1.4 | 88 / -0.19 / -16.8 | 107 / 0.12 / 12.7 |

`*` 2022 is in-sample until 13 November and validation after; 2024 is validation until 28 October. Trades after that date are not shown in this run.

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

