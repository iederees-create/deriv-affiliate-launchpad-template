import { useEffect, useState } from "react";
import { fetchNewsSitout, type NewsSitoutBoard } from "../lib/labApi";
import { SectionHeader } from "./Section";

type NewsDesk = "synthetics" | "fx" | null;

export function NewsSitoutCard() {
  const [news, setNews] = useState<NewsSitoutBoard | null>(null);
  const [newsError, setNewsError] = useState("");
  const [newsDesk, setNewsDesk] = useState<NewsDesk>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchNewsSitout()
        .then((board) => {
          if (cancelled) return;
          setNews(board);
          setNewsError(board.ok ? "" : "Calendar unavailable. If you trade FX, skip red-folder minutes without the feed.");
        })
        .catch(() => {
          if (cancelled) return;
          setNewsError("Calendar unavailable. If you trade FX, skip red-folder minutes without the feed.");
        });
    };
    load();
    const id = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <article className="tool-card" id="news-sitout">
      <SectionHeader
        title="FX news sit-out (not for Volatility Indices)"
        text="High-impact USD, EUR, GBP, and ZAR prints. Sit out 15 minutes before through 15 minutes after. Synthetic volatility charts ignore this calendar."
      />
      {!news && !newsError ? <p className="muted">Loading this week's windows...</p> : null}
      {newsError ? <p className="muted">{newsError}</p> : null}
      {news && news.ok ? (
        <div className={`result-stack ${news.fxSitOutNow ? "result-stop" : ""}`}>
          <p>
            {news.fxSitOutNow
              ? "FX sit-out window is live"
              : news.next
                ? "Next high-impact window"
                : "No high-impact USD / EUR / GBP / ZAR left this week"}
          </p>
          <strong>{news.next ? `${news.next.country} ${news.next.title}` : "Clear"}</strong>
          <p className="muted">
            {news.next
              ? `${news.next.sitFromSast} – ${news.next.sitUntilSast}`
              : "If a red folder appears later, refresh. Times can move."}
          </p>
        </div>
      ) : null}
      <DeskButtons newsDesk={newsDesk} setNewsDesk={setNewsDesk} />
      <DeskCopy newsDesk={newsDesk} news={news && news.ok ? news : null} newsError={Boolean(newsError)} />
      {news && news.ok ? (
        <p className="muted">
          Source: <a href={news.source.url} rel="noopener noreferrer" target="_blank">Forex Factory</a> public weekly export.
          {news.stale ? " Feed is stale; last good cache is showing." : ""} Educational only — not a trade signal.
        </p>
      ) : null}
    </article>
  );
}

function DeskButtons({
  newsDesk,
  setNewsDesk
}: {
  newsDesk: NewsDesk;
  setNewsDesk: (desk: Exclude<NewsDesk, null>) => void;
}) {
  return (
    <div className="cta-row">
      <button
        type="button"
        className={newsDesk === "synthetics" ? "cta" : "cta cta-ghost"}
        onClick={() => setNewsDesk("synthetics")}
      >
        I trade synthetics — this does not apply.
      </button>
      <button
        type="button"
        className={newsDesk === "fx" ? "cta" : "cta cta-secondary"}
        onClick={() => setNewsDesk("fx")}
      >
        I trade FX — sit out this window.
      </button>
    </div>
  );
}

function DeskCopy({
  newsDesk,
  news,
  newsError
}: {
  newsDesk: NewsDesk;
  news: NewsSitoutBoard | null;
  newsError: boolean;
}) {
  if (newsDesk === "synthetics") {
    return (
      <p className="muted">
        Volatility Indices are independent of NFP, CPI, and FOMC. The live Chart Select desk does not use this calendar.
      </p>
    );
  }
  if (newsDesk !== "fx") return null;
  if (!news) {
    return (
      <p className="muted">
        Sit out 15 minutes before through 15 minutes after High-impact USD, EUR, GBP, and ZAR prints.
        {newsError ? " Check Forex Factory by hand until the feed returns." : ""}
      </p>
    );
  }
  return (
    <ul className="news-sitout-list">
      {news.windows.length === 0 ? (
        <li>
          <strong>No remaining High windows this week</strong>
          <p className="when">Sitting out still works on your own session clock.</p>
        </li>
      ) : (
        news.windows.map((row) => (
          <li key={`${row.country}-${row.eventAt}-${row.title}`}>
            <strong>
              {row.status === "live" ? <span className="live-flag">Live sit-out · </span> : null}
              {row.country} {row.title}
            </strong>
            <p className="when">{row.sitFromSast} – {row.sitUntilSast}</p>
          </li>
        ))
      )}
    </ul>
  );
}
