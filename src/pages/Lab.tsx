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
        description="Watch a shared Deriv demo scan volatility, metals, FX pairs, BTC/ETH and stock indices. Eclipse Guard only opens when RSI is extreme and then turns. Practice funds only."
        path="/lab"
        image="https://iederees-create.github.io/deriv-affiliate-launchpad-template/og-rsi-eclipse.svg"
        imageAlt="Apex RSI Eclipse live practice desk across six timeframes"
      />
      <section className="section">
        <p className="eyebrow">Open to everyone</p>
        <h1>Watch the Eclipse Guard desk</h1>
        <p className="text-muted-foreground" style={{ maxWidth: '42rem', margin: '12px 0 16px' }}>
          You do not need an account to watch. The grid is volatility indices, metals, major and minor FX pairs, BTC/ETH, and OTC stock indices (US 500, Wall Street 30, UK 100, Japan 225, and the rest). Not Boom, Crash or Step. Charts: 5m, 10m, 15m, 30m, 1h, 2h, 4h, 8h and daily. Demo funds only. Partner link {affiliateConfig.primaryAffiliateLink} · referral {affiliateConfig.referralCode}.
        </p>
        <div className="page-share">
          <ShareBar
            url="https://iederees-create.github.io/deriv-affiliate-launchpad-template/lab"
            title="Watch Apex Eclipse Guard — a live Deriv practice desk"
            text="Volatility, metals, FX pairs, BTC/ETH and stock indices. RSI must turn from an extreme, with extra filters. Demo funds only."
          />
        </div>
        <PublicLiveBoard />
      </section>
      <DisclosureBand />
    </>
  );
}
