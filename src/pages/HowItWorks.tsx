import { ArrowDown, ExternalLink, GraduationCap, LineChart, Wallet, MousePointerClick, ShieldCheck } from "lucide-react";
import { CTA } from "../components/CTA";
import { Card, DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

const steps = [
  ["Open a Free Demo", "Start with a $10,000 virtual balance to test the platforms and practice your strategies risk-free.", MousePointerClick],
  ["Learn the Markets", "Access free educational resources and learn how to trade Forex, Crypto, and Synthetic Indices.", GraduationCap],
  ["Fund Your Account", "When you're ready, deposit funds using a wide range of secure, localized payment methods.", Wallet],
  ["Start Trading Live", "Execute trades with lightning-fast speed on MT5, Deriv X, or Deriv cTrader.", LineChart],
  ["Withdraw Profits", "Enjoy fast, hassle-free withdrawals directly to your preferred payment method.", ExternalLink]
] as const;

export function HowItWorks() {
  return (
    <>
      <Seo
        title={`Why Trade on Deriv? | ${affiliateConfig.brandName}`}
        description="Learn how easy it is to start trading on Deriv. Follow our simple steps from demo to live trading."
        path="/how-it-works"
      />
      <section className="page-hero">
        <p className="eyebrow">Your Path to Trading</p>
        <h1>How to start your trading journey today.</h1>
        <p>Follow these simple steps to go from complete beginner to trading live on the world's most innovative platforms.</p>
      </section>
      <section className="timeline" aria-label="Trading steps">
        {steps.map(([title, text, Icon], index) => (
          <div className="timeline-item" key={title}>
            <Card title={`${index + 1}. ${title}`} icon={Icon}>{text}</Card>
            {index < steps.length - 1 ? <ArrowDown className="timeline-arrow" aria-hidden="true" /> : null}
          </div>
        ))}
      </section>
      <section className="section split">
        <SectionHeader
          eyebrow="Security First"
          title="Regulated & Secure"
          text="Trade with confidence knowing that your funds are protected by industry-leading security protocols and global regulatory oversight."
        />
        <div className="panel">
          <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 10px 0' }}>Committed to your safety</h3>
          <p style={{ marginBottom: '20px' }}>{affiliateConfig.riskDisclaimer}</p>
          <CTA href={affiliateConfig.demoAccountLink}>Open Demo Account</CTA>
        </div>
      </section>
      <DisclosureBand />
    </>
  );
}
