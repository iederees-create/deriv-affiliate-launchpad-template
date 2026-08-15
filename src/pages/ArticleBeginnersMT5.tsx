import { CTA, WhatsAppCTA } from "../components/CTA";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

const sections = [
  {
    heading: "What is Deriv MT5 (DMT5)?",
    body: [
      "MetaTrader 5 (MT5) is the industry standard for Forex and CFD trading. Deriv offers its own specialized version of this platform, known as DMT5, which connects seamlessly to Deriv's servers.",
      "DMT5 allows you to trade traditional Forex, Cryptocurrencies, and exclusively, Deriv's Synthetic Indices. It offers advanced charting, dozens of built-in technical indicators, and supports automated trading through Expert Advisors (EAs)."
    ]
  },
  {
    heading: "Step 1: Creating Your Deriv Account",
    body: [
      "Before you can use DMT5, you need a Deriv account. First, create a standard Deriv account. This acts as your main 'wallet'.",
      "Once you have a Deriv account, you can transfer funds into it, and from there, create a specific DMT5 account. You can create a Demo DMT5 account to practice, or a Real DMT5 account when you are ready to trade with live funds."
    ]
  },
  {
    heading: "Step 2: Downloading and Logging In",
    body: [
      "You can download the DMT5 platform directly from the Deriv dashboard. It is available for Windows, macOS, Android, and iOS. There is also a WebTrader version if you prefer not to install any software.",
      "When you create your DMT5 account, Deriv will give you a Server Name, a Login ID, and ask you to create a Password. Open the MT5 app, go to 'File' -> 'Login to Trade Account', and enter these details exactly as provided."
    ]
  },
  {
    heading: "Step 3: Setting Up Your Charts",
    body: [
      "When you first log in, you will see a 'Market Watch' window on the left. This lists all the available assets you can trade. Right-click anywhere in this window and select 'Show All' to see every available asset, including Volatility Indices and Crash/Boom.",
      "Drag any asset from the Market Watch onto the main screen to open its chart. You can customize the look of the chart by right-clicking it and selecting 'Properties'. Many traders prefer the classic green/red candlestick setup."
    ]
  },
  {
    heading: "Step 4: Placing Your First Trade",
    body: [
      "To place a trade, you can press F9 on your keyboard or click 'New Order' at the top of the screen. This opens the order window.",
      "Here, you must carefully select your 'Volume' (Lot Size). For beginners trading synthetic indices, always use the minimum lot size (e.g., 0.20 for Crash 1000 or 0.001 for V75). Set your Stop Loss and Take Profit levels, and click 'Buy' or 'Sell'.",
      "Your open trades will appear in the 'Toolbox' at the bottom of the screen. You can right-click an open trade to modify its stop loss, or close it to secure your profit or loss."
    ]
  }
];

export function ArticleBeginnersMT5() {
  return (
    <>
      <Seo
        title="A Beginner's Guide to Using Deriv MT5 (DMT5)"
        description="Step-by-step instructions on setting up your Deriv MT5 account, adding indicators, and placing your first trade."
        path="/blog/beginners-guide-deriv-mt5"
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: "A Beginner's Guide to Using Deriv MT5 (DMT5)",
          datePublished: "2026-08-01",
          author: { "@type": "Organization", name: affiliateConfig.brandName },
          publisher: { "@type": "Organization", name: affiliateConfig.brandName }
        }}
      />
      <article className="article">
        <header className="article-header">
          <p className="eyebrow">Platform Guide</p>
          <h1>A Beginner's Guide to Using Deriv MT5 (DMT5)</h1>
          <p>
            Step-by-step instructions on setting up your Deriv MT5 account, adding indicators, and placing your first trade.
          </p>
        </header>
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
          <h2>Ready to set up DMT5?</h2>
          <p>
            Create your account today, download the platform, and start exploring the markets on a $10,000 demo.
          </p>
          <div className="cta-row">
            <CTA href={affiliateConfig.demoAccountLink}>Create Account</CTA>
            <WhatsAppCTA label="Need help setting up?" />
          </div>
        </footer>
      </article>
    </>
  );
}
