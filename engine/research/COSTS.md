# Trading costs for the four instruments (Step 2)

Measured 2026-10-13. Research only. The engine defaults in `engine/strategies.mjs` were not changed; the numbers
below are passed in as backtest scenarios.

## 1. Measured on the Deriv MT5 account (DerivSVG-Server)

`mt5/ExportSpread.mq5` (read-only) read every stored bid/ask tick from 2026-06-15 to 2026-10-12 (103 days with
ticks; 14.9 to 35.7 million ticks per symbol) and weighted each quoted spread by how long it was live.
Raw tables per UTC hour: `data/mt5/raw/spread_{SYMBOL}.csv`.

| Symbol | Typical 06-19 UTC | Typical 23-05 UTC | All-hours mean | 99% of the time below | 21:00 UTC hour, median | Largest seen |
| --- | --- | --- | --- | --- | --- | --- |
| XAUUSD | 0.15 | 0.17 | 0.17 | 0.58 | 0.28 (20h), 0.42 (22h); shut 21h | 18.75 |
| EURUSD | 0.00003 | 0.00004 | 0.00005 | 0.00042 | 0.00025 | 0.00200 |
| GBPUSD | 0.00004 | 0.00005 | 0.00008 | 0.00103 | 0.00065 | 0.00200 |
| USDJPY | 0.004 | 0.005 | 0.006 | 0.051 | 0.032 | 0.200 |

Limits of this measurement:
- Four months of one year. Spreads in earlier years, and around major news, may have been wider.
- The forex maximum of exactly 200 points on three pairs looks like a cap in the stored ticks, so the true
  worst case may be higher. Gold's 18.75 was a single event in the 12:00 UTC hour.
- It is the quoted spread. Slippage on stop orders is not in it.
- The account type and whether it charges a per-trade commission are not confirmed (see section 3).
- The spread stored on each H1 bar in MT5 history is not usable: zero on most bars before 2024, and close to
  the minimum of the hour since.

## 2. Swap (overnight financing), from the same terminal

Points per lot per night; the published Deriv table shows the same values. Charged three times on Wednesday.

| Symbol | Long, per night | Short, per night | In price units (long / short) |
| --- | --- | --- | --- |
| XAUUSD | -45.00 | +20.00 | -0.45 / +0.20 |
| EURUSD | -11.42 | +2.66 | -0.000114 / +0.000027 |
| GBPUSD | -5.43 | -4.13 | -0.000054 / -0.000041 |
| USDJPY | +9.95 | -21.98 | +0.0100 / -0.0220 |

One night long EURUSD costs about three times the typical spread; one night long gold costs about three
spreads. The engine does not model swap at all, so any strategy that holds overnight is under-charged.

## 3. Published by Deriv

- deriv.com/trading-specifications (Deriv MT5 table, fetched 2026-10-13): "Min spread" EURUSD 0.00011,
  GBPUSD 0.0001, USDJPY 0.014, XAUUSD 0.16. Swaps as in section 2. The table does not distinguish account types.
- For forex the published minimum is about three times the spread measured in section 1. Not resolved. Either
  the table is out of date, or this account is in a tighter pricing group, or it pays a commission that the
  spread does not show. Check one closed forex deal in MT5 (History tab, Commission column) to settle it.
- Zero Spread account: commission is a percentage of the USD value traded, charged on opening and on closing.
  A Deriv staff example (community.deriv.com, 2 July 2024) uses 0.0045% for EURUSD: 0.1 lot at 1.0706 costs
  0.96 USD for the round trip, about 0.00010 in price terms. The rate for gold was not found. Not measured.
- The "CFDs commission rates" pages under deriv.com/partners-help-center-questions are the partner
  (affiliate) commission table: what a partner earns per 100,000 USD of client turnover (EUR/USD 4.00,
  GBP/USD 3.00, USD/JPY 4.00). They are not client trading costs, although search summaries present them so.

## 4. Other brokers (published figures, not measured here)

| Broker / account | EURUSD | GBPUSD | USDJPY | XAUUSD | Commission |
| --- | --- | --- | --- | --- | --- |
| Pepperstone Standard, average | 0.77 pip | 1.19 pip | 0.86 pip | not found | none |
| Pepperstone Razor, average | 0.17 pip | 0.59 pip | 0.26 pip | 0.15 | 3.50 USD per lot per side |
| IC Markets Raw, average | about 0.0-0.1 pip | about 0.0-0.1 pip | about 0.0-0.1 pip | 0.09 | 3.50 USD per lot per side (MetaTrader) |

Pepperstone figures are from a third-party comparison site quoting Pepperstone's tables. The IC Markets page
was read by an automated summariser and its Standard-account row came out garbled, so it is left out. A 7 USD
round-trip commission on one lot is about 0.7 pip, so raw-spread accounts cost roughly 0.8 to 1.3 pips all-in
on these pairs.

## 5. The engine's assumed spreads against the measurement

| Symbol | Assumed in strategies.mjs | Measured typical | Assumed is | Deriv published minimum |
| --- | --- | --- | --- | --- |
| XAUUSD | 0.35 | 0.15 to 0.17 | about 2.1 to 2.3 times too high | 0.16 |
| EURUSD | 0.00012 | 0.00003 to 0.00004 | about 3 to 4 times too high | 0.00011 |
| GBPUSD | 0.00016 | 0.00004 to 0.00005 | about 3 to 4 times too high | 0.0001 |
| USDJPY | 0.016 | 0.004 to 0.005 | about 3 to 4 times too high | 0.014 |

The assumed spreads are close to Deriv's published minimums, so they work as a pessimistic scenario. They are
wrong in the cautious direction. The cost the engine misses is swap, plus the wide spreads in the 20:00-22:00
UTC rollover hours for any trade that enters or exits then.

## 6. Scenarios for Step 4

| Scenario | XAUUSD | EURUSD | GBPUSD | USDJPY |
| --- | --- | --- | --- | --- |
| Measured (1x) | 0.17 | 0.00004 | 0.00005 | 0.005 |
| 1.5x | 0.255 | 0.00006 | 0.000075 | 0.0075 |
| 2x | 0.34 | 0.00008 | 0.0001 | 0.010 |
| Published / engine default | 0.35 | 0.00012 | 0.00016 | 0.016 |

Swap is applied separately, per night held, using section 2.

## Sources

- Tick measurement and swaps: this computer's Deriv MT5 terminal, files under `data/mt5/raw/`.
- https://deriv.com/trading-specifications
- https://community.deriv.com/t/calculation-of-zero-spread-commission/87053
- https://deriv.com/partners-help-center-questions/what-are-the-commission-rates-for-trades-on-the-deriv-mt5-zero-spread-account
- https://ic.com/global/en/trading-pricing/spreads
- https://www.compareforexbrokers.com/reviews/pepperstone-review/razor-vs-standard-account/
- https://pepperstone.com/en/ways-to-trade/pricing/
