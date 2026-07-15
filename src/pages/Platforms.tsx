import { Bot, CandlestickChart, ChartArea, LineChart, MonitorSmartphone, Smartphone } from "lucide-react";
import { CTA } from "../components/CTA";
import { Card, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

const platforms = [
  ["Deriv MT5", "Multi-asset trading terminal commonly used by advanced traders where available.", CandlestickChart],
  ["Deriv Bot", "Automation-oriented platform for users exploring rule-based trading concepts.", Bot],
  ["Deriv Trader", "Browser-based trading experience for eligible users and regions.", MonitorSmartphone],
  ["Deriv GO", "Mobile-first trading access where supported by the broker and region.", Smartphone],
  ["cTrader", "A third-party trading platform supported by selected brokers and programmes.", ChartArea],
  ["TradingView", "Charting and analysis platform availability depends on integration, account type, and region.", LineChart]
] as const;

export function Platforms() {
  return (
    <>
      <Seo
        title="Trading Platform Cards for Broker Affiliate Funnels"
        description="Rebrandable platform education cards for MT5, bot, web, mobile, cTrader, and TradingView affiliate funnels."
        path="/platforms"
      />
      <section className="page-hero">
        <p className="eyebrow">Platform education</p>
        <h1>Help visitors understand platform options before they click.</h1>
        <p>Availability depends on broker programme, account type, country, regulation, and current product support.</p>
      </section>
      <section className="section">
        <SectionHeader title="Demo platform cards" text="Edit or remove cards to match the affiliate programme being promoted." />
        <div className="card-grid">
          {platforms.map(([title, text, Icon]) => <Card key={title} title={title} icon={Icon}>{text}</Card>)}
        </div>
      </section>
      <section className="section cta-panel">
        <div>
          <h2>Route interested visitors to the configured demo link.</h2>
          <p>Use demo-first routing for education-heavy audiences and stronger risk disclosure for live-account routes.</p>
        </div>
        <CTA href={affiliateConfig.demoAccountLink}>Open demo account route</CTA>
      </section>
    </>
  );
}
