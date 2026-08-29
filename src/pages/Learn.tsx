import { BookOpenCheck, HandCoins, Handshake, Info, Scale } from "lucide-react";
import { CTA } from "../components/CTA";
import { Card, DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";

const lessons = [
  ["What is affiliate trading?", "In this context, affiliate trading means promoting a broker, trading platform, or partner programme through tracked links. It does not mean that the affiliate trades for the visitor.", HandCoins],
  ["What is an introducing broker?", "An introducing broker, or IB, generally refers prospects to a broker and may earn according to a partner agreement.", Handshake],
  ["How revenue share works", "Revenue share is a commercial model where eligible client activity may generate partner commission. Exact terms must be verified with the programme.", Scale],
  ["What risk disclosure means", "Risk disclosure tells visitors that trading can lead to losses and that the affiliate may earn commission from referrals.", Info],
  ["Education vs financial advice", "Education explains concepts. Financial advice recommends actions based on a person’s circumstances. This template is for educational affiliate funnels only.", BookOpenCheck]
] as const;

export function Learn() {
  return (
    <>
      <Seo
        title="Trading Affiliate Education Hub"
        description="Beginner education sections for trading affiliate websites, introducing brokers, and finance creators."
        path="/learn"
      />
      <section className="page-hero">
        <p className="eyebrow">Beginner education</p>
        <h1>Teach the basics before asking visitors to register.</h1>
        <p>Trust grows when the funnel explains the commercial relationship, the trading risk, and the limits of educational content.</p>
      </section>
      <section className="section">
        <SectionHeader title="Starter learning modules" text="Use these sections as editable copy blocks for your rebranded template." />
        <div className="card-grid">
          {lessons.map(([title, text, Icon]) => <Card key={title} title={title} icon={Icon}>{text}</Card>)}
        </div>
      </section>
      <section className="section cta-panel">
        <div>
          <h2>Practice the 14-day path on the desk</h2>
          <p>The live desk pairs those lessons with read-only quotes, a stake planner, and a day-by-day demo checklist. Education stays education. The desk does not place trades.</p>
        </div>
        <CTA href="/deriv-affiliate-launchpad-template/desk">Open the beginner desk</CTA>
      </section>
      <DisclosureBand />
    </>
  );
}
