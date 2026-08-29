import { CTA, WhatsAppCTA } from "../components/CTA";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";
import { ArticleNarrator } from "../components/ArticleNarrator";

const sections = [
  {
    heading: "The Nature of Crash and Boom",
    body: [
      "Crash and Boom indices are completely unique to the Deriv platform. Unlike normal markets that move in zig-zags, Crash and Boom indices 'tick' slowly in one direction, and then violently 'spike' in the opposite direction.",
      "For example, Crash 1000 ticks upwards slowly, candle by candle, and then suddenly crashes downward with a massive red candle. Boom 1000 ticks downward slowly, and then violently booms upward with a massive green candle.",
      "This unique price action requires a completely different approach to risk management than standard forex trading."
    ]
  },
  {
    heading: "The Stop Loss Dilemma",
    body: [
      "The most important thing to understand about Crash and Boom is how stop losses interact with spikes. If you are trading 'against the spike' (e.g., selling Boom or buying Crash), a sudden spike can jump right past your stop loss.",
      "Because the spike happens in a single tick, there is no price point inside the spike for the broker to close your trade. Your trade will only be closed at the very end of the spike. This means you can lose significantly more than your intended risk amount if you are caught on the wrong side of a spike."
    ]
  },
  {
    heading: "Rule 1: Always Trade With the Spike",
    body: [
      "The safest way to trade Crash and Boom is to 'catch' the spikes rather than trade against them. This means you should look to BUY Boom and SELL Crash.",
      "When you trade with the spike, a spike works in your favor. If you are wrong, the market simply continues to tick slowly against you, allowing your stop loss to be hit exactly where you placed it, with no slippage."
    ]
  },
  {
    heading: "Rule 2: Lot Size Calculation",
    body: [
      "Because of the risk of slippage when trading against the spike, lot sizing is critical. Never use a lot size that would margin call your account if a massive spike occurred.",
      "Always calculate your lot size based on the absolute worst-case scenario. If a 50-point spike happens, what will the monetary loss be? If that number is more than 2% of your account, your lot size is too big."
    ]
  },
  {
    heading: "Rule 3: Avoid Greed During Tick Scalping",
    body: [
      "Many beginners try to 'scalp the ticks'. They sell Boom, hoping to grab 3 or 4 small red candles before a green spike occurs. This works until it doesn't.",
      "A single unexpected spike can wipe out the profits of 20 successful tick scalps. If you insist on scalping ticks, you must have an incredibly strict exit strategy and avoid trading near major support and resistance zones where spikes are highly likely to occur."
    ]
  }
];

export function ArticleRiskManagement() {
  return (
    <>
      <Seo
        title="How to Manage Risk When Trading Crash and Boom"
        description="Learn the hidden dangers of Crash and Boom indices on Deriv, and how to protect your capital from sudden market spikes."
        path="/blog/risk-management-crash-boom-indices"
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: "How to Manage Risk When Trading Crash and Boom",
          datePublished: "2026-08-05",
          author: { "@type": "Organization", name: affiliateConfig.brandName },
          publisher: { "@type": "Organization", name: affiliateConfig.brandName }
        }}
      />
      <article className="article">
        <header className="article-header">
          <p className="eyebrow">Risk Management</p>
          <h1>How to Manage Risk When Trading Crash and Boom</h1>
          <p>
            Crash and Boom indices are unique to Deriv. Learn how to protect your capital from sudden market spikes.
          </p>
        </header>
        <ArticleNarrator title="How to Manage Risk When Trading Crash and Boom" description="Crash and Boom indices are unique to Deriv. Learn how to protect your capital from sudden market spikes." sections={sections} />
        <div className="article-disclaimer">
          {affiliateConfig.disclosureText} {affiliateConfig.riskDisclaimer}
        </div>
        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
        <footer className="article-footer">
          <h2>Practice spike catching risk-free</h2>
          <p>
            The best way to understand Crash and Boom is to watch it happen in real-time. Open a demo account to get comfortable with the price action.
          </p>
          <div className="cta-row">
            <CTA href={affiliateConfig.demoAccountLink}>Open Demo Account</CTA>
            <WhatsAppCTA label="Ask a question" />
          </div>
        </footer>
      </article>
    </>
  );
}
