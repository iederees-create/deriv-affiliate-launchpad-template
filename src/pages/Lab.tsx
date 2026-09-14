import { Seo } from '../components/Seo';
import { DisclosureBand } from '../components/Section';
import { PublicLiveBoard } from '../components/PublicLiveBoard';
import { ShareBar } from '../components/ShareBar';
import { affiliateConfig } from '../config/affiliateConfig';

export function Lab() {
  return (
    <>
      <Seo
        title={`Live RSI Eclipse desk | ${affiliateConfig.brandName}`}
        description="Watch a shared Deriv demo scan 15 volatility markets plus gold, silver, palladium and platinum on 5-minute through daily charts. RSI 20/80, one contract at a time, practice funds only."
        path="/lab"
        image="https://iederees-create.github.io/deriv-affiliate-launchpad-template/og-rsi-eclipse.svg"
        imageAlt="Apex RSI Eclipse live practice desk across six timeframes"
      />
      <section className="section">
        <p className="eyebrow">Open to everyone</p>
        <h1>Watch the RSI Eclipse desk</h1>
        <p className="text-muted-foreground" style={{ maxWidth: '42rem', margin: '12px 0 16px' }}>
          You do not need an account to watch. The grid is 15 volatility indices plus Gold, Silver, Palladium and Platinum, not Boom, Crash or Step, on 5m, 10m, 15m, 30m, 1h, 2h, 4h, 8h and daily charts. Demo funds only. Partner link {affiliateConfig.primaryAffiliateLink} · referral {affiliateConfig.referralCode}.
        </p>
        <div className="page-share">
          <ShareBar
            url="https://iederees-create.github.io/deriv-affiliate-launchpad-template/lab"
            title="Watch Apex RSI Eclipse — a live Deriv practice desk"
            text="19 markets including gold and silver, nine charts, RSI 20/80. Demo funds only."
          />
        </div>
        <PublicLiveBoard />
      </section>
      <DisclosureBand />
    </>
  );
}
