import { ArrowDown, BookOpen, Eye, Link2, Lock } from "lucide-react";
import { CTA } from "../components/CTA";
import { Card, DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

const steps = [
  ["Watch the live demo", "The shared Volatility 75 run is public. Demo funds only.", Eye],
  ["Open a Deriv demo through this desk", `Use ${affiliateConfig.primaryAffiliateLink}. Referral code ${affiliateConfig.referralCode}.`, Link2],
  ["Follow the 14-day plan", "Journal the trades. Keep a daily stop. Do not skip to live money.", BookOpen],
  ["Join VIP if you want the written rules", "Site login is free. The strategy pack is only for people on this partner downline.", Lock]
] as const;

export function HowItWorks() {
  return (
    <>
      <Seo
        title={`How this desk works | ${affiliateConfig.brandName}`}
        description="Watch a live Deriv demo, open your own practice account through Iederees Francis’s partner link, then journal 14 days before considering live money."
        path="/how-it-works"
      />
      <section className="page-hero">
        <p className="eyebrow">Simple path</p>
        <h1>Watch first. Demo second. Live money last, if ever.</h1>
        <p>This is an independent partner desk, not Deriv. I may earn a commission if you sign up through my link. Trading involves risk.</p>
      </section>
      <section className="timeline" aria-label="Desk steps">
        {steps.map(([title, text, Icon], index) => (
          <div className="timeline-item" key={title}>
            <Card title={`${index + 1}. ${title}`} icon={Icon}>{text}</Card>
            {index < steps.length - 1 ? <ArrowDown className="timeline-arrow" aria-hidden="true" /> : null}
          </div>
        ))}
      </section>
      <section className="section split">
        <SectionHeader
          eyebrow="Next"
          title="Open the practice account"
          text={affiliateConfig.riskDisclaimer}
        />
        <div className="panel">
          <CTA href={affiliateConfig.demoAccountLink}>Open a Deriv demo</CTA>
        </div>
      </section>
      <DisclosureBand />
    </>
  );
}
