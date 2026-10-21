import { CTA } from "../components/CTA";
import { NewsSitoutCard } from "../components/NewsSitoutCard";
import { DisclosureBand } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

export function EccToolsCostAudit() {
  return (
    <>
      <Seo
        title="FX News Sit-Out Clock | High-Impact USD EUR GBP ZAR Windows"
        description="Sit out 15 minutes before through 15 minutes after High-impact USD, EUR, GBP, and ZAR prints. This clock is for FX desks. Volatility Indices ignore this calendar. Educational only, not financial advice."
        path="/ecc-tools-cost-audit"
      />
      <section className="page-hero">
        <p className="eyebrow">FX sit-out clock · not a billing audit</p>
        <h1>Sit out the red-folder window. Then come back.</h1>
        <p>
          This URL is a dedicated page for the FX news sit-out clock. It is not an ECC Tools billing audit. Chart Select on Volatility Indices does not use this calendar. If you trade FX, sit out 15 minutes before through 15 minutes after a High-impact USD, EUR, GBP, or ZAR print.
        </p>
      </section>
      <DisclosureBand />
      <section className="section tool-grid">
        <NewsSitoutCard />
      </section>
      <section className="section cta-panel">
        <div>
          <h2>The rest of the planners live on Tools</h2>
          <p>
            Stake size, daily stop, session clock, and the pre-trade gate stay on the tools page. This page is only the FX sit-out clock so the requested URL has a real destination.
          </p>
        </div>
        <div className="cta-row">
          <CTA href="/deriv-affiliate-launchpad-template/tools">Open all tools</CTA>
          <CTA href="/deriv-affiliate-launchpad-template/lab" variant="secondary">Watch the live demo desk</CTA>
          <CTA href={affiliateConfig.demoAccountLink} variant="ghost">Open a Deriv demo</CTA>
        </div>
      </section>
    </>
  );
}
