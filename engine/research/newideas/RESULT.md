# New ideas: result (2026-10-13)

Two new, pre-specified session-timing ideas were tested under `PROTOCOL.md`. Neither shows an edge. Nothing
was tuned and nothing was changed after any stage. Research only, not financial advice.

| Idea | In-sample R | Validation R | Out-of-sample trades | Out-of-sample R | 97.5% interval | At 2x spread | Verdict |
|---|---|---|---|---|---|---|---|
| N1 gold-asia-session (buy gold 00:00, close 07:00 UTC) | -0.024 | +0.022 | 503 | +0.038 | includes zero | +0.033 | no evidence of edge |
| N2 fx-local-hours (six session legs, pooled) | +0.001 | +0.010 | 3,037 | -0.045 | n/a (negative) | -0.057 | no evidence of edge |

R is measured against a 3 x ATR stop, so these are small numbers: +0.038 R on N1 is a few cents per ounce.

- N1 failed four checks: the interval includes zero, in-sample was negative, a shift of the session by one or
  two hours gave a negative or zero result on in-sample plus validation, and it did not beat simply holding
  gold for the rest of the day in every segment. Its out-of-sample gain is what any long gold position earned
  in 2025.
- N2 was flat for eight years and negative out-of-sample (-0.04 R in 2025, -0.06 R in 2026). At 1% risk per
  trade its out-of-sample trades give a median 78% drawdown.
- Older data (2009-2016, different feed, context only): the gold Asia-session effect was there (+0.023 R,
  while rest-of-day gold lost 0.082 R). It has not been there since 2017. A published effect that has stopped
  working is a common outcome.

Tested so far in this repo: six strategy ideas, none with an edge. Each further idea tested on the same data
raises the chance that one passes by luck, so any future round should use a stricter bar and a forward paper
record before anything else.

Full tables: `out/stage-IS.md`, `out/stage-VAL.md`, `out/stage-OOS.md`.
Reproduce: `node engine/research/newideas/run.mjs --stage OOS`.
