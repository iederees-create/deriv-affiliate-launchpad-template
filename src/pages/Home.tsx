import { BookOpen, MessageCircle, ShieldCheck } from "lucide-react";
import { CTA, WhatsAppCTA } from "../components/CTA";
import { DisclosureBand, Card, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig, whatsappUrl } from "../config/affiliateConfig";
import { partnerCampaignUrl } from "../lib/relay";
import { PublicLiveBoard } from "../components/PublicLiveBoard";
import { ExitIntent } from "../components/ExitIntent";

const path = [
  ["Watch", "Stay on this page. The board is a Deriv demo, not cash."],
  ["Open a demo", `Click the partner link on this page. Referral code ${affiliateConfig.referralCode}.`],
  ["Practise 14 days", "Journal the trades. Do not skip to live money."],
  ["Tell me", "WhatsApp once the demo is open. I cannot see Deriv signups from this site."]
] as const;

export function Home() {
  return (
    <>
      <Seo
        title={`${affiliateConfig.brandName} | Watch a live Deriv demo`}
        description="Watch Apex Call Pulse Select: a shared Deriv demo that takes CALL recoveries on volatility 5m–15m charts. 5m/15m still ≤28 at $4; 10m stays $0.35. Practice funds only. Not an 80% win-rate claim."
        image="https://iederees-create.github.io/deriv-affiliate-launchpad-template/og-rsi-eclipse.svg"
        imageAlt="Apex Call Pulse Select live practice desk"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: affiliateConfig.brandName,
          description: "Independent Deriv partner desk run by Iederees Francis.",
        }}
      />
      <ExitIntent />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Independent partner desk · Iederees Francis</p>
          <h1>Watch Call Pulse Select live. Then open your own Deriv demo.</h1>
          <p>
            This is not the broker. I may earn a commission if you sign up through my link.
            The test below uses demo funds only. Trading involves risk. Not financial advice.
          </p>
          <div className="cta-row">
            <CTA href={partnerCampaignUrl("home", "site")}>Open a free Deriv demo</CTA>
            <a className="text-link" href={whatsappUrl("Hi Iederees, I watched Call Pulse Select and opened a Deriv demo through your partner link.")}>Message me on WhatsApp</a>
          </div>
          <p className="fine-print">Partner link {affiliateConfig.primaryAffiliateLink} · Referral code {affiliateConfig.referralCode}</p>
        </div>
        <div className="hero-panel founder-card">
          <p className="eyebrow">Who runs this</p>
          <h2>{affiliateConfig.affiliateOwnerName}</h2>
          <p>Cape Town. I built this desk so people can see a real demo before anyone asks them to deposit.</p>
          <div className="cta-row">
            <a className="text-link" href={affiliateConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </section>
      <DisclosureBand />
      <section className="section">
        <SectionHeader
          eyebrow="Live now"
          title="Shared Call Pulse Select practice desk"
          text="No login needed. CALL only on volatility indices, after RSI turns up from 38. 5m and 15m still need RSI at or below 28 ($4). 10m stays $0.35. Classic Volatility 25 and 50 sit out. No PUT book, no FX or metals. Demo wallet and trades update as they happen. Not an 80% win-rate claim."
        />
        <PublicLiveBoard />
      </section>
      <section className="section">
        <SectionHeader
          eyebrow="What to do next"
          title="Four steps. Nothing fancy."
        />
        <div className="card-grid">
          {path.map(([title, text], index) => (
            <Card key={title} title={`${index + 1}. ${title}`}>{text}</Card>
          ))}
        </div>
        <div className="cta-row" style={{ marginTop: 24 }}>
          <CTA href={partnerCampaignUrl("home-path", "site")}>Open the same markets on your demo</CTA>
          <CTA href="/deriv-affiliate-launchpad-template/kit" variant="secondary">Open the 14-day demo plan</CTA>
        </div>
      </section>
      <section className="section">
        <SectionHeader
          eyebrow="Free toolkit"
          title="Calculators before you fund anything"
          text="Stake planner, daily stop, and a journal. They do not place trades."
        />
        <div className="card-grid">
          <Card title="Tools" icon={ShieldCheck}>Plan stake and daily stop in the browser.</Card>
          <Card title="Kit" icon={BookOpen}>Printable 14-day plan and 20-row journal.</Card>
          <Card title="WhatsApp" icon={MessageCircle}>Tell me if you opened a demo. I cannot see Deriv signups from here.</Card>
        </div>
        <div className="cta-row" style={{ marginTop: 24 }}>
          <CTA href="/deriv-affiliate-launchpad-template/tools">Use the free tools</CTA>
          <WhatsAppCTA label="Say you opened a demo" />
        </div>
      </section>
    </>
  );
}
