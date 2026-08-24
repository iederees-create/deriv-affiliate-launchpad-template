import { useMemo, useState } from "react";
import { CTA } from "../components/CTA";
import { DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

function money(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function Tools() {
  const [balance, setBalance] = useState("500");
  const [riskPct, setRiskPct] = useState("1");
  const [dailyPct, setDailyPct] = useState("2");
  const [lostToday, setLostToday] = useState("0");
  const [tradesDone, setTradesDone] = useState("0");
  const [maxTrades, setMaxTrades] = useState("4");

  const math = useMemo(() => {
    const account = Math.max(0, Number(balance) || 0);
    const risk = Math.min(5, Math.max(0, Number(riskPct) || 0));
    const daily = Math.min(10, Math.max(0, Number(dailyPct) || 0));
    const lost = Math.max(0, Number(lostToday) || 0);
    const done = Math.max(0, Math.floor(Number(tradesDone) || 0));
    const cap = Math.max(1, Math.floor(Number(maxTrades) || 1));
    const perTrade = account * (risk / 100);
    const dailyCap = account * (daily / 100);
    const remaining = Math.max(0, dailyCap - lost);
    const stopNow = remaining <= 0 || done >= cap;
    const sampleLeft = Math.max(0, 20 - done);
    return { account, risk, daily, lost, done, cap, perTrade, dailyCap, remaining, stopNow, sampleLeft };
  }, [balance, dailyPct, lostToday, maxTrades, riskPct, tradesDone]);

  return (
    <>
      <Seo
        title="Free Trading Tools | Stake Planner and Daily Stop"
        description="Browser tools for position size, daily loss limits, and a 20-trade sample. Educational planning aids, not financial advice."
        path="/tools"
      />
      <section className="page-hero">
        <p className="eyebrow">Browser tools · no login</p>
        <h1>Size the trade. Cap the day. Count to twenty before you rewrite the rules.</h1>
        <p>
          Numbers only. These calculators do not place trades, do not connect to Deriv, and do not tell you what to buy. If a number looks heroic, it is probably too large.
        </p>
      </section>
      <DisclosureBand />
      <section className="section tool-grid">
        <article className="tool-card">
          <SectionHeader title="Stake planner" text="Maximum amount to put at risk on the next trade." />
          <label className="field">
            <span>Account size (USD)</span>
            <input inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </label>
          <label className="field">
            <span>Risk per trade (%)</span>
            <input inputMode="decimal" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} />
          </label>
          <div className="result-stack">
            <p>Max at risk this trade</p>
            <strong>{money(math.perTrade)}</strong>
            <p className="muted">A common starting range is 0.25% to 1%. Above 2% per trade is usually how accounts vanish in a bad week, not a method.</p>
          </div>
        </article>
        <article className="tool-card">
          <SectionHeader title="Daily loss limiter" text="When remaining hits zero, you stop. Not later. Now." />
          <label className="field">
            <span>Daily max loss (%)</span>
            <input inputMode="decimal" value={dailyPct} onChange={(e) => setDailyPct(e.target.value)} />
          </label>
          <label className="field">
            <span>Already lost today (USD)</span>
            <input inputMode="decimal" value={lostToday} onChange={(e) => setLostToday(e.target.value)} />
          </label>
          <div className={`result-stack ${math.stopNow ? "result-stop" : ""}`}>
            <p>Daily cap / remaining</p>
            <strong>{money(math.dailyCap)} / {money(math.remaining)}</strong>
            <p className="muted">{math.stopNow ? "Session over. Journal it. Come back tomorrow." : "If remaining is smaller than your next planned stake, skip the trade."}</p>
          </div>
        </article>
        <article className="tool-card">
          <SectionHeader title="20-trade sample" text="Do not change the setup until the sample is done." />
          <label className="field">
            <span>Completed trades in this sample</span>
            <input inputMode="numeric" value={tradesDone} onChange={(e) => setTradesDone(e.target.value)} />
          </label>
          <label className="field">
            <span>Max trades this session</span>
            <input inputMode="numeric" value={maxTrades} onChange={(e) => setMaxTrades(e.target.value)} />
          </label>
          <div className="result-stack">
            <p>Trades left in a 20-trade sample</p>
            <strong>{math.sampleLeft}</strong>
            <p className="muted">
              {math.done >= math.cap
                ? "Session trade cap reached."
                : "One setup. One risk percent. Twenty results. Then review, not mid-session tinkering."}
            </p>
          </div>
        </article>
      </section>
      <section className="section cta-panel">
        <div>
          <h2>Want the printable versions?</h2>
          <p>The kit has a journal, a 14-day demo plan, and a loss-limit card. Opening a Deriv demo through my partner link unlocks the downloads on this site.</p>
        </div>
        <div className="cta-row">
          <CTA href="/deriv-affiliate-launchpad-template/kit">Open the kit</CTA>
          <CTA href={affiliateConfig.demoAccountLink} variant="secondary">Open a Deriv demo</CTA>
        </div>
      </section>
    </>
  );
}
