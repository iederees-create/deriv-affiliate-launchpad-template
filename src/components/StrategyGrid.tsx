import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { statusLabels, strategies } from "../data/strategies";
import { fetchPaperIndex, type PaperIndex } from "../lib/paper";

export function StrategyGrid() {
  const [index, setIndex] = useState<PaperIndex | null>(null);

  useEffect(() => {
    let active = true;
    fetchPaperIndex()
      .then((next) => {
        if (active) setIndex(next);
      })
      .catch(() => {
        if (active) setIndex(null);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="card-grid">
      {strategies.map((item) => {
        const summary = index?.strategies.find((s) => s.slug === item.slug);
        let line = "Not started.";
        if (item.record.kind === "lab-board") line = "Real Deriv demo account. Live board below.";
        if (item.record.kind === "paper") {
          if (!summary) line = "Waiting for the first run.";
          else if (summary.stats.trades === 0) line = `No closed trades yet (0 of ${item.record.minimumTrades}).`;
          else
            line = `${summary.stats.trades} of ${item.record.minimumTrades} trades · win rate ${summary.stats.winRate ?? "-"}% · ${summary.stats.expectancyR ?? "-"}R per trade`;
        }
        return (
          <article className="card" key={item.slug}>
            <p className="eyebrow">
              <span className="strategy-badge" data-status={item.status}>{statusLabels[item.status]}</span>
            </p>
            <h3>{item.name}</h3>
            <p>{item.summary}</p>
            <p className="fine-print">{item.market} · {item.timeframe}</p>
            <p className="fine-print"><strong>{line}</strong></p>
            <Link className="text-link" to={`/strategies/${item.slug}`}>Rules and full record</Link>
          </article>
        );
      })}
    </div>
  );
}
