import { ArrowDown, ExternalLink, FileWarning, GraduationCap, LayoutDashboard, MousePointerClick, Search } from "lucide-react";
import { CTA } from "../components/CTA";
import { Card, DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

const steps = [
  ["Visitor lands from social/search", "A creator, IB, or affiliate sends traffic from YouTube, TikTok, paid ads, email, SEO, or community posts.", Search],
  ["Learns about trading platforms", "The visitor sees platform education, use cases, and plain explanations before seeing a signup route.", GraduationCap],
  ["Sees risk disclosure", "Risk warnings and affiliate disclosures appear before conversion prompts.", FileWarning],
  ["Chooses a demo/live route", "Buttons route to demo, live, or partner-programme links pulled from one config file.", MousePointerClick],
  ["Clicks affiliate link", "The affiliate link is configured by the buyer and can be replaced without editing page components.", ExternalLink],
  ["Partner tracks performance", "The affiliate owner monitors registrations, deposits, activity, and commissions in their partner dashboard.", LayoutDashboard]
] as const;

export function HowItWorks() {
  return (
    <>
      <Seo
        title="How the Trading Affiliate Funnel Works"
        description="See how a broker affiliate website turns social and search traffic into disclosed, risk-aware referral paths."
        path="/how-it-works"
      />
      <section className="page-hero">
        <p className="eyebrow">Editable funnel map</p>
        <h1>How the affiliate website routes attention into tracked partner links.</h1>
        <p>The funnel is structured to educate first, disclose risk clearly, and then present configured affiliate routes.</p>
      </section>
      <section className="timeline" aria-label="Affiliate funnel steps">
        {steps.map(([title, text, Icon], index) => (
          <div className="timeline-item" key={title}>
            <Card title={`${index + 1}. ${title}`} icon={Icon}>{text}</Card>
            {index < steps.length - 1 ? <ArrowDown className="timeline-arrow" aria-hidden="true" /> : null}
          </div>
        ))}
      </section>
      <section className="section split">
        <SectionHeader
          eyebrow="Diagram copy"
          title="Buyer-editable conversion logic"
          text="Replace the demo brand, CTA labels, route descriptions, and configured links to match the partner programme you promote."
        />
        <div className="panel">
          <p>{affiliateConfig.disclosureText}</p>
          <p>{affiliateConfig.riskDisclaimer}</p>
          <CTA href={affiliateConfig.demoAccountLink}>Test demo route</CTA>
        </div>
      </section>
      <DisclosureBand />
    </>
  );
}
