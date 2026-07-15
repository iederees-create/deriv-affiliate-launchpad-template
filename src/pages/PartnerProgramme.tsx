import { BadgeDollarSign, ChartCandlestick, GitBranch, Handshake, ShieldAlert } from "lucide-react";
import { CTA } from "../components/CTA";
import { Card, DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

export function PartnerProgramme() {
  return (
    <>
      <Seo
        title="Deriv Partner Programme Demo Page | Affiliate Template"
        description="A cautious, editable demo page for explaining broker partner programme routes, disclosures, and affiliate CTAs."
        path="/partner-programme"
      />
      <section className="page-hero">
        <p className="eyebrow">Deriv Partner programme demo</p>
        <h1>Explain the partner opportunity without implying endorsement or guaranteed results.</h1>
        <p>
          This page is a demo template. It is not an official Deriv website and should be reviewed against the current partner programme rules before publication.
        </p>
      </section>
      <DisclosureBand />
      <section className="section">
        <SectionHeader
          eyebrow="Programme explainer"
          title="Cautious wording for affiliate education"
          text="Public Deriv partner materials describe revenue share, turnover-based CFD commissions, and Master Partner referral structures."
        />
        <div className="card-grid">
          <Card icon={BadgeDollarSign} title="Revenue share">
            Some partner programmes may pay a share of eligible client activity. Exact terms depend on the programme, region, and current partner agreement.
          </Card>
          <Card icon={ChartCandlestick} title="CFD commission concepts">
            Turnover-based commissions may be described for CFD activity in public partner materials, but buyers should verify current terms directly.
          </Card>
          <Card icon={GitBranch} title="Master Partner structures">
            Some programmes describe partner-to-partner referral structures. This template presents the concept without promising eligibility or income.
          </Card>
          <Card icon={ShieldAlert} title="Risk-first presentation">
            Visitors should see risk and affiliate disclosures before deciding whether to open demo, live, or partner routes.
          </Card>
        </div>
      </section>
      <section className="section source-note">
        <h2>Source note for buyers</h2>
        <p>
          Add real citations or links to official public partner pages after you review current materials. Do not fake citations or imply approval from a broker.
        </p>
      </section>
      <section className="section cta-panel">
        <Handshake aria-hidden="true" />
        <div>
          <h2>Choose the route that fits the visitor intent.</h2>
          <p>All three buttons below use editable placeholder links from `src/config/affiliateConfig.ts`.</p>
          <div className="cta-row">
            <CTA href={affiliateConfig.demoAccountLink}>Start with demo account</CTA>
            <CTA href={affiliateConfig.learnBasicsLink} variant="secondary">Learn trading basics</CTA>
            <CTA href={affiliateConfig.partnerProgrammeLink} variant="ghost">Join partner programme</CTA>
          </div>
        </div>
      </section>
    </>
  );
}
