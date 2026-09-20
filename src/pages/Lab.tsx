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
        description="Watch a shared Deriv demo scan volatility indices. Eclipse Call Guard only opens CALL when RSI is oversold and then turns. Practice funds only. Not a 90% win-rate claim."
        path="/lab"
        image="https://iederees-create.github.io/deriv-affiliate-launchpad-template/og-rsi-eclipse.svg"
        imageAlt="Apex RSI Eclipse live practice desk across six timeframes"
      />
      <section className="section">
        <p className="eyebrow">Open to everyone</p>
        <h1>Watch the Eclipse Call Guard desk</h1>
        <p className="text-muted-foreground" style={{ maxWidth: '42rem', margin: '12px 0 16px' }}>
          You do not need an account to watch. The live book is CALL-only on volatility indices (R_ and 1-second). Not Boom, Crash, Step, FX, metals, crypto or stock indices. Signal charts: 10m, 15m and 30m. The desk sits out 06:00–12:00 UTC. Demo funds only. Partner link {affiliateConfig.primaryAffiliateLink} · referral {affiliateConfig.referralCode}.
        </p>
        <div className="page-share">
          <ShareBar
            url="https://iederees-create.github.io/deriv-affiliate-launchpad-template/lab"
            title="Watch Apex Eclipse Call Guard — a live Deriv practice desk"
            text="CALL-only volatility mean-reversion. RSI must turn up from oversold, with extra filters. Demo funds only. Not a 90% win-rate claim."
          />
        </div>
        <PublicLiveBoard />
      </section>
      <DisclosureBand />
    </>
  );
}
