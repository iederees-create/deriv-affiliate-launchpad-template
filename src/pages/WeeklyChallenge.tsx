import { CalendarDays, ClipboardList, MessageCircle, ShieldAlert } from "lucide-react";
import { CTA } from "../components/CTA";
import { Card, DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

export function WeeklyChallenge() {
  return (
    <>
      <Seo
        title={`Weekly Demo Challenge | ${affiliateConfig.brandName}`}
        description="Once a week: a Chart Select session on the live demo desk. Every trade posted, losses included. Demo funds only. No profit claims."
        path="/weekly-challenge"
      />
      <section className="page-hero">
        <p className="eyebrow">Weekly Demo Challenge · Demo funds only</p>
        <h1>One Chart Select demo session a week. Every trade posted.</h1>
        <p>Wins and losses both. No cherry-picking, no profit claims. Past demo results do not predict future results.</p>
        <div className="cta-row">
          <CTA href={affiliateConfig.telegramGroupPath}>Join the Telegram group</CTA>
          <CTA href={affiliateConfig.demoAccountLink} variant="secondary">Try your own free demo</CTA>
          <CTA href="/deriv-affiliate-launchpad-template/lab" variant="ghost">Watch the live demo desk</CTA>
        </div>
      </section>
      <DisclosureBand />
      <section className="section">
        <SectionHeader eyebrow="How it works" title="Same rules every week" />
        <div className="card-grid">
          <Card icon={CalendarDays} title="Once a week">A Chart Select session runs on the public live demo desk. Anyone can watch, no login.</Card>
          <Card icon={ClipboardList} title="Every trade posted">Each trade is logged, losses included, with the demo balance before and after.</Card>
          <Card icon={MessageCircle} title="Shared in Telegram">The weekly recap goes to the Telegram demo-updates group.</Card>
          <Card icon={ShieldAlert} title="Demo only">Practice funds, not cash. No profit claims. Past demo results do not predict future results.</Card>
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Join in" title="Run it alongside on your own demo" text={`Open a free Deriv demo through the client link (referral code ${affiliateConfig.referralCode}) and journal the same session. Stay on demo.`} />
        <div className="cta-row">
          <CTA href={affiliateConfig.demoAccountLink}>Open a free demo</CTA>
          <CTA href="/deriv-affiliate-launchpad-template/kit" variant="secondary">Get the free journal</CTA>
        </div>
      </section>
      <section className="disclosure-band" aria-label="Important disclosures">
        <strong>Important:</strong> Independent partner desk, not Deriv. Trading involves risk. Not financial advice. Demo funds only on the public desk. This desk may earn commission on signups.
      </section>
    </>
  );
}
