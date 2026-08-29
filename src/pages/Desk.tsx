import { useEffect, useMemo, useState } from "react";
import { CTA, WhatsAppCTA } from "../components/CTA";
import { DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";
import {
  dailyBudget,
  loadJourney,
  loadMarkets,
  loadOffers,
  siteHref,
  stakePlan,
  todayJourneyDay,
  type Journey,
  type MarketCard,
  type OfferCatalog
} from "../lib/deskApi";
import { BEGINNER_SYMBOLS, subscribeDerivQuotes, type SocketStatus, type Tick } from "../lib/derivMarket";

const START_KEY = "apex-desk-journey-start";
const DONE_KEY = "apex-desk-journey-done";

function money(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function formatQuote(value: number | undefined, market: MarketCard["market"]): string {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return market === "forex" ? value.toFixed(5) : value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function readStart(): string {
  try {
    return window.localStorage.getItem(START_KEY) || "";
  } catch {
    return "";
  }
}

function readDone(): number[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DONE_KEY) || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((day) => Number.isInteger(day) && day >= 1 && day <= 14) : [];
  } catch {
    return [];
  }
}

function offerHref(href: string): string {
  if (href === "whatsapp") {
    return `https://wa.me/${affiliateConfig.whatsappNumber.replace(/[^\d]/g, "")}`;
  }
  return siteHref(href);
}

export function Desk() {
  const [markets, setMarkets] = useState<MarketCard[]>([]);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [offers, setOffers] = useState<OfferCatalog | null>(null);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const [quotes, setQuotes] = useState<Record<string, Tick>>({});
  const [selected, setSelected] = useState("R_10");
  const [balance, setBalance] = useState("500");
  const [riskPct, setRiskPct] = useState("1");
  const [dailyPct, setDailyPct] = useState("2");
  const [lostToday, setLostToday] = useState("0");
  const [startIso, setStartIso] = useState("");
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    setStartIso(readStart());
    setDone(readDone());
    let cancelled = false;
    Promise.all([loadMarkets(), loadJourney(), loadOffers()])
      .then(([nextMarkets, nextJourney, nextOffers]) => {
        if (cancelled) return;
        setMarkets(nextMarkets);
        setJourney(nextJourney);
        setOffers(nextOffers);
        if (nextMarkets[0]) setSelected(nextMarkets[0].symbol);
      })
      .catch((reason) => {
        if (!cancelled) setLoadError(reason instanceof Error ? reason.message : "The desk catalog could not load.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const stop = subscribeDerivQuotes(affiliateConfig.derivAppId, BEGINNER_SYMBOLS, {
      onTick: (tick) => {
        setQuotes((current) => ({ ...current, [tick.symbol]: tick }));
      },
      onStatus: setStatus
    });
    return stop;
  }, []);

  const selectedMarket = markets.find((item) => item.symbol === selected) ?? markets[0];
  const quote = selectedMarket ? quotes[selectedMarket.symbol] : undefined;
  const plan = stakePlan(balance, riskPct);
  const budget = dailyBudget(balance, dailyPct, lostToday);
  const dayNumber = startIso ? todayJourneyDay(startIso) : 1;
  const today = journey ? journey.days.find((item) => item.day === dayNumber) ?? journey.days[0] : null;
  const liveCount = useMemo(() => Object.keys(quotes).length, [quotes]);

  const startJourney = () => {
    const iso = new Date().toISOString().slice(0, 10);
    try {
      window.localStorage.setItem(START_KEY, iso);
    } catch {
      // Private mode can block storage; the day still displays for this visit.
    }
    setStartIso(iso);
  };

  const toggleDay = (day: number) => {
    setDone((current) => {
      const next = current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b);
      try {
        window.localStorage.setItem(DONE_KEY, JSON.stringify(next));
      } catch {
        // Progress is still visible this visit.
      }
      return next;
    });
  };

  return (
    <>
      <Seo
        title="Beginner Desk | Live Quotes, Stake Planner, 14-Day Path"
        description="Read-only Deriv quotes, a stake and daily-stop planner, a 14-day demo path, and the products and services this desk offers beginners."
        path="/desk"
      />
      <section className="page-hero">
        <p className="eyebrow">Beginner desk · live quotes · no order ticket</p>
        <h1>See the print. Size the stake. Follow a 14-day demo path.</h1>
        <p>
          This desk reads public Deriv prices and runs the same planning math as the free tools. It does not log into your account, does not place trades, and does not tell you what to buy.
        </p>
        <p className="desk-status" role="status">
          Quotes: <strong>{status}</strong>
          {status === "live" ? ` · ${liveCount} markets` : null}
          {status === "offline" ? " · last prints stay on screen until the stream returns" : null}
        </p>
      </section>
      <DisclosureBand />

      {loadError ? <p className="desk-banner" role="alert">{loadError}</p> : null}

      <section className="section" aria-labelledby="quotes-heading">
        <SectionHeader
          eyebrow="Deriv public ticks"
          title="Beginner market tape"
          text="Prices refresh from Deriv’s public market data. A moving number is not a reason to click buy."
        />
        <h2 id="quotes-heading" className="visually-hidden">Live beginner quotes</h2>
        <ul className="quote-tape">
          {(markets.length ? markets : BEGINNER_SYMBOLS.map((symbol) => ({ symbol, name: symbol, market: "synthetic" as const, beginnerNote: "", id: symbol, risk: "medium" as const, session: "24/7" as const }))).map((market) => {
            const tick = quotes[market.symbol];
            return (
              <li key={market.symbol}>
                <button
                  type="button"
                  className={selected === market.symbol ? "quote-chip is-active" : "quote-chip"}
                  onClick={() => setSelected(market.symbol)}
                  aria-pressed={selected === market.symbol}
                >
                  <span>{market.name}</span>
                  <strong>{formatQuote(tick?.quote, market.market)}</strong>
                </button>
              </li>
            );
          })}
        </ul>
        {selectedMarket ? <p className="muted">{selectedMarket.beginnerNote}</p> : null}
      </section>

      <section className="section tool-grid">
        <article className="tool-card" id="live-stake">
          <SectionHeader title="Stake against this print" text="Account × risk percent. The quote is context, not a position size." />
          <p className="muted">
            {selectedMarket ? `${selectedMarket.name}: ${formatQuote(quote?.quote, selectedMarket.market)}` : "Pick a market on the tape."}
          </p>
          <label className="field">
            <span>Demo account size (USD)</span>
            <input name="desk-balance" inputMode="decimal" value={balance} onChange={(event) => setBalance(event.target.value)} />
          </label>
          <label className="field">
            <span>Risk per trade (%)</span>
            <input name="desk-risk" inputMode="decimal" value={riskPct} onChange={(event) => setRiskPct(event.target.value)} />
          </label>
          <div className="result-stack">
            <p>Max at risk this trade</p>
            <strong>{"error" in plan ? "—" : money(plan.perTrade)}</strong>
            <p className="muted">{"error" in plan ? plan.error : "A common starting range is 0.25% to 1%."}</p>
          </div>
        </article>
        <article className="tool-card" id="live-daily">
          <SectionHeader title="Daily remaining" text="When remaining hits zero, the session is over." />
          <label className="field">
            <span>Daily max loss (%)</span>
            <input name="desk-daily" inputMode="decimal" value={dailyPct} onChange={(event) => setDailyPct(event.target.value)} />
          </label>
          <label className="field">
            <span>Already lost today (USD)</span>
            <input name="desk-lost" inputMode="decimal" value={lostToday} onChange={(event) => setLostToday(event.target.value)} />
          </label>
          <div className={`result-stack ${!("error" in budget) && budget.stopNow ? "result-stop" : ""}`}>
            <p>Daily cap / remaining</p>
            <strong>
              {"error" in budget ? "—" : `${money(budget.dailyCap)} / ${money(budget.remaining)}`}
            </strong>
            <p className="muted">
              {"error" in budget
                ? budget.error
                : budget.stopNow
                  ? "Session over. Journal it. Come back tomorrow."
                  : "If remaining is smaller than the next stake, skip the trade."}
            </p>
          </div>
        </article>
        <article className="tool-card">
          <SectionHeader title="Today on the 14-day path" text={journey?.rule} />
          {today ? (
            <>
              <p className="eyebrow">Day {today.day} of 14</p>
              <h3>{today.title}</h3>
              <p>{today.task}</p>
              <div className="cta-row">
                <CTA href={siteHref(today.resource)} variant="secondary">Open today’s resource</CTA>
                {!startIso ? (
                  <button type="button" className="cta cta-ghost" onClick={startJourney}>Start day 1 today</button>
                ) : null}
              </div>
            </>
          ) : (
            <p className="muted">Loading the path…</p>
          )}
        </article>
      </section>

      <section className="section">
        <SectionHeader
          eyebrow="Products and services"
          title="What this desk can offer a new trader"
          text="Beginners get planning tools. Downline affiliates can offer the same pack instead of inventing a second funnel."
        />
        <div className="offer-grid">
          {(offers?.products ?? []).map((item) => (
            <article className="kit-card" key={item.id}>
              <p className="eyebrow">{item.kind} · {item.price}</p>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <CTA href={offerHref(item.href)} variant="secondary">{item.title}</CTA>
            </article>
          ))}
          {(offers?.services ?? []).map((item) => (
            <article className="kit-card" key={item.id}>
              <p className="eyebrow">{item.kind} · {item.price}</p>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              {item.href === "whatsapp" ? (
                <WhatsAppCTA label={item.title} />
              ) : (
                <CTA href={offerHref(item.href)} variant="ghost">{item.title}</CTA>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader
          eyebrow="14-day checklist"
          title="Mark the day when the task is done"
          text="Stored in this browser only. Demo account. No live funding required."
        />
        <ol className="journey-list">
          {(journey?.days ?? []).map((item) => (
            <li key={item.day}>
              <label className={item.day === dayNumber ? "journey-item is-today" : "journey-item"}>
                <input
                  type="checkbox"
                  checked={done.includes(item.day)}
                  onChange={() => toggleDay(item.day)}
                />
                <span>
                  <strong>Day {item.day}: {item.title}</strong>
                  {item.task}
                </span>
              </label>
            </li>
          ))}
        </ol>
      </section>

      <section className="section cta-panel">
        <div>
          <h2>Open a demo, then use the kit</h2>
          <p>The partner click is how this desk is paid if you later become a client. The files and the calculators still work if you never deposit.</p>
        </div>
        <div className="cta-row">
          <CTA href={affiliateConfig.demoAccountLink}>Open a Deriv demo</CTA>
          <CTA href="/deriv-affiliate-launchpad-template/kit" variant="secondary">Open the kit</CTA>
        </div>
      </section>
    </>
  );
}
