import { Clock, ClipboardList, MessageCircle, ShieldAlert } from "lucide-react";
import { CTA } from "../components/CTA";
import { Card, DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

export function WeeklyChallenge() {
  return (
    <>
      <Seo
        title={`Live Demo Desk Challenge | ${affiliateConfig.brandName}`}
        description="The Chart Select demo desk runs 24/7. Watch live, no login. Weekly recap every Sunday with every trade, losses included. Demo funds only. No profit claims."
        path="/weekly-challenge"
      />
      <section className="page-hero">
        <p className="eyebrow">Live Demo Desk Challenge · Demo funds only</p>
        <h1>The Chart Select demo desk runs 24/7. Watch every trade live.</h1>
        <p>No login needed. Every Sunday a weekly recap posts every trade, wins and losses, with the start and end demo balance. No cherry-picking, no profit claims. Past demo results do not predict future results.</p>
        <div className="cta-row">
          <CTA href="/deriv-affiliate-launchpad-template/lab">Watch the live demo desk</CTA>
          <CTA href={affiliateConfig.telegramGroupPath} variant="secondary">Join the Telegram group</CTA>
          <CTA href={affiliateConfig.demoAccountLink} variant="ghost">Try your own free demo</CTA>
        </div>
      </section>
      <DisclosureBand />
      <section className="section">
        <SectionHeader eyebrow="How it works" title="Always on, recapped every Sunday" />
        <div className="card-grid">
          <Card icon={Clock} title="Runs 24/7">The Chart Select demo desk trades around the clock on demo funds. Watch it live at /lab, no login.</Card>
          <Card icon={ClipboardList} title="Every trade logged">Each trade is shown as it happens, losses included.</Card>
          <Card icon={MessageCircle} title="Sunday recap">Every Sunday the weekly recap lists every trade plus the start and end demo balance, shared in the Telegram group.</Card>
          <Card icon={ShieldAlert} title="Demo only">Practice funds, not cash. No profit claims. Past demo results do not predict future results.</Card>
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Join in" title="Run it alongside on your own demo" text={`Open a free Deriv demo through the client link (referral code ${affiliateConfig.referralCode}) and journal the same markets. Stay on demo.`} />
        <div className="cta-row">
          <CTA href={affiliateConfig.demoAccountLink}>Open a free demo</CTA>
          <CTA href="/deriv-affiliate-launchpad-template/kit" variant="secondary">Get the free journal</CTA>
        </div>
      </section>
      <section className="disclosure-band" aria-label="Important disclosures">
        <strong>Important:</strong> Independent partner desk, not Deriv. Trading involves risk. Not financial advice. Demo funds only on the public desk. Past demo results do not predict future results. This desk may earn commission on signups.
      </section>
    </>
  );
}
