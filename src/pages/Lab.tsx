import { Seo } from '../components/Seo';
import { DisclosureBand } from '../components/Section';
import { PublicLiveBoard } from '../components/PublicLiveBoard';
import { affiliateConfig } from '../config/affiliateConfig';

export function Lab() {
  return (
    <>
      <Seo
        title={`Live practice test | ${affiliateConfig.brandName}`}
        description="Watch a shared Volatility 75 (1 second) practice run on Deriv demo funds. No login required to watch."
      />
      <section className="section">
        <p className="eyebrow">Open to everyone</p>
        <h1>Watch the practice run</h1>
        <p className="text-muted-foreground" style={{ maxWidth: '40rem', margin: '12px 0 24px' }}>
          You do not need an account to watch. Demo funds only. If you want your own Deriv practice account, use partner link {affiliateConfig.primaryAffiliateLink} and referral code {affiliateConfig.referralCode}.
        </p>
        <PublicLiveBoard />
      </section>
      <DisclosureBand />
    </>
  );
}
