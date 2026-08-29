import { BookOpen, Cable, ChartNoAxesCombined, MessageSquare, Search, ShieldCheck, Users, Wand2 } from "lucide-react";
import { CTA } from "../components/CTA";
import { DisclosureBand, Card, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";
import { TraderQuiz } from "../components/TraderQuiz";
import { ExitIntent } from "../components/ExitIntent";

const features = [
  ["24/7 Synthetic Indices", "Trade proprietary indices that simulate real-world market movements without being affected by news events.", Cable],
  ["Flexible Leverage", "Maximize your trading potential with flexible leverage options tailored to your strategy and risk appetite.", ShieldCheck],
  ["Fast Withdrawals", "Access your profits quickly with a variety of secure, localized, and global payment methods.", MessageSquare],
  ["Advanced Platforms", "Trade on MT5, Deriv X, or intuitive web platforms equipped with advanced charting tools.", Search],
  ["Free Demo Account", "Practice your strategies entirely risk-free with a $10,000 reloadable virtual balance.", BookOpen],
  ["Trusted Globally", "Join millions of traders worldwide trading on a regulated, established, and secure broker platform.", Wand2]
] as const;

const builtFor = [
  "Beginner Traders",
  "Forex Professionals",
  "Synthetic Index Specialists",
  "Crypto Enthusiasts",
  "Algorithmic Traders",
  "Swing Traders"
];

export function Home() {
  return (
    <>
      <Seo
        title={`${affiliateConfig.brandName} | Trade Forex & Synthetics`}
        description="Master the markets with Apex Trade Network. Trade Forex, Synthetic Indices, and Crypto on an industry-leading platform."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: affiliateConfig.brandName,
          description: "Trading community and resources for Deriv traders.",
        }}
      />
      <ExitIntent />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Trade with an industry leader</p>
          <h1>Master the markets. Trade Forex, Synthetics, and Crypto with Deriv.</h1>
          <p>
            Join a global community of traders. Access 24/7 markets, advanced charting, and lightning-fast execution on a regulated trading platform.
          </p>
          <div className="cta-row">
            <CTA href={affiliateConfig.primaryAffiliateLink}>Open Free Account</CTA>
            <a className="text-link" href={affiliateConfig.demoAccountLink}>Try a $10,000 Demo</a>
          </div>
        </div>
        <div className="hero-panel" aria-label="Affiliate funnel preview" style={{ background: 'transparent', padding: 0, border: 'none' }}>
          <TraderQuiz />
        </div>
      </section>
      <DisclosureBand />
      <section className="section">
        <SectionHeader
          eyebrow="Free toolkit"
          title="Calculators and PDFs before you fund anything"
          text="Stake planner, daily stop, 14-day demo plan, and a 20-row journal. If you open a Deriv account through this site, I may earn a commission. You keep the files either way."
        />
        <div className="cta-row">
          <CTA href="/deriv-affiliate-launchpad-template/tools">Use the free tools</CTA>
          <CTA href="/deriv-affiliate-launchpad-template/desk" variant="secondary">Open the live desk</CTA>
          <CTA href="/deriv-affiliate-launchpad-template/kit" variant="ghost">Download the kit</CTA>
        </div>
      </section>
      <section className="section">
        <SectionHeader
          eyebrow="Platform Benefits"
          title="Everything you need to succeed"
          text="Whether you're trading Forex during the week or Synthetic Indices on the weekend, Deriv provides the tools for every strategy."
        />
        <div className="card-grid">
          {features.map(([title, text, Icon]) => <Card key={title} title={title} icon={Icon}>{text}</Card>)}
        </div>
      </section>
      <section className="section split">
        <div>
          <SectionHeader
            eyebrow="Who is this for"
            title="A platform built for serious traders"
            text="From absolute beginners to seasoned professionals, Deriv offers account types and platforms suited for your exact trading style."
          />
          <CTA href={affiliateConfig.primaryAffiliateLink}>Start Trading Today</CTA>
        </div>
        <div className="audience-list">
          {builtFor.map((item) => (
            <div key={item}><Users size={18} aria-hidden="true" /><span>{item}</span></div>
          ))}
        </div>
      </section>
      <section className="section proof-strip">
        <ChartNoAxesCombined aria-hidden="true" />
        <p>
          {affiliateConfig.riskDisclaimer}
        </p>
      </section>
    </>
  );
}
