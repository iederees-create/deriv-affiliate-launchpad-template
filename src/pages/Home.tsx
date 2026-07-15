import { BookOpen, Cable, ChartNoAxesCombined, MessageSquare, Search, ShieldCheck, Users, Wand2 } from "lucide-react";
import { CTA } from "../components/CTA";
import { DisclosureBand, Card, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

const features = [
  ["Affiliate link manager", "Keep demo, live, partner, WhatsApp, and social links in one editable config file.", Cable],
  ["Risk disclosure sections", "Use visible, plain-language risk and affiliate disclosures throughout the funnel.", ShieldCheck],
  ["WhatsApp-ready lead capture", "Route warm prospects into a chat workflow without needing a backend.", MessageSquare],
  ["SEO blog structure", "Publish educational posts that build search visibility before visitors click a partner link.", Search],
  ["Broker programme explainer", "Explain the partner route without implying endorsement or guaranteed earnings.", BookOpen],
  ["Rebrandable design system", "Adjust brand name, colours, links, and copy for other broker affiliate programmes.", Wand2]
] as const;

const builtFor = [
  "Introducing brokers",
  "Trading educators",
  "Finance creators",
  "Signal communities",
  "YouTubers/TikTok traders",
  "Affiliate marketers"
];

export function Home() {
  return (
    <>
      <Seo
        title="Trading Affiliate Website Template | Broker Partner Funnel"
        description="A premium rebrandable affiliate marketing website template for trading affiliates, introducing brokers, finance creators, and broker partner programme promoters."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: affiliateConfig.productName,
          description: "A static website template for broker affiliate funnels with editable links, disclosures, and educational content.",
          creator: { "@type": "Organization", name: "NextGenWebs" }
        }}
      />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Premium broker affiliate funnel template</p>
          <h1>Launch a broker affiliate website built to convert attention into referred traders.</h1>
          <p>
            A polished, compliance-aware website system for affiliates and introducing brokers who need more than a raw link in a bio.
          </p>
          <div className="cta-row">
            <CTA href={affiliateConfig.demoAccountLink}>Start with demo affiliate link</CTA>
            <a className="text-link" href="/deriv-affiliate-launchpad-template/how-it-works">Learn how the funnel works</a>
          </div>
        </div>
        <div className="hero-panel" aria-label="Affiliate funnel preview">
          <div className="metric"><span>01</span><strong>Educate visitors</strong></div>
          <div className="metric"><span>02</span><strong>Build trust</strong></div>
          <div className="metric"><span>03</span><strong>Disclose risk</strong></div>
          <div className="metric"><span>04</span><strong>Route through links</strong></div>
          <div className="metric"><span>05</span><strong>Capture warm leads</strong></div>
        </div>
      </section>
      <DisclosureBand />
      <section className="section">
        <SectionHeader
          eyebrow="System"
          title="Built around the full affiliate journey"
          text="The template helps visitors understand the topic, see the risks, choose a route, and contact the affiliate owner without fake income claims."
        />
        <div className="card-grid">
          {features.map(([title, text, Icon]) => <Card key={title} title={title} icon={Icon}>{text}</Card>)}
        </div>
      </section>
      <section className="section split">
        <div>
          <SectionHeader
            eyebrow="Built for"
            title="Finance creators who need a credible destination"
            text="Use it as a demo brand, then rebrand for a specific affiliate programme, audience, language, or niche."
          />
          <CTA href={affiliateConfig.primaryAffiliateLink}>Open primary affiliate route</CTA>
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
          This template focuses on education, routing, disclosure, and follow-up. It does not promise trading profits, commissions, conversion rates, or affiliate earnings.
        </p>
      </section>
    </>
  );
}
