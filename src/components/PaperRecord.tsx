import { useEffect, useState } from "react";
import { fetchPaperRecord, formatEpoch, isStale, prettySymbol, type PaperRecordData } from "../lib/paper";

const fmt = (value: number | null | undefined, suffix = "") => (value == null ? "-" : `${value}${suffix}`);

export function PaperRecord({ slug, minimumTrades }: { slug: string; minimumTrades: number }) {
  const [rec, setRec] = useState<PaperRecordData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetchPaperRecord(slug)
        .then((next) => {
          if (active) {
            setRec(next);
            setFailed(false);
          }
        })
        .catch(() => {
          if (active) setFailed(true);
        });
    load();
    const timer = setInterval(load, 5 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [slug]);

  const recent = rec ? [...rec.trades].reverse().slice(0, 20) : [];
  const open = rec ? Object.entries(rec.symbols).filter(([, s]) => s.open) : [];

  return (
    <div>
      <div className="strategy-record">
        <p>
          <strong>Paper test (simulated).</strong> Trades are simulated on live Deriv candle prices every hour with an
          assumed spread. No real or demo money is used, and real fills will differ. The record starts when the test
          starts and nothing is back-filled.
        </p>
      </div>

      {!rec && !failed ? <p className="fine-print">Loading the live record...</p> : null}
      {failed && !rec ? (
        <p className="fine-print">
          <strong>Waiting for the first run.</strong> The record could not be loaded yet, so there are no results to show
          and none are implied.
        </p>
      ) : null}

      {rec ? (
        <>
          <p className="fine-print">
            Started {rec.startedAt.slice(0, 16).replace("T", " ")} UTC.{" "}
            {rec.lastRunAt ? `Last update ${rec.lastRunAt.slice(0, 16).replace("T", " ")} UTC.` : "No successful update yet."}
            {isStale(rec.lastRunAt) ? " The hourly job looks delayed, so treat these numbers as out of date." : ""}
          </p>
          <div className="strategy-facts">
            <div><span>Trades</span><strong>{rec.stats.trades} of {minimumTrades} needed</strong></div>
            <div><span>Win rate</span><strong>{fmt(rec.stats.winRate, "%")}</strong></div>
            <div><span>Expectancy per trade</span><strong>{fmt(rec.stats.expectancyR, "R")}</strong></div>
            <div><span>Profit factor</span><strong>{fmt(rec.stats.profitFactor)}</strong></div>
            <div><span>Total</span><strong>{fmt(rec.stats.totalR, "R")}</strong></div>
            <div><span>Worst drawdown</span><strong>{fmt(rec.stats.maxDrawdownR, "R")}</strong></div>
            <div><span>Longest losing streak</span><strong>{rec.stats.longestLosingStreak}</strong></div>
          </div>
          {rec.stats.trades < minimumTrades ? (
            <p className="fine-print">
              Fewer than {minimumTrades} trades is too few to judge. A few early wins or losses are mostly luck.
            </p>
          ) : null}
          <p className="fine-print">
            1R is the distance from entry to stop-loss. Assumed round-trip spread:{" "}
            {Object.entries(rec.assumptions.spread).map(([s, v]) => `${prettySymbol(s)} ${v}`).join(", ")}. Trades whose
            cost would exceed {Math.round(rec.assumptions.maxCostR * 100)}% of the risk are skipped (skipped so far:{" "}
            {rec.skipped.cost}).
          </p>
          {open.length ? (
            <p className="fine-print">
              Open now: {open.map(([sym, s]) => `${prettySymbol(sym)} ${s.open?.side} since ${formatEpoch(s.open?.entryTime ?? 0)}`).join("; ")}.
            </p>
          ) : null}
          {recent.length ? (
            <div className="paper-table-wrap">
              <table className="paper-table">
                <thead>
                  <tr><th>Closed</th><th>Pair</th><th>Side</th><th>Exit</th><th>Result</th></tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id}>
                      <td>{formatEpoch(t.exitTime)}</td>
                      <td>{prettySymbol(t.symbol)}</td>
                      <td>{t.side}</td>
                      <td>{t.exitReason === "tp" ? "target" : t.exitReason === "sl" ? "stop" : "time exit"}</td>
                      <td>{t.r > 0 ? "+" : ""}{t.r}R</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="fine-print">No trades have closed yet.</p>
          )}
        </>
      ) : null}
    </div>
  );
}
