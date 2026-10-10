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
        title={`Live Chart Select desk | ${affiliateConfig.brandName}`}
        description="Watch a shared Deriv demo scan selected volatility charts. Chart Select opens CALL when RSI turns up from oversold. $0.35 default; $1 on R_10 15m and 1HZ25V 10m. Practice funds only. Not an 80% win-rate claim."
        path="/lab"
        image="https://iederees-create.github.io/deriv-affiliate-launchpad-template/og-rsi-eclipse.svg"
        imageAlt="Apex Chart Select live practice desk across six timeframes"
      />
      <section className="section">
        <p className="eyebrow">Open to everyone</p>
        <h1>Watch the Chart Select desk</h1>
        <p className="text-muted-foreground" style={{ maxWidth: '42rem', margin: '12px 0 16px' }}>
          You do not need an account to watch. CALL Pulse on selected volatility charts. Drain markets sit out. Not Boom, Crash, Step, FX, metals, crypto or stock indices. Each market uses the timeframes that paid on a 90-day replay. RSI turns up from 38 with a green close. $0.35 default; $1 only on R_10 15m and 1HZ25V 10m. Expiry matches the chart. Demo funds only. Partner link {affiliateConfig.primaryAffiliateLink} · referral {affiliateConfig.referralCode}.
        </p>
        <div className="cta-row" style={{ margin: '8px 0 16px' }}>
          <CTA href={partnerCampaignUrl("lab", "site")}>Open the same markets on your Deriv demo</CTA>
        </div>
        <div className="page-share">
          <ShareBar
            url="https://iederees-create.github.io/deriv-affiliate-launchpad-template/lab"
            title="Watch Apex Chart Select — a live Deriv practice desk"
            text="CALL Pulse on selected volatility charts. $0.35 default; $1 on R_10 15m and 1HZ25V 10m. Demo funds only. Not an 80% win-rate claim."
          />
        </div>
        <PublicLiveBoard />
      </section>
      <DisclosureBand />
    </>
  );
}
