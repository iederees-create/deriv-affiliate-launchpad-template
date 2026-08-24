import { AlertTriangle, BadgeAlert, FileText, ShieldAlert } from "lucide-react";
import { Card, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

export function RiskDisclosure() {
  return (
    <>
      <Seo
        title="Risk Disclosure | Apex Trade Network"
        description="Clear affiliate and trading risk disclosure page for a broker affiliate website template."
        path="/risk-disclosure"
      />
      <section className="page-hero risk-hero">
        <p className="eyebrow">Risk disclosure</p>
        <h1>Trading involves risk. Visitors should understand risk before trading.</h1>
        <p>{affiliateConfig.riskDisclaimer}</p>
      </section>
      <section className="section">
        <SectionHeader title="Core disclosures" text="Keep this page visible in the footer and before high-intent CTAs." />
        <div className="card-grid">
          <Card icon={AlertTriangle} title="Trading involves risk">
            Market outcomes are uncertain. Visitors can lose money and should not trade money they cannot afford to lose.
          </Card>
          <Card icon={ShieldAlert} title="CFDs are leveraged products">
            CFDs and other leveraged products can amplify gains and losses. Leverage can make losses happen quickly.
          </Card>
          <Card icon={BadgeAlert} title="Affiliate commissions">
            The website owner may earn commissions when visitors register, deposit, trade, or become partners through affiliate links.
          </Card>
          <Card icon={FileText} title="Educational, not advice">
            Website content is educational and promotional. It is not personal investment, legal, tax, or financial advice.
          </Card>
        </div>
      </section>
    </>
  );
}
