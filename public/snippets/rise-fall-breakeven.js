/**
 * Rise/fall (binary) break-even win rate.
 *
 * If a winning $1 stake returns $1 + P (P = net payout multiple),
 * you need W = 1 / (1 + P) just to break even.
 *
 * Typical Deriv rise/fall payout sits near 80–90% (P ≈ 0.80–0.90),
 * so break-even sits near 53–56%. An 80% win-rate claim on this
 * contract type is not the public bar.
 *
 * Live public demo book (Apex Call Pulse Select, run 29, demo only):
 * 63 CALL, 33 wins / 30 losses, 52.4%, realized +$11.18 demo.
 *
 * Watch the desk: https://iederees-create.github.io/deriv-affiliate-launchpad-template/lab
 * Static crawl page: https://iederees-create.github.io/deriv-affiliate-launchpad-template/53.html
 * Live JSON: GET https://product-listing-server.onrender.com/api/lab/live
 *
 * I partner with Deriv (https://t.deriv.link?t=VQGBGPUYGJDZ). 18+ only.
 * Demo. Not a signal. Not financial advice.
 */

export function breakEvenWinRate(payoutMultiple) {
  if (!(payoutMultiple > 0)) throw new RangeError("payoutMultiple must be > 0");
  return 1 / (1 + payoutMultiple);
}

export function table(payouts = [0.8, 0.85, 0.88, 0.9]) {
  return payouts.map((p) => ({
    payout: p,
    breakEvenPct: +(breakEvenWinRate(p) * 100).toFixed(1),
  }));
}
