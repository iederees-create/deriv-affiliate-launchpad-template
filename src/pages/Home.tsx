import { BookOpen, MessageCircle, ShieldCheck } from "lucide-react";
import { CTA, WhatsAppCTA } from "../components/CTA";
import { DisclosureBand, Card, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig, whatsappUrl } from "../config/affiliateConfig";
import { PublicLiveBoard } from "../components/PublicLiveBoard";
import { ExitIntent } from "../components/ExitIntent";

const path = [
  ["Watch", "Stay on this page. The board is a Deriv demo, not cash."],
  ["Open a demo", `Use the partner link. Referral code ${affiliateConfig.referralCode}.`],
  ["Practise 14 days", "Journal the trades. Do not skip to live money."],
  ["Join VIP", "Sign in here if you want the written rules and planning tools."]
] as const;

export function Home() {
  return (
    <>
      <Seo
        title={`${affiliateConfig.brandName} | Watch a live Deriv demo`}
        description="Watch a shared Volatility 75 practice run on Deriv demo funds. Then open your own demo through Iederees Francis’s partner link."
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
          <h1>Watch a live practice run. Then open your own Deriv demo.</h1>
          <p>
            This is not the broker. I may earn a commission if you sign up through my link.
            The test below uses demo funds only. Trading involves risk. Not financial advice.
          </p>
          <div className="cta-row">
            <CTA href={affiliateConfig.demoAccountLink}>Open a free Deriv demo</CTA>
            <a className="text-link" href={whatsappUrl("Hi Iederees, I watched the V75 practice run and opened a demo through your link.")}>Message me on WhatsApp</a>
          </div>
          <p className="fine-print">Partner link {affiliateConfig.primaryAffiliateLink} · Referral code {affiliateConfig.referralCode}</p>
        </div>
        <div className="hero-panel founder-card">
          <p className="eyebrow">Who runs this</p>
          <h2>{affiliateConfig.affiliateOwnerName}</h2>
          <p>Cape Town. I built this desk so people can see a real demo before anyone asks them to deposit.</p>
          <div className="cta-row">
            <a className="text-link" href={affiliateConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="text-link" href={affiliateConfig.socialLinks.x} target="_blank" rel="noreferrer">X</a>
            <a className="text-link" href={affiliateConfig.socialLinks.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a className="text-link" href={affiliateConfig.socialLinks.youtube} target="_blank" rel="noreferrer">YouTube</a>
          </div>
        </div>
      </section>
      <DisclosureBand />
      <section className="section">
        <SectionHeader
          eyebrow="Live now"
          title="Shared Volatility 75 practice run"
          text="No login needed to watch. Demo wallet, trades, and this week’s result update as they happen."
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
          <CTA href="/deriv-affiliate-launchpad-template/kit">Open the 14-day demo plan</CTA>
          <CTA href="/deriv-affiliate-launchpad-template/auth" variant="secondary">Create a free site login</CTA>
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
