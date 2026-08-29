import { useEffect, useMemo, useState } from "react";
import { CTA } from "../components/CTA";
import { DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

function money(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function pct(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(2)}%`;
}

const GATE_ITEMS = [
  { id: "stake", label: "I already wrote the stake for this trade." },
  { id: "room", label: "Daily remaining is larger than that stake." },
  { id: "clock", label: "I am still inside the session I planned." },
  { id: "setup", label: "I can describe the setup in one sentence." },
  { id: "revenge", label: "I am not taking this to recover the last loss." }
] as const;

export function Tools() {
  const [balance, setBalance] = useState("500");
  const [riskPct, setRiskPct] = useState("1");
  const [dailyPct, setDailyPct] = useState("2");
  const [lostToday, setLostToday] = useState("0");
  const [tradesDone, setTradesDone] = useState("0");
  const [maxTrades, setMaxTrades] = useState("4");
  const [drawdownPct, setDrawdownPct] = useState("20");
  const [streakLosses, setStreakLosses] = useState("5");
  const [sessionMins, setSessionMins] = useState("45");
  const [sessionStarted, setSessionStarted] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [wins, setWins] = useState("8");
  const [losses, setLosses] = useState("12");
  const [avgWinR, setAvgWinR] = useState("1.2");
  const [avgLossR, setAvgLossR] = useState("1");
  const [gates, setGates] = useState<Record<string, boolean>>({
    stake: false,
    room: false,
    clock: false,
    setup: false,
    revenge: false
  });

  useEffect(() => {
    if (sessionStarted === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [sessionStarted]);

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
    const dd = Math.min(90, Math.max(0, Number(drawdownPct) || 0));
    const recovery = dd >= 100 ? Number.POSITIVE_INFINITY : (1 / (1 - dd / 100) - 1) * 100;
    const streak = Math.min(30, Math.max(0, Math.floor(Number(streakLosses) || 0)));
    const afterStreak = account * Math.pow(1 - risk / 100, streak);
    const plannedMins = Math.max(1, Math.floor(Number(sessionMins) || 1));
    const elapsedMs = sessionStarted === null ? 0 : Math.max(0, now - sessionStarted);
    const remainingMs = sessionStarted === null ? plannedMins * 60_000 : Math.max(0, plannedMins * 60_000 - elapsedMs);
    const clockUp = sessionStarted !== null && remainingMs <= 0;
    const remainingSec = Math.floor(remainingMs / 1000);
    const remainingClock = `${String(Math.floor(remainingSec / 60)).padStart(2, "0")}:${String(remainingSec % 60).padStart(2, "0")}`;
    const winCount = Math.max(0, Math.floor(Number(wins) || 0));
    const lossCount = Math.max(0, Math.floor(Number(losses) || 0));
    const sample = winCount + lossCount;
    const winR = Math.max(0, Number(avgWinR) || 0);
    const lossR = Math.max(0, Number(avgLossR) || 0);
    const winRate = sample === 0 ? 0 : winCount / sample;
    const expectancy = sample === 0 ? 0 : winRate * winR - (1 - winRate) * lossR;
    const gateYes = GATE_ITEMS.every((item) => gates[item.id]);
    return {
      account, risk, daily, lost, done, cap, perTrade, dailyCap, remaining, stopNow, sampleLeft,
      dd, recovery, streak, afterStreak, plannedMins, remainingClock, clockUp, sessionLive: sessionStarted !== null,
      winCount, lossCount, sample, winRate, expectancy, gateYes
    };
  }, [avgLossR, avgWinR, balance, dailyPct, drawdownPct, gates, lostToday, losses, maxTrades, now, riskPct, sessionMins, sessionStarted, streakLosses, tradesDone, wins]);

  return (
    <>
      <Seo
        title="Free Trading Tools | Stake, Stop, Drawdown, Session Clock"
        description="Browser tools for position size, daily stops, drawdown recovery, losing streaks, session clocks, and a pre-trade sit-out gate. Educational planning aids, not financial advice."
        path="/tools"
      />
      <section className="page-hero">
        <p className="eyebrow">Browser tools · no login</p>
        <h1>Size the trade. Cap the day. Put a clock on the session.</h1>
        <p>
          Numbers only. These calculators do not place trades, do not connect to Deriv, and do not tell you what to buy. If a number looks heroic, it is probably too large.
        </p>
      </section>
      <DisclosureBand />
      <section className="section tool-grid">
        <article className="tool-card" id="stake">
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
        <article className="tool-card" id="daily">
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
        <article className="tool-card" id="sample">
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
        <article className="tool-card" id="drawdown">
          <SectionHeader title="Drawdown recovery" text="A 20% hole is not a 20% climb. The math is worse than it feels." />
          <label className="field">
            <span>Current drawdown (%)</span>
            <input inputMode="decimal" value={drawdownPct} onChange={(e) => setDrawdownPct(e.target.value)} />
          </label>
          <div className="result-stack">
            <p>Gain needed to get back to even</p>
            <strong>{pct(math.recovery)}</strong>
            <p className="muted">Losing 20% requires 25% back. Losing 50% requires 100% back. That is why the daily stop exists.</p>
          </div>
        </article>
        <article className="tool-card" id="streak">
          <SectionHeader title="Losing-streak survival" text="Five losers in a row is not rare. See what is left if you keep the same risk percent." />
          <label className="field">
            <span>Consecutive losses</span>
            <input inputMode="numeric" value={streakLosses} onChange={(e) => setStreakLosses(e.target.value)} />
          </label>
          <div className="result-stack">
            <p>Account after the streak</p>
            <strong>{money(math.afterStreak)}</strong>
            <p className="muted">Uses the account size and risk percent from the stake planner, compounding each loss. If the leftover looks ugly, shrink the risk percent, not the sample.</p>
          </div>
        </article>
        <article className="tool-card" id="session">
          <SectionHeader title="Session clock" text="Synthetic markets do not close. You still have to." />
          <label className="field">
            <span>Planned session (minutes)</span>
            <input inputMode="numeric" value={sessionMins} onChange={(e) => setSessionMins(e.target.value)} disabled={math.sessionLive} />
          </label>
          <div className="cta-row">
            {math.sessionLive ? (
              <button type="button" className="cta cta-ghost" onClick={() => setSessionStarted(null)}>Reset clock</button>
            ) : (
              <button type="button" className="cta cta-secondary" onClick={() => setSessionStarted(Date.now())}>Start session</button>
            )}
          </div>
          <div className={`result-stack ${math.clockUp ? "result-stop" : ""}`}>
            <p>{math.sessionLive ? "Time remaining" : "Clock not started"}</p>
            <strong>{math.sessionLive ? math.remainingClock : `${math.plannedMins}:00`}</strong>
            <p className="muted">{math.clockUp ? "Time is up. Journal it. The next tick is not a session." : "Forty-five minutes plus a four-trade cap is plenty. After that you are collecting moods, not a sample."}</p>
          </div>
        </article>
        <article className="tool-card" id="gate">
          <SectionHeader title="Pre-trade sit-out gate" text="If any answer is no, there is no trade. Sitting out is a valid session." />
          <ul className="gate-list">
            {GATE_ITEMS.map((item) => (
              <li key={item.id}>
                <label className="gate-item">
                  <input
                    type="checkbox"
                    checked={Boolean(gates[item.id])}
                    onChange={(e) => setGates((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                  />
                  <span>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className={`result-stack ${math.gateYes ? "" : "result-stop"}`}>
            <p>Gate result</p>
            <strong>{math.gateYes ? "All five yes" : "Sit out"}</strong>
            <p className="muted">{math.gateYes ? "The gate is a filter, not permission to size up." : "A no is cheaper than a revenge contract."}</p>
          </div>
        </article>
        <article className="tool-card" id="expectancy">
          <SectionHeader title="Sample expectancy" text="Win rate without the average win and loss in R is a vanity number." />
          <label className="field">
            <span>Wins in this sample</span>
            <input inputMode="numeric" value={wins} onChange={(e) => setWins(e.target.value)} />
          </label>
          <label className="field">
            <span>Losses in this sample</span>
            <input inputMode="numeric" value={losses} onChange={(e) => setLosses(e.target.value)} />
          </label>
          <label className="field">
            <span>Average win (R)</span>
            <input inputMode="decimal" value={avgWinR} onChange={(e) => setAvgWinR(e.target.value)} />
          </label>
          <label className="field">
            <span>Average loss (R)</span>
            <input inputMode="decimal" value={avgLossR} onChange={(e) => setAvgLossR(e.target.value)} />
          </label>
          <div className="result-stack">
            <p>Expectancy per trade</p>
            <strong>{math.expectancy.toFixed(2)} R</strong>
            <p className="muted">
              {math.sample < 20
                ? `Only ${math.sample} trades so far. Do not rewrite the setup until twenty.`
                : `Win rate ${pct(math.winRate * 100)}. Positive R is not a promise. Negative R means the sample is costing you.`}
            </p>
          </div>
        </article>
      </section>
      <section className="section cta-panel">
        <div>
          <h2>Want live quotes next to the same math?</h2>
          <p>The beginner desk streams public Deriv prices and runs this stake and daily-stop math against the print. It still does not place trades. The kit has the printable journal and 14-day plan.</p>
        </div>
        <div className="cta-row">
          <CTA href="/deriv-affiliate-launchpad-template/desk">Open the live desk</CTA>
          <CTA href="/deriv-affiliate-launchpad-template/kit" variant="secondary">Open the kit</CTA>
          <CTA href={affiliateConfig.demoAccountLink} variant="ghost">Open a Deriv demo</CTA>
        </div>
      </section>
    </>
  );
}
