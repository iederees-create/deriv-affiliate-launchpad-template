import { Link, useParams } from "react-router-dom";
import { CTA } from "../components/CTA";
import { PublicLiveBoard } from "../components/PublicLiveBoard";
import { DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";
import { getStrategy, statusLabels, type Strategy } from "../data/strategies";
import { partnerCampaignUrl } from "../lib/relay";

const BASE = "/deriv-affiliate-launchpad-template";

function RecordPanel({ strategy }: { strategy: Strategy }) {
  const { record } = strategy;
  if (record.kind === "lab-board") {
    return (
      <>
        <p className="fine-print">
          This is the live record. It includes losing trades and updates as trades finish. Judge it only once it has at
          least {record.minimumTrades} finished trades.
        </p>
        <PublicLiveBoard />
      </>
    );
  }
  if (record.kind === "external" && record.url) {
    return (
      <div className="strategy-record">
        <p>
          The results for this strategy are published on a third-party record you can check yourself, including every
          losing trade.
        </p>
        <div className="cta-row">
          <CTA href={record.url} variant="secondary">{record.label}</CTA>
        </div>
      </div>
    );
  }
  return (
    <div className="strategy-record">
      <p>
        <strong>No verified record yet.</strong> This strategy has not been tested in public, so there are no numbers to
        show and none are implied.
      </p>
      <p>It will only be described as tested once all of this is true:</p>
      <ul className="strategy-list">
        <li>At least {record.minimumTrades} closed trades on a demo or small live account.</li>
        <li>A public, read-only record (for example Myfxbook or an MQL5 Signal) that anyone can open.</li>
        <li>The record includes every losing trade and the maximum drawdown.</li>
      </ul>
    </div>
  );
}

export function StrategyPage() {
  const { slug } = useParams();
  const strategy = getStrategy(slug);

  if (!strategy) {
    return (
      <section className="section">
        <h1>Strategy not found</h1>
        <p>That strategy page does not exist.</p>
        <div className="cta-row">
          <Link className="text-link" to="/strategies">See all strategies</Link>
        </div>
      </section>
    );
  }

  const contentTag = `strategy-${strategy.slug}`;

  return (
    <>
      <Seo
        title={`${strategy.name} | ${affiliateConfig.brandName}`}
        description={`${strategy.summary} ${statusLabels[strategy.status]}. Not financial advice.`}
        path={`/strategies/${strategy.slug}`}
      />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="strategy-badge" data-status={strategy.status}>{statusLabels[strategy.status]}</span>
          </p>
          <h1>{strategy.name}</h1>
          <p>{strategy.summary}</p>
          <p className="fine-print">{affiliateConfig.disclosureText}</p>
          <div className="cta-row">
            <CTA href={partnerCampaignUrl(contentTag, "site")}>Open a free Deriv demo to test it yourself</CTA>
            <Link className="text-link" to="/strategies">All strategies</Link>
          </div>
          <p className="fine-print">Demo first. 18+ only. Referral code {affiliateConfig.referralCode}.</p>
        </div>
        <div className="hero-panel">
          <div className="strategy-facts">
            <div><span>Market</span><strong>{strategy.market}</strong></div>
            <div><span>Timeframe</span><strong>{strategy.timeframe}</strong></div>
            <div><span>Last updated</span><strong>{strategy.updated}</strong></div>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="The rule" title="Exactly what it does" text="Written in plain English so you can check it against any record." />
        <ul className="strategy-list">
          {strategy.rule.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Risk controls" title="How losses are limited" />
        <ul className="strategy-list">
          <li><strong>Per trade:</strong> {strategy.risk.perTrade}</li>
          <li><strong>Stop:</strong> {strategy.risk.stop}</li>
          <li><strong>Daily limit:</strong> {strategy.risk.dailyStop}</li>
        </ul>
        <p className="fine-print">{strategy.breakEvenNote}</p>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Results" title="The record" />
        <RecordPanel strategy={strategy} />
      </section>

      <section className="section">
        <SectionHeader eyebrow="Be honest with yourself" title="Known limits" />
        <ul className="strategy-list">
          {strategy.limits.map((line) => <li key={line}>{line}</li>)}
        </ul>
        <div className="cta-row" style={{ marginTop: 24 }}>
          <CTA href={`${BASE}/tools`} variant="secondary">Check the expectancy maths first</CTA>
          <CTA href={`${BASE}/kit`} variant="secondary">Open the 14-day demo plan</CTA>
        </div>
      </section>

      <DisclosureBand />
      <p className="fine-print" style={{ padding: "0 24px 32px" }}>{affiliateConfig.riskDisclaimer}</p>
    </>
  );
}
