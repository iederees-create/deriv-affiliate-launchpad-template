import { Seo } from '../components/Seo';
import { DisclosureBand } from '../components/Section';
import { PublicLiveBoard } from '../components/PublicLiveBoard';
import { ShareBar } from '../components/ShareBar';
import { CTA } from '../components/CTA';
import { affiliateConfig } from '../config/affiliateConfig';
import { partnerCampaignUrl } from '../lib/relay';

export function Lab() {
  return (
    <>
      <Seo
        title={`Live Call Pulse Select desk | ${affiliateConfig.brandName}`}
        description="Watch a shared Deriv demo scan volatility indices. Call Pulse Select opens CALL when RSI turns up from oversold. 5m still ≤28 at $3; 10m/15m still ≤32 at $0.35. Practice funds only. Not an 80% win-rate claim."
        path="/lab"
        image="https://iederees-create.github.io/deriv-affiliate-launchpad-template/og-rsi-eclipse.svg"
        imageAlt="Apex Call Pulse Select live practice desk across six timeframes"
      />
      <section className="section">
        <p className="eyebrow">Open to everyone</p>
        <h1>Watch the Call Pulse Select desk</h1>
        <p className="text-muted-foreground" style={{ maxWidth: '42rem', margin: '12px 0 16px' }}>
          You do not need an account to watch. CALL-only on volatility indices (R_ and 1-second). Not Boom, Crash, Step, FX, metals, crypto or stock indices. Signal charts: 5m, 10m and 15m. RSI turns up from 38 with a green close. 5-minute charts still need RSI at or below 28 ($3). 10m and 15m still fire at or below 32 ($0.35). Demo funds only. Partner link {affiliateConfig.primaryAffiliateLink} · referral {affiliateConfig.referralCode}.
        </p>
        <div className="cta-row" style={{ margin: '8px 0 16px' }}>
          <CTA href={partnerCampaignUrl("lab", "site")}>Open the same markets on your Deriv demo</CTA>
        </div>
        <div className="page-share">
          <ShareBar
            url="https://iederees-create.github.io/deriv-affiliate-launchpad-template/lab"
            title="Watch Apex Call Pulse Select — a live Deriv practice desk"
            text="CALL-only: RSI turns up from 38. M5 still ≤28 ($3). M10/M15 still ≤32 at $0.35. Demo funds only. Not an 80% win-rate claim."
          />
        </div>
        <PublicLiveBoard />
      </section>
      <DisclosureBand />
    </>
  );
}
