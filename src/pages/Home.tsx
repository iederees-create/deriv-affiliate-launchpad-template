import { BookOpen, Cable, ChartNoAxesCombined, MessageSquare, Search, ShieldCheck, Users, Wand2, Mail } from "lucide-react";
import { CTA } from "../components/CTA";
import { DisclosureBand, Card, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

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
        <div className="hero-panel" aria-label="Affiliate funnel preview">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Get our Free Trading Guide</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>Enter your email to receive our exclusive guide: "5 Strategies for Synthetic Indices".</p>
          <form onSubmit={(e) => { e.preventDefault(); alert("Email captured! We will integrate this with your email provider next."); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--muted)' }} />
              <input type="email" placeholder="Your best email..." required style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid var(--line)', background: 'rgba(0,0,0,0.2)', color: 'var(--text)', outline: 'none' }} />
            </div>
            <button type="submit" className="cta cta-primary" style={{ border: 'none', cursor: 'pointer', width: '100%' }}>Send me the guide</button>
          </form>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '12px', textAlign: 'center' }}>No spam, unsubscribe anytime.</p>
        </div>
      </section>
      <DisclosureBand />
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
